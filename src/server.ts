
import cors from "cors";
import express, { Express, Router } from 'express';
import errorHandler from "./modules/shared/middlewares/errorHandler";
import morgan from 'morgan';
import expressFileUpload from 'express-fileupload';
import path from "path";
import consoleStamp from 'console-stamp'
import requestLang from './middleware/requestLang';
import { generateHash } from "./modules/shared/utils/bcrypt";

consoleStamp(console, {
  format: ':date(HH:MM:ss)'
})

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
    this.app.use(
      cors({ origin: "*" }),
      express.json(),
      express.urlencoded({ extended: true }),
      expressFileUpload(),
      express.static(path.join(__dirname, "public", "uploads")),
      morgan("tiny")
    );
  }

  private initializeRoutes(router: Router) {
    this.app.use('/api', requestLang, router);
    this.app.get('/health', (req, res) => res.status(200).json({ success: true }));
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

}

export default App;
