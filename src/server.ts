import cors from "cors";
import express, { Express, Router } from 'express';
import errorHandler from "./modules/shared/middlewares/errorHandler";
import morgan from 'morgan';
import expressFileUpload from 'express-fileupload';
import path from "path";
import consoleStamp from 'console-stamp'

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
    this.app.use(cors({
      origin: "*"
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(expressFileUpload())
    this.app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")))
    this.app.use(morgan("tiny"))
  }

  private initializeRoutes(router: Router) {
    this.app.use('/api', router);
    this.app.use('/health', (req, res) => {
      res.status(200).json({
        success: true
      })
    });
  }
  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

}

export default App;
