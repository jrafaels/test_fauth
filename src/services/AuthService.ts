import bcrypt from 'bcryptjs';
import {UserRepository, UserRepositoryImpl} from '../repositories/UserRepository';
import {PasswordRepository, PasswordRepositoryImpl} from '../repositories/PasswordRepository';
import Log from '../config/log';
import path from 'path';
import {Secure} from '../interfaces/auth/Secure';
import TokenService from './TokenService';
import {Login} from '../interfaces/auth/Login';
import GeneralError from '../helpers/GeneralError';
import {TokenType} from '../helpers/enums';
import {Logout} from '../interfaces/auth/Logout';
import {Password} from '../model/Password';
import {Recover} from '../interfaces/auth/Recover';
import {Reset} from '../interfaces/auth/Reset';
import {User} from '../model/User';
import {validatePassword} from "../helpers/validations";

const logger = new Log(path.basename(__filename), 'AUTH');

export default class AuthService {

    private userRepository: UserRepository = new UserRepositoryImpl();
    private passwordRepository: PasswordRepository = new PasswordRepositoryImpl();

    /**
     * Login user on platform.
     * @param body {Login}
     * @param ip of request
     */
    async login(body: any, ip: string): Promise<any> {
        const login: Login = body;

        // Find user
        const user = await this.userRepository.findOneByEmail(login.email);
        if (!user) {
            logger.addEmail(login.email).addIp(login.ip).info('User not found for that email.');
            throw new GeneralError(401, 'Incorrect authentication');
        }

        // Find valid password for that user
        const password = await this.passwordRepository.findActualPasswordForUser(user);
        if (!password) {
            logger.addUserId(user.user_id).addEmail(login.email).addIp(login.ip)
                .warn('Password not found for that user.');
            throw new GeneralError(401, 'Incorrect authentication', user);
        }

        // Compare passwords
        const check: boolean = await this.comparePasswords(login.password, password.password);
        if (!check) {
            logger.addUserId(user.user_id).addEmail(login.email).addIp(login.ip)
                .info('Password incorrect for that user.');
            throw new GeneralError(401, 'Incorrect authentication', user);
        }

        const secure: Secure = {
            user_id: user.user_id,
            email: user.email,
            ip
        };

        // Generate JWT
        const tokenService = new TokenService();
        const jwt = tokenService.generate(secure);
        const refreshJwt = tokenService.generateRefresh(secure);

        logger.addUserId(user.user_id).addEmail(login.email).addIp(login.ip).info('User authenticated successfully.');
        return {id: user.user_id, jwt, refreshJwt};
    }

    /**
     * Logout the user on platform.
     * @param body {Logout}
     * @param ip of request
     */
    async logout(body: any, ip: string): Promise<number> {
        const logout: Logout = body;

        // Find user
        const user = await this.userRepository.findOne(logout.user_id);
        if (!user) {
            logger.addUserId(logout.user_id).addIp(ip).info('User not found for that id.');
            throw new GeneralError(404, 'User not found.');
        }

        // Set tokens on db
        const tokenService = new TokenService();
        const result = await tokenService.saveToken(logout.token, TokenType.NORMAL);
        const otherResult = await tokenService.saveToken(logout.refreshToken, TokenType.REFRESH);

        if (!result || !otherResult) {
            // Cannot do logout
            logger.addUserId(logout.user_id).addEmail(user.email).addIp(ip).warn('User logout failed.');
            throw new GeneralError(500, 'Incorrect authentication', user);
        } else {
            logger.addUserId(logout.user_id).addEmail(user.email).addIp(ip).info('User logout successfully');
            return user.user_id;
        }
    }

    /**
     * Generate a new password for user and request to send an email.
     * @param body {Recover}
     * @param ip of request
     */
    async recoverPassword(body: any, ip: string): Promise<any> {
        const recover: Recover = body;

        // Find user by email
        const user = await this.userRepository.findOneByEmail(recover.email);
        if (!user) {
            logger.addEmail(recover.email).addIp(ip).info('User not found for that email.');
            throw new GeneralError(404, 'User not founded.');
        }

        // Update old password with end_date
        const oldPassword: Password = await this.passwordRepository.findActualPasswordForUser(user);
        const newPassword = await this.passwordRepository.updateOldPasswordToNew(oldPassword, user, null);

        if (newPassword) {
            // Password updated
            logger.addIp(ip).addUserId(newPassword.user_id).info('Password recovered.');
            return {user, password: newPassword.password};
        } else {
            logger.addIp(ip).addUserId(oldPassword.user_id).addEmail(user.email).warn('Problem on password recover.');
            throw new GeneralError(400, 'Problem recover password.', user);
        }
    }

    /**
     * Update the password of user with a new one, if and only if (iff), was requested the recover. The new password
     * is given by the user.
     * @param body {Reset}
     * @param ip of request
     */
    async resetPassword(body: any, ip: string): Promise<User> {
        const reset: Reset = body;

        const password = await this.passwordRepository.findOne(reset.controlPassword);
        if (password == null) {
            logger.addIp(ip).info('Control password not founded: ' + reset.controlPassword);
            throw new GeneralError(400, 'Control password not found.');
        }

        if (new Date(Date.now()) > password.end_date) {
            // Time to reset password expired
            logger.addIp(ip).addUserId(password.user_id).info('Control password expired');
            throw new GeneralError(400, 'Control password expired.');
        }

        // Find user
        const user = await this.userRepository.findOne(password.user_id);
        if (!user) {
            logger.addUserId(password.user_id).addIp(ip).warn('User not found for that id.');
            throw new GeneralError(500, 'User not found.');
        }

        const newPassword = await this.passwordRepository.updateOldPasswordToNew(password, user, reset.password);
        await validatePassword(newPassword, reset.password);

        if (newPassword) {
            // Password updated
            logger.addIp(ip).addUserId(user.user_id).addEmail(user.email).info('Password reset.');
            return user;
        } else {
            logger.addIp(ip).addUserId(user.user_id).addEmail(user.email).warn('Problem on password reset.');
            throw new GeneralError(500, 'Problem on reset password.', user);
        }
    }

    /**
     * Compare two encrypted passwords.
     * @param password not encrypted
     * @param hashPassword encrypted
     * @return true if equal, false otherwise
     */
    async comparePasswords(password: string, hashPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashPassword)
            .then(match => {
                return match;
            })
            .catch(error => {
                throw error;
            });
    }
}