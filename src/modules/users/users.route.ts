import { Router } from 'express';
import protect from '../shared/middlewares/auth/protect';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import UsersController from './users.controller';
import check_access from '../shared/middlewares/auth/check_access';
import { UpdateUserDTO } from './users.dto';
import { CreateUserRoleDTO } from '../auth/roles/roles.dto';

export default class AuthRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/designers`, this.usersController.getDesigners);
    this.router.get(`${this.path}/`, protect, check_access("update_brand"), this.usersController.getAll_admin);
    this.router.get(`${this.path}/:username/info`, protect, check_access("update_brand"), this.usersController.profileByUsername_admin);
    this.router.get(`${this.path}/:username/downloads`, protect, check_access("update_brand"), this.usersController.getUserDownloads);
    this.router.get(`${this.path}/profile`, protect, check_access("get_user"), this.usersController.profile);
    this.router.put(`${this.path}/profile`, protect, check_access("update_user"), validate(UpdateUserDTO, "body", true), this.usersController.update);
    this.router.put(`${this.path}/role/:id`, protect, check_access("create_role"), validate(CreateUserRoleDTO, 'body', true), this.usersController.updateUserRole);
    this.router.get(`${this.path}/check/:username`, this.usersController.checkUsername);
    this.router.get(`${this.path}/:username`, this.usersController.profileByUsername);
  }
}
