import jwt, {SignOptions, TokenExpiredError} from 'jsonwebtoken';
import fs from 'fs';
import {TokenType} from '../helpers/enums';
import {TokenExpired} from '../model/TokenExpired';
import {Secure} from '../interfaces/auth/Secure';
import {TokenRepository, TokenRepositoryImpl} from '../repositories/TokenRepository';
import Log from '../config/log';
import path from 'path';
import GeneralError from '../helpers/GeneralError';
import {NewToken} from '../interfaces/token/NewToken';

const privateKey = fs.readFileSync('./keys/private.key', 'utf8');
const publicKey = fs.readFileSync('./keys/public.key', 'utf8');
const privateRefreshKey = fs.readFileSync('./keys/refreshPrivate.key', 'utf8');
const publicRefreshKey = fs.readFileSync('./keys/refreshPublic.key', 'utf8');

const signOptions: SignOptions = {
    expiresIn: '30m',
    algorithm: 'RS256'
};

const signRefreshOptions: SignOptions = {
    expiresIn: '1d',
    algorithm: 'RS256'
};

const logger = new Log(path.basename(__filename), 'TOKEN');

export default class TokenService {

    private tokenRepository: TokenRepository = new TokenRepositoryImpl();

    async newToken(body: any, ip: string): Promise<any> {
        const tokenNew: NewToken = body;

        if (tokenNew.refreshToken == null) {
            logger.addIp(ip).info('Token not sent on body.');
            throw new GeneralError(400, 'Token cannot be empty.');
        }

        const tokenDisabled = await this.tokenRepository.findOne(tokenNew.refreshToken);
        if (tokenDisabled) {
            // Token is disable
            logger.addIp(ip).addUserId(tokenDisabled.user_id).info('Token not valid. User already did logout.');
            throw new GeneralError(403, 'Token not valid. User already did logout.');
        }
        try {
            const validate = this.validateRefresh(tokenNew.refreshToken);
            if (validate) {
                // Refresh token valid. Send new token
                const secure: Secure = {
                    user_id: validate.user_id,
                    email: validate.email,
                    ip
                };

                const newToken = this.generate(secure);
                logger.addIp(ip).addUserId(secure.user_id).addEmail(secure.email)
                    .info('Token not valid. User already did logout.');
                return {
                    id: secure.user_id,
                    newToken
                };
            }else{
                //Something wrong
                logger.addIp(ip).warn('Something wrong on validate RefreshToken: '+validate);
                throw new GeneralError(403, 'Something wrong on validate RefreshToken');
            }
        } catch (e) {
            // Invalid token
            logger.addIp(ip).info('Invalid token: ' + e);
            throw new GeneralError(403, 'Invalid token.');
        }
    }

    /**
     * Generate a new JWT token.
     * @param login
     */
    generate(login: Secure): string {
        return jwt.sign(login, privateKey, signOptions);
    }

    /**
     * Generate a new refresh JWT token.
     * @param login
     */
    generateRefresh(login: Secure): string {
        return jwt.sign(login, privateRefreshKey, signRefreshOptions);
    }

    /**
     * Verify if a JWT token is valid.
     * @param token
     */
    validate(token: string): any {
        return jwt.verify(token, publicKey);
    }

    /**
     * Verify if a refresh JWT token is valid.
     * @param token
     */
    validateRefresh(token: string): any {
        return jwt.verify(token, publicRefreshKey);
    }

    /**
     * Save an invalid token on database.
     * @param token to invalidate
     * @param type of token {TokenType}
     */
    async saveToken(token: string, type: TokenType): Promise<boolean> {
        let decode;
        try {
            if (type === TokenType.NORMAL) {
                decode = this.validate(token);
            } else {
                decode = this.validateRefresh(token);
            }
        }catch (error) {
            if(error instanceof TokenExpiredError){
                throw new GeneralError(401, error.message);
            }else{
                throw new GeneralError(500, error);
            }
        }

        const tokenToSave = new TokenExpired({
            user_id: decode.user_id,
            text: token,
            end_date: new Date(decode.exp),
            type: type.toString()
        });

        const newToken = await this.tokenRepository.create(tokenToSave);
        return !!newToken;
    }
}