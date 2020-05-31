import {NextFunction, Request, Response} from 'express';
import Log from '../config/log';
import path from 'path';
import AuthService from '../services/AuthService';
import {RecoverRequest} from '../interfaces/requests/RecoverRequest';
import {ResetRequest} from '../interfaces/requests/ResetRequest';
import GeneralError from '../helpers/GeneralError';

const logger = new Log(path.basename(__filename), 'AUTH');
const authService = new AuthService();

export function login(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.body.ip).debug('Starting user login operation.');
    return authService.login(req.body, req.ip)
        .then(result => {
            return res.json(result);
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error logging user.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error logging in user.', err);
                return res.status(500).json(err.message);
            }
        });
}

export function logout(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.body.ip).debug('Starting user logout operation.');
    return authService.logout(req.body, req.ip)
        .then(result => {
            return res.json(result);
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error logout user.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error logout user.', err);
                return res.status(500).json(err.message);
            }
        });
}

export function recoverPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    logger.addIp(req.body.ip).debug('Starting user password recovery operation.');
    return authService.recoverPassword(req.body, req.ip)
        .then(result => {
            const request: RecoverRequest = {
                user_id: result.user.user_id,
                full_name: result.user.first_name + ' ' + result.user.last_name,
                email: result.user.email,
                control_password: result.password,
                ip: req.ip
            };
            req.body.request = request;
            next();
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error recover password.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error recover password.', err);
                return res.status(500).json(err.message);
            }
        });
}

export function resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    logger.addIp(req.body.ip).debug('New attempt to reset password.');
    return authService.resetPassword(req.body, req.ip)
        .then(user => {
            const request: ResetRequest = {
                user_id: user.user_id,
                full_name: user.first_name + ' ' + user.last_name,
                email: user.email,
                ip: req.body.ip
            };
            req.body.request = request;
            next();
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error reset password.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error reset password.', err);
                return res.status(500).json(err.message);
            }
        });
}
