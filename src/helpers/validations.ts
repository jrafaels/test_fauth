import {SimpleError, simplifyValidationError} from './validationError';
import {Model} from 'sequelize-typescript';
import {User} from '../model/User';
import {Password} from '../model/Password';
import countries from 'country-list';
import GeneralError from './GeneralError';
import {Log} from "../model/Log";

/**
 * Validate fields of {Model}.
 * Emits null if and only if validation successful; otherwise an Error instance containing
 * with errors is returned {@see SimpleError}
 *
 * @param model that will be validated
 * @param options (optional) for validation {@see ValidationOptions}
 */
export function validateModel(model: Model, options?: any): Promise<SimpleError[] | null> {
    return model.validate(options)
        .then(() => {
            return null;
        }).catch(error => {
            return simplifyValidationError(error);
        });
}

/**
 * Generate a custom {GeneralError} for validations failed.
 * @param message
 * @param validationError
 * @param status, default is 400
 */
function generateValidationError(message: string, validationError: SimpleError[], status=400): GeneralError {
    const error = new GeneralError(status, message);
    error.setValidationsError(validationError);
    return error;
}

/**
 * Validate password.
 * Must be passed a not hashed password to be validated.
 * @param password
 * @param cleanPassword
 */
export async function validatePassword(password: Password, cleanPassword: string): Promise<void> {
    const passwordValidation = await validateModel(password, {skip: ['user_id']});
    if (passwordValidation) {
        throw generateValidationError('Password validation error', passwordValidation);
    }
    if (!cleanPassword.trim() || cleanPassword.length < 10) {
        throw new GeneralError(400, 'Password must be have at least 10 characters.');
    }
}

/**
 * Validate user and password.
 * Must be passed a not hashed password to be validated.
 * @param user
 * @param password
 * @param cleanPassword
 *
 * @throws {GeneralError} if some validation failed.
 */
export async function validateCreateUser(user: User, password: Password, cleanPassword: string): Promise<void> {
    const userValidation = await validateModel(user);
    if (userValidation) {
        throw generateValidationError('User validation error', userValidation);
    }
    if (user.country != undefined && !countries.getNames().includes(user.country)) {
        throw new GeneralError(400, 'Invalid country: ' + user.country);
    }
    await validatePassword(password, cleanPassword);
}

/**
 * Validate user that will be updated.
 * Just check passed fields.
 * @param userToUpdate
 */
export async function validateUpdateUser(userToUpdate: any): Promise<void> {
    const userValidation = await validateModel(new User(userToUpdate), {fields: Object.keys(userToUpdate)});
    if (userValidation) {
        throw generateValidationError('Update user validation error', userValidation);
    }
    if (userToUpdate.country != undefined && !countries.getNames().includes(userToUpdate.country)) {
        throw new GeneralError(400, 'Invalid country: ' + userToUpdate.country);
    }
}

/**
 * Validate log that will be created.
 * Just check passed fields.
 * @param log
 */
export async function validateLog(log: Log): Promise<void> {
    const logValidation = await validateModel(log);
    if (logValidation) {
        throw generateValidationError('Log validation error', logValidation, 500);
    }
}