import {Request, Response} from 'express';
import Log from '../config/log';
import path from 'path';
import axios, {AxiosError} from 'axios';
import {RequestType} from '../helpers/enums';
import {GeneralRequest} from '../interfaces/requests/GeneralRequest';
import {WelcomeRequest} from '../interfaces/requests/WelcomeRequest';
import {RecoverRequest} from '../interfaces/requests/RecoverRequest';
import {ResetRequest} from '../interfaces/requests/ResetRequest';
import GeneralError from "../helpers/GeneralError";

const logger = new Log(path.basename(__filename), 'REQUEST');

function sendGenericPostRequest(body: GeneralRequest, operation: RequestType,
                                done: (error: AxiosError | null) => void): void {
    let endPoint: string;
    switch (operation) {
        case RequestType.SEND_RECOVER_PASSWORD:
            endPoint = process.env.ENDPOINT_NOTIFICATION+''+process.env.ENDPOINT_NOT_RECOVERPASSWORD;
            break;
        case RequestType.SEND_INFO_RESET_PASSWORD:
            endPoint = process.env.ENDPOINT_NOTIFICATION+''+process.env.ENDPOINT_NOT_RESETPASSWORD;
            break;
        case RequestType.SEND_WELCOME:
            endPoint = process.env.ENDPOINT_NOTIFICATION+''+process.env.ENDPOINT_NOT_WELCOME;
            break;
        default:
            throw new GeneralError(500, 'No endpoint defined.');

    }

    axios.post(endPoint, body)
        .then(() => {
            logger.addEmail(body.email).addIp(body.ip).addUserId(body.user_id)
                .info(operation + ' request sent successfully');
            done(null);
        }).catch((error: AxiosError) => {
        logger.addEmail(body.email).addIp(body.ip).addUserId(body.user_id)
            .error('error on ' + operation + ' request: ' + endPoint, error);
        done(error);
    });

}

export async function sendUserEmailPasswordRecovery(req: Request, res: Response): Promise<void> {
    const info: RecoverRequest = req.body.request;
    logger.addIp(req.ip).addEmail(info.email).addUserId(info.user_id)
        .debug('New attempt to send an email to recover password.');

    return sendGenericPostRequest(info, RequestType.SEND_RECOVER_PASSWORD,
        (error: AxiosError | null): Response => {
            if (error == null) {
                return res.json('Password recovered successfully. Check your email.');
            } else {
                // Error
                logger.addIp(req.ip).addUserId(info.user_id).addEmail(info.email)
                    .error('Error request recover email.', error);
                return res.status(500).json('Problem on sending email to recover password.');
            }
        });
}

export async function sendUserEmailPasswordReset(req: Request, res: Response): Promise<void> {
    const info: ResetRequest = req.body.request;
    logger.addIp(req.ip).addEmail(info.email).addUserId(info.user_id)
        .debug('New attempt to send an email to inform password reset.');

    return sendGenericPostRequest(info, RequestType.SEND_INFO_RESET_PASSWORD,
        (error: AxiosError | null): Response => {
            if (error == null) {
                return res.json('Password reset successfully.');
            } else {
                // Error
                logger.addIp(req.ip).addUserId(info.user_id).addEmail(info.email)
                    .error('Error request reset email.', error);
                return res.status(500).json('Problem on sending email to inform password reset.');
            }
        });
}

export async function sendUserWelcomeEmail(req: Request, res: Response): Promise<void> {
    const info: WelcomeRequest = req.body.request;
    logger.addIp(req.ip).addEmail(info.email).addUserId(info.user_id)
        .debug('New attempt to send a welcome email.');

    return sendGenericPostRequest(info, RequestType.SEND_WELCOME, (error: AxiosError | null): Response => {
        if (error == null) {
            return res.json('User created successfully.');
        } else {
            // Error
            logger.addIp(req.ip).addUserId(info.user_id).addEmail(info.email)
                .error('Error request welcome email.', error);
            return res.status(500).json('Problem on sending welcome email.');
        }
    });
}
