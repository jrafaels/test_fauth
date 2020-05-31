import {NextFunction, Request, Response} from 'express';
import path from 'path';
import Log from '../config/log';
import UserService from '../services/UserService';
import {WelcomeRequest} from '../interfaces/requests/WelcomeRequest';
import GeneralError from '../helpers/GeneralError';

const logger = new Log(path.basename(__filename), 'USER');
const userService = new UserService();

export function createUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    logger.addIp(req.ip).debug('New attempt to create user.');
    return userService.createNewUser(req.body, req.ip)
        .then(user => {
            const request: WelcomeRequest = {
                user_id: user.user_id,
                full_name: user.first_name + ' ' + user.last_name,
                email: user.email,
                ip: req.ip
            };
            req.body.request = request;
            next();
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error creating new user.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error creating new user.', err);
                return res.status(500).json(err.message);
            }
        });
}

export function updateUser(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.ip).debug('New attempt to update user.');
    return userService.updateUser(req.params, req.body, req.ip)
        .then(result => {
            if (result != null) {
                return res.json({user_id: result});
            } else {
                return res.status(400).json('User not updated.');
            }
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error updating user.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error updating user.', err);
                return res.status(500).json(err.message);
            }
        });
}

export function findOne(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.ip).debug('New attempt to find one user.');
    return userService.findOne(req.params, req.ip).then(user => {
        if (user) {
            return res.json(user);
        } else {
            return res.sendStatus(404);
        }
    }).catch(err => {
        logger.addIp(req.ip).error('Error searching user.', err);
        return res.status(500).json(err.message);
    });
}

export function findOneByEmail(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.ip).debug('New attempt to find one user by email.');
    return userService.findOneByEmail(req.query, req.ip).then(user => {
        if (user) {
            return res.json(user);
        } else {
            return res.sendStatus(404);
        }
    }).catch(err => {
        logger.addIp(req.ip).error('Error searching user by email.', err);
        return res.status(500).json(err.message);
    });
}

export function findAll(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.ip).info('New attempt to find all users.');
    return userService.findAll(req.ip).then(users => {
        if (users) {
            logger.addUserId(req.body.user_id).addIp(req.body.ip).info('Users founded.');
            return res.json(users);
        } else {
            logger.addUserId(req.body.user_id).addIp(req.body.ip).info('Users not founded.');
            return res.sendStatus(404);
        }
    }).catch(error => {
        logger.addUserId(req.body.user_id).addIp(req.body.ip).error('Error getting all users.', error);
        return res.sendStatus(500);
    });
}

export function deleteUser(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.body.ip).debug('New attempt to delete user.');
    return userService.deleteUser(req.params, req.ip)
        .then(result => {
            if (result) {
                //User deleted
                return res.json(result);
            } else {
                return res.status(400).json('User not deleted');
            }
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error deleting user.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error deleting user.', err);
                return res.status(500).json(err.message);
            }
        })
}