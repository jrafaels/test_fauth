import {Request, Response} from 'express';
import Log from '../config/log';
import path from 'path';
import TokenService from '../services/TokenService';
import GeneralError from '../helpers/GeneralError';

const logger = new Log(path.basename(__filename), 'JWT');
const tokenService = new TokenService();

export function newToken(req: Request, res: Response): Promise<Response> {
    logger.addIp(req.body.ip).debug('New attempt to get new token.');
    return tokenService.newToken(req.body, req.ip)
        .then(result => {
            return res.json(result);
        }).catch(err => {
            if (err instanceof GeneralError) {
                logger.addEmail(err.user?.email).addIp(req.ip).addUserId(err.user?.user_id)
                    .error('Error refreshing new token.', err);
                return res.status(err.status).json({error: err.message.toString()});
            } else {
                logger.addIp(req.ip).error('Error refreshing new token.', err);
                return res.status(500).json(err.message);
            }
        });

}
