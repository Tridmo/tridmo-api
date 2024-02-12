import { Router } from 'express'; 
import check_access from '../../shared/middlewares/auth/check_access';
import { Routes } from '../../shared/interface/routes.interface';
import AccessModulesController from './access_modules.controller';
import protect from '../../shared/middlewares/auth/protect';

export default class AccessModulesRoute implements Routes {
  public path = '/modules/';
  public router = Router();
  public accessModulesController = new AccessModulesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() { 
    this.router.get(`${this.path}`, protect, check_access("get_roles"),  this.accessModulesController.getAll);    
  }
}