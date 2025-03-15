import cors from "cors";
import express, { Express, Router, RequestHandler } from 'express';
import errorHandler from "./modules/shared/middlewares/errorHandler";
import morgan from 'morgan';
import expressFileUpload from 'express-fileupload';
import path from "path";
import consoleStamp from 'console-stamp'
import requestLang from './middleware/requestLang';
import { server } from "./config";

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
    this.app.use(cors({ origin: "*" }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(expressFileUpload() as unknown as RequestHandler);
    this.app.use(express.static(path.join(__dirname, "public", "uploads")));
    if (server.logLevel) {
      this.app.use(morgan(server.logLevel));
    }
  }

  private initializeRoutes(router: Router) {
    this.app.get('/health', (req, res) => res.status(200).json({ success: true }));
    this.app.use('/api', requestLang, router);
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

}

export default App;
