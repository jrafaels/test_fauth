import {GeneralRequest} from './GeneralRequest';

export interface ResetRequest extends GeneralRequest {
    user_id: number;
    full_name: string;
    email: string;
    ip: string;
}