import { Router } from 'express';
import protect from '../shared/middlewares/auth/protect';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { DefaultQueryDTO, SearchQueryDTO } from '../shared/dto/query.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import BrandsController from './brands.controller';
import { CreateBrandDTO, UpdateBrandDTO } from './brands.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from '../shared/defaults/defaults';
const { reqImageName } = defaults
import check_access from '../shared/middlewares/auth/check_access';
import { ParserMiddleware } from '../shared/middlewares/parser';

export default class BrandsRoute implements Routes {
  public path = '/brands';
  public router = Router();
  public brandsController = new BrandsController();
  public parser = new ParserMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, validate(DefaultQueryDTO, "query", true), this.brandsController.getAll);

    //Get by user downloads
    this.router.get(`${this.path}/user/:username`, this.brandsController.getAllByUserDownloads);

    // Get one
    this.router.get(`${this.path}/:identifier`, this.brandsController.getOne);

    // Create new
    this.router.post(`${this.path}/`, protect, check_access("create_brand"), validate(CreateBrandDTO, "body"), this.parser.parse('body', { ignore: ['phone'] }), validateFiles(reqImageName), this.brandsController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_brand"), validate(UpdateBrandDTO, "body", true), this.parser.parse('body', { ignore: ['phone'] }), this.brandsController.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_brand"), this.brandsController.delete);
  }
}
