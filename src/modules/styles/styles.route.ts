import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { DefaultQueryDTO, SearchQueryDTO } from '../shared/dto/query.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import StylesController from './styles.controller';
import { CreateStyleDTO, UpdateStyleDTO } from './dto/styles.dto';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';

export default class StylesRoute implements Routes {
  public path = '/styles';
  public router = Router();
  public stylesController = new StylesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, this.stylesController.getAll);
    // Get one
    this.router.get(`${this.path}/:id`, this.stylesController.getOne);
    
    // Create new
    this.router.post(`${this.path}/`, protect, check_access("create_style"), validate(CreateStyleDTO, "body", true), this.stylesController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_style"), validate(UpdateStyleDTO, "body", true), this.stylesController.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_style"), this.stylesController.delete);
  }
}
