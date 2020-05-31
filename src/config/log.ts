import log4js, {Logger} from 'log4js';
import moment from 'moment';

const fileName = moment().format('YYYY-MM-DD');

log4js.configure({
    appenders: {
        server: {type: 'file', filename: 'logs/' + fileName + '.log'},
        out: {
            type: 'file', filename: 'logs/' + fileName + '.log', layout: {
                type: 'pattern',
                pattern: '[%d] [%p] [%c] [ID=%X{id}] [IP=%X{ip}] [EMAIL=%X{email}] [FILE=%X{file}] %m'
            }
        }
    },
    categories: {
        default: {appenders: ['out'], level: 'info'},
        SERVER: {appenders: ['server'], level: 'info'}
    }
});

export default class Log {

    private logger: Logger;

    constructor(
        file: string,
        private category: string
    ) {
        this.logger = log4js.getLogger(category);
        this.logger.addContext('file', file);
    }

    info(message: string): void {
        this.logger.info(message);
    }

    debug(message: string): void {
        this.logger.debug(message);
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    error(message: string, error: Error): void {
        this.logger.error(message, error);
    }

    addUserId(value: number | undefined): Log {
        this.logger.addContext('id', value);
        return this;
    }

    addEmail(value: string | undefined): Log {
        this.logger.addContext('email', value);
        return this;
    }

    addIp(value: string): Log {
        this.logger.addContext('ip', value);
        return this;
    }
}