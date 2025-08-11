import cors from "cors";
import express, { Express, Router, RequestHandler } from 'express';
import errorHandler from "./modules/shared/middlewares/errorHandler";
import morgan from 'morgan';
import expressFileUpload from 'express-fileupload';
import path from "path";
import requestLang from './middleware/requestLang';
import { server } from "./config";
import { isDevelopment } from "./modules/shared/utils/nodeEnv";
import logger from './lib/logger';

class App {
  public app: Express;

  constructor(router: Router) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes(router);
    this.initializeErrorHandling();
  }

  public get getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    logger.info('Initializing middlewares');
    
    this.app.use(cors({ origin: process.env.ALLOWED_ORIGINS.split(',') }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(expressFileUpload() as unknown as RequestHandler);
    
    if (isDevelopment()) {
      this.app.use(morgan(server.logLevel || 'dev'));
      logger.info('Morgan logging enabled for development');
    }
    
    logger.info('Middlewares initialized successfully');
  }

  private initializeRoutes(router: Router) {
    logger.info('Initializing routes');
    
    this.app.get('/health', (req, res) => {
      logger.info('Health check requested', { ip: req.ip, userAgent: req.get('User-Agent') });
      res.status(200).json({ success: true, timestamp: new Date().toISOString() });
    });
    
    this.app.use('/api', requestLang, router);
    
    logger.info('Routes initialized successfully');
  }

  private initializeErrorHandling() {
    logger.info('Initializing error handling middleware');
    this.app.use(errorHandler);
  }

}

export default App;
