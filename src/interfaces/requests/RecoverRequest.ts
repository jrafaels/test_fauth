import {GeneralRequest} from './GeneralRequest';

export interface RecoverRequest extends GeneralRequest {
    user_id: number;
    full_name: string;
    email: string;
    control_password: string;
    ip: string;
}