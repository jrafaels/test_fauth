import {User} from '../model/User';

export interface UserRepository {
    create(user: User, options?: any): Promise<User>;

    findAll(): Promise<Array<User>>;

    findOne(id: number): Promise<User>;

    findOneByEmail(email: string): Promise<User>;

    update(user: User, infoToUpdate: any, options?: any): Promise<boolean>;

    delete(user: User, options?: any): void;
}

export class UserRepositoryImpl implements UserRepository {

    /**
     * Create new user.
     * @param user
     * @param options
     */
    create(user: User, options?: any): Promise<User> {
        return user.save(options).then(result => {
            if (result) {
                return result;
            } else {
                return null;
            }
        }).catch(error => {
            throw error;
        })
    }

    /**
     * Get all users.
     */
    findAll(): Promise<Array<User>> {
        return User.findAll().then(users => {
            if (users) {
                return users;
            } else {
                return null;
            }
        }).catch(error => {
            throw new error;
        })
    }

    /**
     * Get user by id.
     * @param id
     */
    findOne(id: number): Promise<User> {
        return User.findByPk(id).then(user => {
            if (user) {
                return user;
            } else {
                return null;
            }
        }).catch(error => {
            throw new error;
        })
    }

    /**
     * Destroy user on database.
     * The field deleted_at will be updated with the actual time.
     * @param user
     * @param options
     */
    delete(user: User, options?: any): Promise<boolean> {
        return user.destroy(options).then(() => {
            return true;
        }).catch(error => {
            throw new error;
        });
    }

    /**
     * Get user by email.
     * @param email
     */
    findOneByEmail(email: string): Promise<User> {
        return User.findOne({where: {email: email}})
            .then(user => {
                if (user) {
                    return user;
                } else {
                    return null;
                }
            }).catch(error => {
                throw error;
            })
    }

    /**
     * Update information of user on database. Information to update must be given by parameter,
     * and is not necessary that all fields of that object be filled (except the field user_id).
     * @param user with information to be update
     * @param infoToUpdate
     *
     * @param options
     * @return true if successfully updated, false otherwise
     */
    update(user: User, infoToUpdate: any, options?: any): Promise<boolean> {
        return user.update(infoToUpdate, options)
            .then(result => {
                return !!result;
            }).catch(error => {
                throw error;
            })
    }

}