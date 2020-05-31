import sequelize from "../../config/connection";
import TokenService from "../../services/TokenService";
import {Secure} from "../../interfaces/auth/Secure";
import GeneralError from "../../helpers/GeneralError";
import {TokenType} from "../../helpers/enums";
import {TokenRepositoryImpl} from "../../repositories/TokenRepository";
import UserService from "../../services/UserService";
import {TokenExpired} from "../../model/TokenExpired";
import {User} from "../../model/User";

const tokenService = new TokenService();

describe('Token service', () => {

    let user: User;
    let secure: Secure;

    beforeAll(async done => {
        await sequelize().sync({force: true});
        user = await new UserService().createNewUser({
            user: {
                first_name: 'Joao',
                last_name: 'Costa',
                email: 'buebom@exemplo.com'
            },
            password: '1234567890q'
        }, '127.0.0.1');
        secure = {
            user_id: user.user_id,
            email: 'buebom@exemplo.com',
            ip: '127.0.0.1'
        };
        done();
    });

    afterAll(async done => {
        user.destroy();
        await sequelize().close();
        done();
    });

    describe('Create new token using refreshToken', () => {

        let refreshToken: string;

        beforeAll(() => {
            refreshToken = tokenService.generateRefresh(secure);
        });

        it('create new token successfully', async done => {
            const body = {
                refreshToken
            };
            const ip = '127.0.0.1';
            const result = await tokenService.newToken(body, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result.id).not.toBe(null);
            expect(result.id).not.toBe(undefined);
            expect(result.id).toEqual(secure.user_id);
            expect(result.newToken).not.toBe(null);
            expect(result.newToken).not.toBe(undefined);

            const otherResult = await tokenService.validate(result.newToken);
            expect(otherResult).not.toBe(null);
            expect(otherResult).not.toBe(undefined);
            expect(otherResult.user_id).toEqual(secure.user_id);
            expect(otherResult.email).toEqual(secure.email);
            expect(otherResult.ip).toEqual(secure.ip);
            done();
        });

        it('should fail, was given a null refreshToken', async done => {
            const body = {
                refreshToken: null
            };
            const ip = '127.0.0.1';
            try {
                await tokenService.newToken(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(400);
                expect(e.message).toEqual('Token cannot be empty.');
            }
            done();
        });

        it('should fail, was given an invalid refreshToken', async done => {
            const body = {
                refreshToken: '1234gdgsgsdgsgdsgdg5.sdgsgsgsgrg.segsgsgtregs'
            };
            const ip = '127.0.0.1';
            try {
                await tokenService.newToken(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(403);
                expect(e.message).toEqual('Invalid token.');
            }
            done();
        });

        it('should fail, was given a disable refreshToken', async done => {
            const body = {
                refreshToken
            };
            const ip = '127.0.0.1';

            await tokenService.saveToken(refreshToken, TokenType.REFRESH);
            const tokenSaved = await new TokenRepositoryImpl().findOne(refreshToken);
            expect(tokenSaved).not.toBe(null);
            expect(tokenSaved).not.toBe(undefined);
            expect(tokenSaved.text).toEqual(refreshToken);

            try {
                await tokenService.newToken(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(403);
                expect(e.message).toEqual('Token not valid. User already did logout.');
            }
            done();
        });
    });

    describe('Generate and validate tokens', () => {
        it('generate and validate token successfully', () => {
            const result = tokenService.generate(secure);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);

            const otherResult = tokenService.validate(result);
            expect(otherResult).not.toBe(undefined);
            expect(otherResult).not.toBe(null);
            expect(otherResult.user_id).toEqual(secure.user_id);
            expect(otherResult.email).toEqual(secure.email);
            expect(otherResult.ip).toEqual(secure.ip);
        });

        it('generate and validate refreshToken successfully',  () => {
            const result = tokenService.generateRefresh(secure);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);

            const otherResult = tokenService.validateRefresh(result);
            expect(otherResult).not.toBe(undefined);
            expect(otherResult).not.toBe(null);
            expect(otherResult.email).toEqual(secure.email);
            expect(otherResult.user_id).toEqual(secure.user_id);
            expect(otherResult.ip).toEqual(secure.ip);
        });
    });

    describe('Save token', () => {
        it('save normal token successfully', async done => {
            const token = tokenService.generate(secure);
            tokenService.validate(token);
            const result = await tokenService.saveToken(token, TokenType.NORMAL);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(true);
            const otherResult = await new TokenRepositoryImpl().findOne(token);
            expect(otherResult).not.toBe(null);
            expect(otherResult).not.toBe(undefined);
            expect(otherResult).toBeInstanceOf(TokenExpired);
            expect(otherResult.text).toEqual(token);
            done();
        });

        it('save refresh token successfully', async done => {
            const token = tokenService.generateRefresh(secure);
            tokenService.validateRefresh(token);
            const result = await tokenService.saveToken(token, TokenType.REFRESH);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(true);
            const otherResult = await new TokenRepositoryImpl().findOne(token);
            expect(otherResult).not.toBe(undefined);
            expect(otherResult).not.toBe(null);
            expect(otherResult).toBeInstanceOf(TokenExpired);
            expect(otherResult.text).toEqual(token);
            done();
        });

        it('should fail, was gien an invalid refresh token', async done => {
            const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6Im1hcmlvQGNvcm9uYS5jb20iLCJ' +
                'pcCI6Ijo6ZmZmZjoxMjcuMC4wLjEiLCJpYXQiOjE1ODk4MzEyODksImV4cCI6MTU4OTkxNzY4OX0.QwYNfXRadketNnC6_1JxoTNgs' +
                'H9Ir6WsYsOMltZt-dijzG88Sx8X_um4pqEVflY4qFfmDfQyINhEdXnDoT14L0rAJHPONYGAVtm7sF1TNtYEGHqHLX1fYQUuzSBDObW' +
                'ROs1IKmYqWrF_FxNieOKWT20hLHDQX108q3asGAe-Yg4';
            try {
                await tokenService.saveToken(token, TokenType.REFRESH);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(401);
                expect(e.message).toEqual('jwt expired');
            }
            done();
        });
    });

});