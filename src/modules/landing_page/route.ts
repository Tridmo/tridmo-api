import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import ChatController from './controller';
import protect from '../shared/middlewares/auth/protect';
import validateFiles from '../shared/middlewares/validateFiles';
import check_access from '../shared/middlewares/auth/check_access';
import { defaults } from '../shared/defaults/defaults';

export default class ChatRoute implements Routes {
  public path = '/front';
  public router = Router();
  public controller = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/landing/designer_images`, protect, check_access('create_role'), validateFiles(defaults.reqImagesName), this.controller.uploadDesignersImages);
    this.router.get(`${this.path}/landing/designer_images`, protect, check_access('create_role'), validateFiles(defaults.reqImagesName), this.controller.uploadDesignersImages);
  }
}
