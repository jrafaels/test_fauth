import dotenv from 'dotenv';

if (process.env.NODE_ENV != 'production') {
    dotenv.config();
}

const ENV = (process.env.NODE_ENV || 'development').trim();

const PROD_SERVER_HOSTNAME = process.env.PROD_SERVER_HOSTNAME || 'localhost';
const PROD_SERVER_PORT = process.env.PORT || process.env.PROD_SERVER_PORT || '8081';

const DEV_SERVER_HOSTNAME = process.env.DEV_SERVER_HOSTNAME || 'localhost';
const DEV_SERVER_PORT = process.env.DEV_SERVER_PORT || '8083';

export default function getServer(): any {
    if (ENV === 'development') {
        return {
            hostname: DEV_SERVER_HOSTNAME,
            port: DEV_SERVER_PORT
        }
    } else {
        return {
            hostname: PROD_SERVER_HOSTNAME,
            port: PROD_SERVER_PORT
        }
    }
}
