import {GeneralRequest} from './GeneralRequest';

export interface WelcomeRequest extends GeneralRequest {
    user_id: number;
    full_name: string;
    email: string;
    ip: string;
}