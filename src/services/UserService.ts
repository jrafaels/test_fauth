import {User} from '../model/User';
import {Password} from '../model/Password';
import sequelize from '../config/connection';
import {LogService} from './LogService';
import {LogType} from '../helpers/enums';
import Log from '../config/log';
import {PasswordService} from './PasswordService';
import {validateCreateUser, validateUpdateUser} from '../helpers/validations'
import {UserRepository, UserRepositoryImpl} from '../repositories/UserRepository';
import {PasswordRepository, PasswordRepositoryImpl} from '../repositories/PasswordRepository';
import path from 'path';
import GeneralError from '../helpers/GeneralError';
import {CreateUser} from '../interfaces/user/CreateUser';
import {Update} from '../interfaces/user/Update';

const logger = new Log(path.basename(__filename), 'USER');

export default class UserService {

    private userRepository: UserRepository = new UserRepositoryImpl();
    private passwordRepository: PasswordRepository = new PasswordRepositoryImpl();

    /**
     * Create a new {User} and save it on database
     * @param body {CreateUser}
     * @param ip of request
     */
    async createNewUser(body: any, ip: string): Promise<User> {
        const create: CreateUser = body;
        const user: User = new User(create.user);

        const passwordService = new PasswordService();
        const password: Password = passwordService.createPasswordToNewUser(create.password, user);

        // Validation
        await validateCreateUser(user, password, create.password);
        if (await this.userRepository.findOneByEmail(user.email)) {
            throw new GeneralError(400, 'Email already used.');
        }

        return sequelize().transaction(async (t) => {
            // Create user
            const newUser: User = await this.userRepository.create(user, {transaction: t});
            if (newUser == null) {
                throw new Error('Error creating user');
            }

            // Create password
            password.user_id = newUser.user_id;
            password.user = newUser;
            const newPassword = await this.passwordRepository.create(password, {transaction: t});
            if (newPassword == null) {
                throw new Error('Error creating password');
            }

            // Create log
            const newLog = await LogService.insertLog(newUser.user_id, LogType.REGISTER_ATTEMPT,
                ip, 'New register', t);
            if (newLog == null) {
                throw new Error('Error creating log of signUp');
            }

            logger.addUserId(newUser.user_id).addEmail(newUser.email).addIp(ip)
                .info('New user created');
            return newUser;
        }).catch(error => {
            throw new GeneralError(500, error.message, user);
        });
    }

    /**
     * Update information of user on database. Information to update must be given by parameter,
     * and is not necessary that all fields of that object be filled (except the field user_id).
     *
     * @param params that must be contain the id
     * @param body with user information in json format
     * @param ip of request
     *
     * @return user_id if successfully updated, null otherwise
     */
    async updateUser(params: any, body: any, ip: string): Promise<number | null> {
        const update: Update = body;

        const user_id = Number(params.id);
        if (!user_id) {
            throw new GeneralError(400, 'User_id not valid: ' + user_id);
        }

        const user = await this.userRepository.findOne(user_id);
        if (user == null) {
            throw new GeneralError(404, 'User not founded with id: ' + user_id);
        }

        await validateUpdateUser(body);

        const result = await this.userRepository.update(user, update);
        if (result) {
            logger.addUserId(user.user_id).addEmail(user.email).addIp(ip).info('User updated.');
            return user.user_id;
        } else {
            logger.addUserId(user.user_id).addEmail(user.email).addIp(ip).warn('User not updated.');
            return null;
        }

    }

    /**
     * Get all users.
     */
    async findAll(ip: string): Promise<User[] | null> {
        const users = await this.userRepository.findAll();
        if (users != null && users.length > 0) {
            logger.addIp(ip).info('Users founded.');
            return users;
        } else {
            logger.addIp(ip).info('Users not found.');
            return null;
        }
    }

    /**
     * Get user by id.
     * @param params that must be contain the id
     * @param ip of request
     */
    async findOne(params: any, ip: string): Promise<User | null> {
        const user_id = Number(params.id);
        if (!user_id) {
            throw new GeneralError(400, 'User_id not valid: ' + user_id);
        }

        const user = await this.userRepository.findOne(user_id);
        if (user != null) {
            logger.addUserId(user.user_id).addEmail(user.email).addIp(ip).info('User founded.');
            return user;
        } else {
            logger.addUserId(user_id).info('User not founded.');
            return null;
        }
    }

    /**
     * Get user by email.
     * @param query
     * @param ip
     */
    async findOneByEmail(query: any, ip: string): Promise<User | null> {
        const email: string = query.email;
        if (!email) {
            throw new GeneralError(400, 'Email not valid: ' + email);
        }

        const user = await this.userRepository.findOneByEmail(email);
        if (user != null) {
            logger.addUserId(user.user_id).addEmail(user.email).addIp(ip).info('User founded.');
            return user;
        } else {
            logger.addEmail(email).info('User not founded.');
            return null;
        }
    }

    /**
     * 'Delete' an user from database. The field deleted_at will be updated with the actual time,
     * and the fields first_name, last_name and email will be filled with trash.
     *
     * Actually, the user is not deleted. Otherwise, all sensible data is destroyed.
     *
     * @param params that must be contain the id
     * @param ip of request
     */
    async deleteUser(params: any, ip: string): Promise<number> {
        const user_id = Number(params.id);
        if (!user_id) {
            throw new GeneralError(400, 'User_id not valid: ' + params.id);
        }

        const user = await this.userRepository.findOne(user_id);
        if (user == null) {
            throw new GeneralError(404, 'User not founded with id: ' + user_id);
        }

        return sequelize().transaction(async (t) => {
            // Update sensible data
            const userToUpdate = new User({
                first_name: 'DELETED',
                last_name: 'DELETED',
                email: 'DELETED@DELETED.COM'
            });

            const result = await this.userRepository.update(user, userToUpdate, {transaction: t});
            if (!result) {
                throw new Error('User not deleted on updated');
            }

            this.userRepository.delete(user, {transaction: t});
            logger.addUserId(user.user_id).addEmail(user.email).addIp(ip).info('User deleted successfully');
            return user.user_id;
        }).catch(error => {
            throw new GeneralError(500, error, user);
        })
    }
}