import {Log} from '../model/Log';

export interface LogRepository {
    create(log: Log, options?: any): Promise<Log>;
}

export class LogRepositoryImpl implements LogRepository {

    /**
     * Save a new log on database.
     * @param log
     * @param options
     */
    create(log: Log, options?: any): Promise<Log> {
        return log.save(options)
            .then(result => {
                return result;
            }).catch(error => {
                throw error;
            });
    } 
}