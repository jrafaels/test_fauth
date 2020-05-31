import {User} from "../../model/User";
import {PasswordService} from "../../services/PasswordService";
import {Password} from "../../model/Password";
import sequelize from "../../config/connection";
import GeneralError from "../../helpers/GeneralError";

const passwordService = new PasswordService();

describe('Create new password', () => {

    let user: User;
    beforeAll(async done => {
        await sequelize().sync({force: true});
        user = new User({
            user_id: 1,
            first_name: 'Joao',
            last_name: 'Maria',
            email: 'umemail@exemplo.com'
        });
        done();
    });

    afterAll(async done => {
        user.destroy();
        await sequelize().close();
        done();
    })

    it('Password created successfully to user', () => {
        const password='1234567890qwerty';
        const result = passwordService.createPasswordToNewUser(password, user);
        expect(result).not.toBe(null);
        expect(result).not.toBe(undefined);
        expect(result).toBeInstanceOf(Password);
        expect(result.user_id).toEqual(user.user_id);
        expect(result.password).not.toEqual(password);
        expect(result.password.length).toBeGreaterThan(50);
    });

    it('should fail, was given a null password', () => {
        const password=null;
        try {
            // @ts-ignore
            passwordService.createPasswordToNewUser(password, user);
            fail();
        }catch (e) {
            expect(e).toBeInstanceOf(GeneralError);
            expect(e.status).toEqual(400);
            expect(e.message).toEqual('Invalid password');
        }
    });

    it('Password temporary created successfully', () => {
        const result = passwordService.createTemporaryPassword(user);
        expect(result).not.toBe(null);
        expect(result).not.toBe(undefined);
        expect(result).toBeInstanceOf(Password);
        expect(result.user_id).toEqual(user.user_id);
        expect(result.password.length).toBeGreaterThan(30);
    });
});
