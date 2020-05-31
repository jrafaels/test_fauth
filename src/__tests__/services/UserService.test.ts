import UserService from "../../services/UserService";
import sequelize from "../../config/connection";
import {User} from "../../model/User";
import GeneralError from "../../helpers/GeneralError";
import iconvLite from 'iconv-lite'

iconvLite.encodingExists('foo');

const userService: UserService = new UserService();

describe('User service', () => {

    beforeAll(async done => {
        await sequelize().sync({force: true});
        done();
    });

    afterAll(async (done) => {
        await sequelize().close();
        done();
    });

    describe('Create new user', () => {
        it('User created successfully with required fields', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail1@exemplo.com'
                },
                password: 'umasenhabonita1'
            };
            const ip = '127.0.0.1';

            const result = await userService.createNewUser(body, ip);
            expect(result).toBeInstanceOf(User);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result.first_name).toEqual(body.user.first_name);
            await result.destroy();
            done();
        });

        it('User created successfully with required fields and some optional', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail2@exemplo.com',
                    country: 'Portugal'
                },
                password: 'umasenhabonita1'
            };
            const ip = '127.0.0.1';

            const result = await userService.createNewUser(body, ip);
            expect(result).toBeInstanceOf(User);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result.first_name).toEqual(body.user.first_name);
            await result.destroy();
            done();
        });

        it('User created successfully with required fields and all optional', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail3@exemplo.com',
                    country: 'Portugal',
                    city: 'Lisbon',
                    birth_date: '01-01-1990'
                },
                password: 'umasenhabonita1'
            };
            const ip = '127.0.0.1';

            const result = await userService.createNewUser(body, ip);
            expect(result).toBeInstanceOf(User);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result.first_name).toEqual(body.user.first_name);
            await result.destroy();
            done();
        });

        it('should fail, was given an invalid country', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail4@exemplo.com',
                    country: 'Curva'
                },
                password: 'umasenhabonita1'
            };
            const ip = '127.0.0.1';

            try {
                const result = await userService.createNewUser(body, ip);
                await result.destroy();
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Invalid country: Curva');
            }
            done();
        });

        it('should fail, was given an invalid birth date', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail5@exemplo.com',
                    country: 'Portugal',
                    birth_date: '123454321'
                },
                password: 'umasenhabonita1'
            };
            const ip = '127.0.0.1';

            try {
                const result = await userService.createNewUser(body, ip);
                await result.destroy();
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('User validation error');
                expect(e.getValidationsError()).not.toBe(undefined);
                expect(e.getValidationsError().length).toEqual(1);
                expect(e.getValidationsError()[0].field).toEqual('birth_date');
                expect(e.getValidationsError()[0].message).toEqual('Validation isDate on birth_date failed');
            }
            done();
        });

        it('should fail, was given an password that not passed on validation', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail6@exemplo.com',
                    country: 'Angola',
                    birth_date: '09-10-2000'
                },
                password: '145ghf'
            };
            const ip = '127.0.0.1';

            try {
                const result = await userService.createNewUser(body, ip);
                await result.destroy();
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Password must be have at least 10 characters.');
            }
            done();
        });

        it('should fail, was given a null password', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail7@exemplo.com',
                    country: 'Angola',
                    birth_date: '09-10-2000'
                }
            };
            const ip = '127.0.0.1';

            try {
                const result = await userService.createNewUser(body, ip);
                await result.destroy();
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Invalid password');
            }
            done();
        });

        it('should fail, was passed an email that is already registered', async done => {
            const body = {
                user: {
                    first_name: 'Mario',
                    last_name: 'Jorge',
                    email: 'umemail8@exemplo.com'
                },
                password: 'umasenhabonita1'
            };
            const ip = '127.0.0.1';

            const result = await userService.createNewUser(body, ip);
            expect(result).toBeInstanceOf(User);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result.first_name).toEqual(body.user.first_name);

            try {
                const otherResult = await userService.createNewUser(body, ip);
                await otherResult.destroy();
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Email already used.');
            }
            await result.destroy();
            done();
        });
    });

    describe('Update new user', () => {

        let user: User;

        beforeAll(async done => {
            user = await userService.createNewUser({
                    user: {
                        first_name: 'Mario',
                        last_name: 'Jorge',
                        email: 'outro@exemplo.com'
                    },
                    password: 'umasenhabonita1'
                },
                '127.0.0.1');
            done();
        });

        afterAll(async done => {
            await user.destroy();
            done();
        });

        it('Update required fields successfully', async done => {
            const body = {
                first_name: 'Manuel',
                last_name: 'Jaquim'
            };
            const ip = '127.0.0.1';
            const params = {
                id: user.user_id
            };
            const result = await userService.updateUser(params, body, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(user.user_id);
            done();
        });

        it('should fail, was given an empty required field', async done => {
            const body = {
                first_name: 'Manuel',
                last_name: ''
            };
            const ip = '127.0.0.1';
            const params = {
                id: user.user_id
            };
            try {
                await userService.updateUser(params, body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Update user validation error');
                expect(e.getValidationsError()).not.toBe(undefined);
                expect(e.getValidationsError().length).toEqual(1);
                expect(e.getValidationsError()[0].field).toEqual('last_name');
                expect(e.getValidationsError()[0].message).toEqual('Validation notEmpty on last_name failed');
            }
            done();
        });

        it('was given a different user id, that will be ignored', async done => {
            const body = {
                user_id: 50,
                first_name: 'Manuel',
                country: 'Angola'
            };
            const ip = '127.0.0.1';
            const params = {
                id: user.user_id
            };
            const result = await userService.updateUser(params, body, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(user.user_id);
            done();
        });

        it('should fail, user not found', async done => {
            const body = {
                first_name: 'Manuel',
                country: 'Angola'
            };
            const ip = '127.0.0.1';
            const params = {
                id: 800
            };
            try {
                await userService.updateUser(params, body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('User not founded with id: 800');
            }
            done();
        });

        it('should fail, was given an invalid country', async done => {
            const body = {
                user_id: 5,
                first_name: 'Manuel',
                country: 'Barcelona'
            };
            const ip = '127.0.0.1';
            const params = {
                id: user.user_id
            };
            try {
                await userService.updateUser(params, body, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Invalid country: Barcelona');
            }
            done();
        });

    });

    describe('Delete user', () => {
        let user: User;

        beforeEach(async done => {
            user = await userService.createNewUser({
                    user: {
                        first_name: 'Mario',
                        last_name: 'Jorge',
                        email: 'uma@exemplo.com'
                    },
                    password: 'umasenhabonita1'
                },
                '127.0.0.1');
            done();
        });

        afterEach(async done => {
            await user.destroy();
            done();
        });

        it('Delete user successfully ', async done => {
            const params = {
                id: user.user_id
            };
            const ip = '127.0.0.1';

            const result = await userService.deleteUser(params, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toEqual(user.user_id);
            done();
        });

        it('should fail, user not found', async done => {
            const params = {
                id: 200
            };
            const ip = '127.0.0.1';

            try {
                await userService.deleteUser(params, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('User not founded with id: 200');
                expect(e.status).toEqual(404);
            }
            done();
        });

        it('should fail, was given an invalid user id', async done => {
            const params = {
                id: 'foo'
            };
            const ip = '127.0.0.1';

            try {
                await userService.deleteUser(params, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('User_id not valid: foo');
                expect(e.status).toEqual(400);
            }
            done();
        });
    });

    describe('Find all users', () => {

        it('Find all users successfully ', async done => {
            const a = await userService.createNewUser({
                    user: {
                        first_name: 'Jorge',
                        last_name: 'Mario',
                        email: 'emailum@exemplo.com'
                    },
                    password: 'umasenhabonita1'
                },
                '127.0.0.1');
            const b = await userService.createNewUser({
                    user: {
                        first_name: 'Mario',
                        last_name: 'Jorge',
                        email: 'emaildois@exemplo.com'
                    },
                    password: 'umasenhabonita1'
                },
                '127.0.0.1');
            const c = await userService.createNewUser({
                    user: {
                        first_name: 'Costa',
                        last_name: 'Jorge',
                        email: 'emailtres@exemplo.com'
                    },
                    password: 'umasenhabonita1'
                },
                '127.0.0.1');
            const ip = '127.0.0.1';

            const result = await userService.findAll(ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result?.length).toEqual(3);
            await a.destroy();
            await b.destroy();
            await c.destroy();
            done();
        });

        it('No users found', async done => {
            const ip = '127.0.0.1';
            const result = await userService.findAll(ip);
            expect(result).toBe(null);
            done();
        });
    });

    describe('Find one user', () => {

        let user: User;

        beforeAll(async done => {
            user = await userService.createNewUser({
                    user: {
                        first_name: 'Jorge',
                        last_name: 'Mario',
                        email: 'sempre@exemplo.com'
                    },
                    password: 'umasenhabonita1'
                },
                '127.0.0.1');
            done();
        });

        afterAll(async done => {
            user.destroy();
            done();
        });

        it('Find one user successfully ', async done => {
            const params = {
                id: user.user_id
            };
            const ip = '127.0.0.1';

            const result = await userService.findOne(params, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toBeInstanceOf(User);
            expect(result?.user_id).toEqual(user.user_id);
            done();
        });

        it('No users found', async done => {
            const params = {
                id: 500
            };
            const ip = '127.0.0.1';

            const result = await userService.findOne(params, ip);
            expect(result).toBe(null);
            done();
        });

        it('should fail, was given an invalid user id', async done => {
            const params = {
                id: 'foo'
            };
            const ip = '127.0.0.1';

            try {
                await userService.deleteUser(params, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('User_id not valid: foo');
                expect(e.status).toEqual(400);
            }
            done();
        });

        it('Find user by email successfully', async done => {
            const query = {
                email: 'sempre@exemplo.com'
            };
            const ip = '127.0.0.1';

            const result = await userService.findOneByEmail(query, ip);
            expect(result).not.toBe(null);
            expect(result).not.toBe(undefined);
            expect(result).toBeInstanceOf(User);
            expect(result?.user_id).toEqual(user.user_id);
            done();
        });

        it('No user found by email, email dont exists', async done => {
            const query = {
                email: 'semprenada@exemplo.com'
            };
            const ip = '127.0.0.1';

            const result = await userService.findOneByEmail(query, ip);
            expect(result).toBe(null);
            done();
        });

        it('should fail, was given an empty email', async done => {
            const query = {
                foo: 'bar'
            };
            const ip = '127.0.0.1';

            try {
                await userService.findOneByEmail(query, ip);
                fail();
            } catch (e) {
                expect(e).toBeInstanceOf(GeneralError);
                expect(e.message).toEqual('Email not valid: undefined');
                expect(e.status).toEqual(400);
            }
            done();
        });
    });
});