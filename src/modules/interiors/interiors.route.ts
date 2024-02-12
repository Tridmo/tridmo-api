import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import InteriorsController from './interiors.controller';
import { CreateInteriorDTO, UpdateInteriorDTO } from './dto/interiors.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import { CreateProductDTO, GetProductsQueryDTO, UpdateProductDTO } from '../products/dto/products.dto';
const { reqCoverName, reqFilesName, reqImagesName, reqPresentationName } = defaults
import checkUser from '../../modules/shared/middlewares/auth/check_user';
import modelsFilterMiddleware from '../../modules/shared/middlewares/models/filter';
export default class InteriorsRoute implements Routes {
  public path = '/interiors';
  public router = Router();
  public interiorsController = new InteriorsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`,validate(GetProductsQueryDTO, "query", true), modelsFilterMiddleware,  this.interiorsController.getAll);
    // Get one
    this.router.get(`${this.path}/:identifier`, checkUser, this.interiorsController.getOne);
    
    // Create new
    this.router.post(
      `${this.path}/`, 
      protect, 
      check_access("create_category"), 
      validate(CreateInteriorDTO, "body", true), 
      validate(CreateProductDTO, "body", true), 
      validateFiles(reqCoverName, reqFilesName, reqImagesName), 
      this.interiorsController.create
    );

    this.router.put(
      `${this.path}/:id`, 
      protect, 
      check_access("create_category"), 
      validate(ValidateUuidDTO, "params"), 
      validate(UpdateProductDTO, "body", true),  
      this.interiorsController.update
    );

    this.router.delete(`${this.path}/:id`, protect, validate(ValidateUuidDTO, "params"), this.interiorsController.delete); 
  }
}
