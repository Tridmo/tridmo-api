import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';
import DonwloadsController from './downloads.controller';

export default class DownloadsRoute implements Routes {
  public path = '/downloads';
  public router = Router();
  public controller = new DonwloadsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, /*protect, check_access('create_role'),*/ this.controller.getAll);
  }
}
