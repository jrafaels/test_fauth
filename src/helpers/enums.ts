export enum TrueFalse {
    TRUE = 'T',
    FALSE = 'F'
}

export enum PasswordType {
    USER_DECISION = 'U',
    TEMPORARY = 'T',
    GENERATED = 'G'
}

export enum LogType {
    REGISTER_ATTEMPT = 'RA',
    REGISTER_ATTEMPT_FAILED = 'RAF',
    LOGIN_ATTEMPT = 'LA',
    LOGIN_ATTEMPT_FAILED = 'LAF',
    RECOVER_PASSWORD_ASK = 'RPA',
    RECOVER_PASSWORD_SET = 'RPS'
}

export enum TokenType {
    NORMAL = 'N',
    REFRESH = 'R'
}

export enum RequestType {
    SEND_RECOVER_PASSWORD,
    SEND_INFO_RESET_PASSWORD,
    SEND_WELCOME
}