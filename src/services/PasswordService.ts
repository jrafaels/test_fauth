import {Password} from '../model/Password';
import {User} from '../model/User';
import {PasswordType} from '../helpers/enums';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import md5 from 'md5';
import GeneralError from "../helpers/GeneralError";

export class PasswordService {

    /**
     * Create a new password which was given by the user.
     * @param password
     * @param user
     */
    createPasswordToNewUser(password: string, user: User): Password {
        let hashPassword;
        try{
            hashPassword = bcrypt.hashSync(password, 10);
        }catch (e) {
            throw new GeneralError(400, 'Invalid password');
        }
        return new Password({
            user_id: user.user_id,
            user,
            password: hashPassword,
            type: PasswordType.USER_DECISION,
            start_date: new Date(Date.now())
        });
    }

    /**
     * Create a new temporary password for one user.
     * @param user
     */
    createTemporaryPassword(user: User): Password {
        const endDateTime = moment().add(60, 'minutes').format()
            .replace(/T/, ' ')
            .replace(/\..+/, '');

        const pass = new Password();
        pass.user_id = user.user_id;
        pass.user = user;
        pass.password = md5(Date.now() + user.email + user.user_id);
        pass.type = PasswordType.TEMPORARY;
        pass.start_date = new Date(Date.now());
        pass.end_date = new Date(endDateTime);
        return pass;
    }
}