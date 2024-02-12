import { Router } from 'express';
import protect from '../../shared/middlewares/auth/protect';
import { Routes } from '../../shared/interface/routes.interface';
import validate from '../../shared/middlewares/validate';
import UserProductViewsController from './user_product_views.controller';
import checkUser from '../../shared/middlewares/auth/check_user';

export default class UserProductViewsRoute implements Routes {
  public path = '/views';
  public router = Router();
  public userProductViewsController = new UserProductViewsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, checkUser, this.userProductViewsController.getAll);
    // Get recent
    this.router.get(`${this.path}/recent`, checkUser, this.userProductViewsController.getRecent);
  }
}
