import {User} from "../../model/User";
import AuthService from "../../services/AuthService";
import sequelize from "../../config/connection";
import UserService from "../../services/UserService";
import GeneralError from "../../helpers/GeneralError";
import {Password} from "../../model/Password";
import {PasswordService} from "../../services/PasswordService";
import {PasswordRepository, PasswordRepositoryImpl} from "../../repositories/PasswordRepository";

const authService = new AuthService();

describe('Auth service', () => {

    let user: User;

    beforeAll(async done => {
        await sequelize().sync({force: true});
        user = await new UserService().createNewUser({
            user: {
                first_name: 'Joao',
                last_name: 'Costa',
                email: 'bembom@exemplo.com'
            },
            password: '1234567890q'
        }, '127.0.0.1');
        done();
    });

    afterAll(async (done) => {
        await sequelize().close();
        done();
    });

    describe('login', () => {

        it('do login successfully', async done => {
            const body = {
                email: 'bembom@exemplo.com',
                password: '1234567890q'
            };
            const ip = '127.0.0.1';
            const result = await authService.login(body, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result.id).toEqual(user.user_id);
            expect(result.jwt).not.toBe(null);
            expect(result.jwt).not.toBe(undefined);
            expect(result.refreshJwt).not.toBe(null);
            expect(result.refreshJwt).not.toBe(undefined);
            done();
        });

        it('should fail, email not found', async done => {
            const body = {
                email: 'bembomseria@exemplo.com',
                password: '1234567890q'
            };
            const ip = '127.0.0.1';
            try {
                await authService.login(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(401);
                expect(e.message).toEqual('Incorrect authentication');
            }
            done();
        });

        it('should fail, password not found', async done => {
            const otherUser = await new UserService().createNewUser({
                user: {
                    first_name: 'Joao',
                    last_name: 'Costa',
                    email: 'bomdia@exemplo.com'
                },
                password: '1234567890q'
            }, '127.0.0.1');

            const body = {
                email: 'bomdia@exemplo.com',
                password: '1234567890q'
            };
            const ip = '127.0.0.1';
            const password = await new PasswordRepositoryImpl().findActualPasswordForUser(otherUser);
            await password.destroy();

            try {
                await authService.login(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(401);
                expect(e.message).toEqual('Incorrect authentication');
            }
            otherUser.destroy();
            done();
        });

        it('should fail, incorrect password', async done => {
            const body = {
                email: 'bembom@exemplo.com',
                password: 'cenasbonitas'
            };
            const ip = '127.0.0.1';

            try {
                await authService.login(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(401);
                expect(e.message).toEqual('Incorrect authentication');
            }
            done();
        });

        it('should fail, email field is empty', async done => {
            const body = {
                email: '',
                password: 'cenasbonitas'
            };
            const ip = '127.0.0.1';

            try {
                await authService.login(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(401);
                expect(e.message).toEqual('Incorrect authentication');
            }
            done();
        });
    });

    describe('logout', () => {

        let token: string;
        let refreshToken: string;

        beforeEach(async done => {
            const body = {
                email: 'bembom@exemplo.com',
                password: '1234567890q'
            };
            const ip = '127.0.0.1';
            const result = await authService.login(body, ip);
            token = result.jwt;
            refreshToken = result.refreshJwt;
            done();
        });

        it('do logout successfully', async done => {
            const body = {
                user_id: user.user_id,
                token: token,
                refreshToken: refreshToken
            };
            const ip = '127.0.0.1';
            const result = await authService.logout(body, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(user.user_id);
            done();
        });

        it('should fail, user id given was not found', async done => {
            const body = {
                user_id: 700,
                token: token,
                refreshToken: refreshToken
            };
            const ip = '127.0.0.1';

            try {
                await authService.logout(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(404);
                expect(e.message).toEqual('User not found.');
            }
            done();
        });

        it('should fail, was given an invalid token', async done => {
            const body = {
                user_id: user.user_id,
                token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6Im1hcmlvQGNvcm9uYS5jb20iLC' +
                    'JpcCI6Ijo6ZmZmZjoxMjcuMC4wLjEiLCJpYXQiOjE1OTA1MTM0MTgsImV4cCI6MTU5MDUxNTIxOH0.N4cTA9eUetVkqqsG' +
                    'LXtzl9lo93AVL4n-OS1qQ3uMRnIrBIQLQeD55Z7wRU6qeTyBbqgAtH-oAMpve8VecSfHMPtTkHOvzM6mpWE7WS75nJn-Cm' +
                    'urER4EmYVb1QcoYNMZ7I6B-K3u0mc5JSoqXexF65lDb1OfDemZMP_eDd30XDs',
                refreshToken: refreshToken
            };
            const ip = '127.0.0.1';

            try {
                await authService.logout(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(401);
                expect(e.message).toEqual('jwt expired');
            }
            done();
        });

        it('should fail, was given an invalid refresh token', async done => {
            const body = {
                user_id: user.user_id,
                token: token,
                refreshToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6Im1hcmlvQGNvcm9uYS5jb20iLCJ' +
                    'pcCI6Ijo6ZmZmZjoxMjcuMC4wLjEiLCJpYXQiOjE1ODk4MzEyODksImV4cCI6MTU4OTkxNzY4OX0.QwYNfXRadketNnC6_1JxoTNgs' +
                    'H9Ir6WsYsOMltZt-dijzG88Sx8X_um4pqEVflY4qFfmDfQyINhEdXnDoT14L0rAJHPONYGAVtm7sF1TNtYEGHqHLX1fYQUuzSBDObW' +
                    'ROs1IKmYqWrF_FxNieOKWT20hLHDQX108q3asGAe-Yg4'
            };
            const ip = '127.0.0.1';

            try {
                await authService.logout(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(401);
                expect(e.message).toEqual('jwt expired');
            }
            done();
        });

    });

    describe('recover password', () => {

        it('recover successfully', async done => {
            const body = {email: 'bembom@exemplo.com'}
            const ip = '127.0.0.1';
            const result = await authService.recoverPassword(body, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result.user).toBeInstanceOf(User);
            expect(result.password).not.toBe(null);
            expect(result.password).not.toBe(undefined);
            done();
        });

        it('should fail, email not found', async done => {
            const body = {email: 'bembomm@exemplo.com'}
            const ip = '127.0.0.1';
            try {
                await authService.recoverPassword(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(404);
                expect(e.message).toEqual('User not founded.');
            }
            done();
        });
    });

    describe('reset password', () => {

        it('reset successfully', async done => {
            const passwordRepository: PasswordRepository = new PasswordRepositoryImpl();
            const oldPassword: Password = await passwordRepository.findActualPasswordForUser(user);
            const password = await passwordRepository.updateOldPasswordToNew(oldPassword, user, null);
            const body = {
                controlPassword: password.password,
                password: '123456789098'
            }
            const ip = '127.0.0.1';
            const result = await authService.resetPassword(body, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toBeInstanceOf(User);
            done();
        });

        it('should fail, was given an invalid control password', async done => {
            const body = {
                controlPassword: 'sdhgfjsdgfiasfgbsagh',
                password: '123456789098'
            }
            const ip = '127.0.0.1';
            try {
                await authService.resetPassword(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(400);
                expect(e.message).toEqual('Control password not found.');
            }
            done();
        });

        it('should fail, was given an expired control password', async done => {
            const otherUser = await new UserService().createNewUser({
                user: {
                    first_name: 'Joao',
                    last_name: 'Costa',
                    email: 'jantar@exemplo.com'
                },
                password: '1234567890q'
            }, '127.0.0.1');
            const passwordRepository: PasswordRepository = new PasswordRepositoryImpl();
            const oldPassword: Password = await passwordRepository.findActualPasswordForUser(otherUser);
            const password = await passwordRepository.updateOldPasswordToNew(oldPassword, otherUser, null);
            const body = {
                controlPassword: password.password,
                password: '123456789098'
            }
            const ip = '127.0.0.1';

            password.end_date = await new Date(Date.now());
            await password.save();

            try {
                await authService.resetPassword(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(400);
                expect(e.message).toEqual('Control password expired.');
            }
            done();
        });

        it('should fail, user not found', async done => {
            const otherUser = await new UserService().createNewUser({
                user: {
                    first_name: 'Joao',
                    last_name: 'Costa',
                    email: 'almoco@exemplo.com'
                },
                password: '1234567890q'
            }, '127.0.0.1');
            const passwordRepository: PasswordRepository = new PasswordRepositoryImpl();
            const oldPassword: Password = await passwordRepository.findActualPasswordForUser(otherUser);
            const password = await passwordRepository.updateOldPasswordToNew(oldPassword, otherUser, null);

            const body = {
                controlPassword: password.password,
                password: '123456789098'
            }
            const ip = '127.0.0.1';

            await otherUser.destroy();

            try {
                await authService.resetPassword(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.status).toEqual(500);
                expect(e.message).toEqual('User not found.');
            }
            done();
        });

        it('should fail, the new password dont pass on validation', async done => {
            const passwordRepository: PasswordRepository = new PasswordRepositoryImpl();
            const oldPassword: Password = await passwordRepository.findActualPasswordForUser(user);
            const password = await passwordRepository.updateOldPasswordToNew(oldPassword, user, null);
            const body = {
                controlPassword: password.password,
                password: '1234'
            }
            const ip = '127.0.0.1';

            try {
                await authService.resetPassword(body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Password must be have at least 10 characters.');
                expect(e.status).toEqual(400);
            }
            done();
        });
    });

    describe('compare passwords', () => {
        it('compare two passwords successfully', async done => {
            const password = new PasswordService().createPasswordToNewUser('abramAlasAoNoddy', user);
            const result = await authService.comparePasswords('abramAlasAoNoddy', password.password);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(true);
            done();
        });

        it('should fail, compare two different passwords', async done => {
            const password = new PasswordService().createPasswordToNewUser('abramAlasAoNoddy', user);
            const result = await authService.comparePasswords('MaiaVoaSemParar', password.password);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(false);
            done();
        })
    })
});
