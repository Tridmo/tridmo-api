import { Router } from 'express';
import { Routes } from '../../shared/interface/routes.interface'; 
import RolesController from './roles.controller'; 
import validate from '../../shared/middlewares/validate';
import { CreateRoleAccessModuleDTO } from '../access_modules/dto/access_modules.dto';
import check_access from '../../shared/middlewares/auth/check_access';
import protect from '../../shared/middlewares/auth/protect';

export default class RolesRoute implements Routes {
  public path = '/roles/';
  public router = Router();
  public rolesController = new RolesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() { 
    this.router.get(`${this.path}`, protect, check_access("get_roles"),  this.rolesController.getAll); 
    this.router.post(`${this.path}modules`, protect, check_access("create_role"), validate(CreateRoleAccessModuleDTO, 'body'), this.rolesController.createRoleAccessModule);  
  }
}