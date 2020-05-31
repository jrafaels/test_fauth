import {Sequelize} from 'sequelize-typescript';
import models from '../model';
import GeneralError from "../helpers/GeneralError";
import dotenv from 'dotenv'

if (process.env.NODE_ENV != 'production') {
    dotenv.config();
}
const configProdDB = {
    database: process.env.PROD_DATABASE || '',
    username: process.env.PROD_USERNAME || '',
    password: process.env.PROD_PASSWORD || '',
    host: process.env.PROD_HOST || '',
    port: process.env.PROD_PORT || 3306,
};

const configDevDB = {
    database: process.env.DEV_DATABASE || '',
    username: process.env.DEV_USERNAME || '',
    password: process.env.DEV_PASSWORD || '',
    host: process.env.DEV_HOST || '',
    port: process.env.DEV_PORT || 3306,
};

const configTestDB = {
    database: process.env.TEST_DATABASE || '',
    username: process.env.TEST_USERNAME || '',
    password: process.env.TEST_PASSWORD || '',
    host: process.env.TEST_HOST || '',
    port: process.env.TEST_PORT || 3306,
};

let instance: Sequelize;

function test(): Sequelize {
    return new Sequelize(configTestDB.database, configTestDB.username, configTestDB.password, {
        dialectOptions: {
            charset: 'utf8',
            multipleStatements: true
        },
        host: configTestDB.host,
        port: Number(configTestDB.port),
        dialect: 'mysql',
        logging: false,
        models
    });
}

function development(): Sequelize {
    return new Sequelize(configDevDB.database, configDevDB.username, configDevDB.password, {
        dialectOptions: {
            charset: 'utf8',
            multipleStatements: true
        },
        host: configDevDB.host,
        port: Number(configDevDB.port),
        dialect: 'mysql',
        logging: true,
        models
    });
}

function production(): Sequelize {
    return new Sequelize(configProdDB.database, configProdDB.username, configProdDB.password, {
        dialectOptions: {
            charset: 'utf8',
            multipleStatements: true
        },
        host: configProdDB.host,
        port: Number(configProdDB.port),
        dialect: 'mysql',
        logging: false,
        models
    });
}

function generateInstance(): Sequelize {
    switch (process.env.NODE_ENV) {
        case 'test':
            return test();
        case 'development':
            return development();
        case 'production':
            return production();
        default:
            throw new GeneralError(500, 'Environment not founded for database connection.');
    }
}

export default function sequelize(): Sequelize {
    if (instance == null) {
        instance = generateInstance();
    }
    return instance;
}

