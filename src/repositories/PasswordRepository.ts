import {Password} from '../model/Password';
import {User} from '../model/User';
import Sequelize from 'sequelize';
import sequelize from '../config/connection';
import {PasswordService} from '../services/PasswordService';

const Op = Sequelize.Op;

export interface PasswordRepository {
    create(password: Password, options?: any): Promise<Password>;

    findOne(password: string): Promise<Password>;

    findActualPasswordForUser(user: User): Promise<Password>;

    updateOldPasswordToNew(oldPassword: Password, user: User, password: string | null): Promise<Password>;
}

export class PasswordRepositoryImpl implements PasswordRepository {

    /**
     * Create new password.
     * @param password
     * @param options
     */
    create(password: Password, options?: any): Promise<Password> {
        return password.save(options).then(result => {
            if (result) {
                return result;
            } else {
                return null;
            }
        }).catch(error => {
            throw new error;
        })
    }

    /**
     * Get password if exists.
     * @param password
     */
    findOne(password: string): Promise<Password> {
        return Password.findOne({where: {password: password}})
            .then(result => {
                if (result) {
                    return result;
                } else {
                    return null;
                }
            }).catch(error => {
                throw new error;
            })
    }

    /**
     * Return the actual password for a given user. If user don't have a valid password,
     * return null.
     * @param user
     */
    findActualPasswordForUser(user: User): Promise<Password> {
        return Password.findOne({
            where: {
                user_id: user.user_id,
                [Op.or]: [
                    {end_date: {[Op.gt]: new Date(Date.now())}},
                    {end_date: {[Op.eq]: null}}
                ]

            }
        })
            .then(password => {
                if (password) {
                    return password;
                } else {
                    return null;
                }
            }).catch(err => {
                throw new err;
            });
    }

    /**
     * Update the end_date of an oldPassword and save it on database.
     * Creates a new password for that user.
     * @param oldPassword that will not be used
     * @param user
     * @param password new of user. {null} if is a generated password.
     */
    updateOldPasswordToNew(oldPassword: Password, user: User, password: string | null): Promise<Password> {
        const passwordService = new PasswordService();

        return sequelize().transaction( (t) => {
            if(oldPassword != null) {
                //Update old password
                oldPassword.end_date = new Date(Date.now());
                oldPassword.save({transaction: t});
            }

            //Create new password
            let newPassword: Password;
            if (password != null) {
                newPassword = passwordService.createPasswordToNewUser(password, user);
            } else {
                newPassword = passwordService.createTemporaryPassword(user);
            }

            return newPassword.save({transaction: t})
                .then(result => {
                    return result;
                }).catch(error => {
                    throw new error;
                });
        });
    }
}