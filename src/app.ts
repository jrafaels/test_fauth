import express, {Application, NextFunction, Request, Response} from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Log from './config/log';

// Server
import getServer from './config/config';
// DB
import connection from './config/connection';
// Routes
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import tokenRoutes from './routes/token';

const logger = new Log(__filename, 'SERVER');

export class App {

    app: Application;

    constructor(private port?: number | string) {
        this.app = express();
        this.settings();
        this.middleware();
        this.cors();
        this.db()
            .then(() => logger.info('Database connected.'))
            .catch(error => logger.error('Error connecting database', error));
        this.routes();
    }

    settings(): void {
        this.app.set('port', this.port || getServer().port);
    }

    middleware(): void {
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(cookieParser());
        this.app.use(session({
            secret: 'secrett',
            name: 'sessionId',
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: true,
                httpOnly: true,
                domain: 'example.com',
                path: 'foo/bar',
                expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            }
        }));
    }

    cors(): void {
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            );
            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
                return res.status(200).json({});
            }
            next();
        });
    }

    async db(): Promise<void> {
        await connection().sync().then(() => {
            console.log('Database connected.');
        });
    }

    routes(): void {
        this.app.use('/api/user', userRoutes);
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/token', tokenRoutes);
    }

    listen(): void {
        this.app.listen(this.app.get('port'));
        console.log('Server running on port: ' + this.app.get('port') + ' on mode ' + process.env.NODE_ENV);
        logger.info('Server on port: ' + this.app.get('port'));
    }
}