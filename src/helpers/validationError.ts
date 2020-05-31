import {ValidationError} from 'sequelize';

interface SimpleError {
    field: string;
    message: string;
}

function simplifyValidationError(error: ValidationError): SimpleError[] {
    const simpleErrors: SimpleError[] = [];
    error.errors.forEach(item => {
        const simpleError: SimpleError = {
            field: item.path,
            message: item.message
        };
        simpleErrors.push(simpleError);
    });
    return simpleErrors;
}

export {
    SimpleError, simplifyValidationError
}