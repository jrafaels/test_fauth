import {Log} from '../model/Log';
import {LogType} from '../helpers/enums';
import {validateLog} from '../helpers/validations';
import {LogRepository, LogRepositoryImpl} from '../repositories/LogRepository';

export class LogService {

    /**
     * Insert a log on database.
     * @param user_id
     * @param type of log
     * @param ip
     * @param description
     * @param t an {transaction}
     */
    static async insertLog(user_id: number, type: LogType, ip: string, description: string, t: any): Promise<Log> {
        const logRepository: LogRepository = new LogRepositoryImpl();

        const log = new Log({
            user_id,
            type,
            ip,
            description,
            time: new Date(Date.now())
        });

        await validateLog(log);

        return logRepository.create(log, {transaction: t})
            .then(result => {
                return result;
            }).catch(error => {
                throw error;
            });
    }
}