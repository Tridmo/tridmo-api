import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';
import StatsController from './stats.controller';

export default class StatsRoute implements Routes {
  public path = '/statistics';
  public router = Router();
  public controller = new StatsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/registrations`, protect, check_access('create_role'), this.controller.getRegisterStats);
    this.router.get(`${this.path}/brands`, protect, check_access('create_role'), this.controller.getBrandStats);
    this.router.get(`${this.path}/models`, protect, check_access('create_role'), this.controller.getModelStats);
    this.router.get(`${this.path}/categories`, protect, check_access('create_role'), this.controller.getCategoryStats);
    this.router.get(`${this.path}/interiors`, protect, check_access('create_role'), this.controller.getInteriorsStats);
    this.router.get(`${this.path}/downloads`, protect, check_access('create_role'), this.controller.getDownloadStats);
    this.router.get(`${this.path}/tags`, protect, check_access('create_role'), this.controller.getTagsStats);
  }
}
