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
    this.router.get(`${this.path}/registrations`, protect, check_access('update_brand'), this.controller.getRegisterStats);
    this.router.get(`${this.path}/brands`, protect, check_access('update_brand'), this.controller.getBrandStats);
    this.router.get(`${this.path}/models`, protect, check_access('update_brand'), this.controller.getModelStats);
    this.router.get(`${this.path}/categories`, protect, check_access('update_brand'), this.controller.getCategoryStats);
    this.router.get(`${this.path}/interiors`, protect, check_access('update_brand'), this.controller.getInteriorsStats);
    this.router.get(`${this.path}/downloads/count`, protect, check_access('update_brand'), this.controller.getDownloadsCount);
    this.router.get(`${this.path}/downloads/chart`, protect, check_access('update_brand'), this.controller.getDownloadsChart);
    this.router.get(`${this.path}/tags/count`, protect, check_access('update_brand'), this.controller.getTagsCount);
    this.router.get(`${this.path}/tags/chart`, protect, check_access('update_brand'), this.controller.getTagsChart);
    this.router.get(`${this.path}/main`, this.controller.getMainStats);
  }
}
