import {User} from '../model/User';
import {SimpleError} from "./validationError";

export default class GeneralError extends Error {

    validationsError: SimpleError[] | undefined;

    constructor(public status: number, err: string, public user?: User) {
        super(err);
        Error.captureStackTrace(this, GeneralError);
    }

    setValidationsError(error: SimpleError[]): void{
        this.validationsError = error;
    }

    getValidationsError(): SimpleError[] | undefined{
        return this.validationsError;
    }
}