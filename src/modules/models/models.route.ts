import { GetProductsQueryDTO } from './../products/dto/products.dto';
import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import ModelsController from './models.controller';
import { CreateModelDTO } from './dto/models.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import { CreateProductDTO } from '../products/dto/products.dto';
import checkUser from '../../modules/shared/middlewares/auth/check_user';
const { reqCoverName, reqFilesName, reqImagesName } = defaults
import modelsFilterMiddleware from '../shared/middlewares/models/filter';

export default class ModelsRoute implements Routes {
  public path = '/models';
  public router = Router();
  public modelsController = new ModelsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, validate(GetProductsQueryDTO, "query", true), modelsFilterMiddleware, this.modelsController.getAll);


    // get by filters
    this.router.get(`${this.path}/filter`, checkUser, this.modelsController.getOneByFilters);

    // Get one
    this.router.get(`${this.path}/:identifier`, checkUser, this.modelsController.getOne);

    this.router.put(`${this.path}/:id`, protect, 
    check_access("create_category"),  validate(ValidateUuidDTO, "params"), this.modelsController.update);
    
    // Create new
    this.router.post(
      `${this.path}/`, 
      protect, 
      check_access("create_category"), 
      validate(CreateModelDTO, "body", true), 
      validate(CreateProductDTO, "body", true), 
      validateFiles(reqCoverName, reqFilesName, reqImagesName), 
      this.modelsController.create
    );

    this.router.delete(`${this.path}/:id`, protect, validate(ValidateUuidDTO, "params"), this.modelsController.delete);  
  }
}
