import { Router } from 'express';
import protect from '../shared/middlewares/auth/protect';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { DefaultQueryDTO, SearchQueryDTO } from '../shared/dto/query.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import ColorsCcontroller from './colors.controller';
import { CreateColorDTO, UpdateColorDTO } from './dto/colors.dto';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';

export default class ColorsRoute implements Routes {
  public path = '/colors';
  public router = Router();
  public colorsController = new ColorsCcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, this.colorsController.getAll);
    // Get one
    this.router.get(`${this.path}/:id`, this.colorsController.getOne);
    
    // Create new
    this.router.post(`${this.path}/`, protect, check_access("create_color"), validate(CreateColorDTO, "body", true), this.colorsController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_color"), validate(UpdateColorDTO, "body", true), this.colorsController.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_color"), this.colorsController.delete);
  }
}
