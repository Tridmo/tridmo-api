import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate'; 
import { CreateCollectionDTO } from './dto/collections.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import { CreateProductDTO, GetProductsQueryDTO, UpdateProductDTO } from '../products/dto/products.dto';
const { reqCoverName, reqFilesName, reqImagesName } = defaults
import checkUser from '../shared/middlewares/auth/check_user';
import modelsFilterMiddleware from '../shared/middlewares/models/filter';
import CollectionsController from './collections.controller';

export default class CollectionsRoute implements Routes {
  public path = '/collections';
  public router = Router();
  public collectionsController = new CollectionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`,validate(GetProductsQueryDTO, "query", true), modelsFilterMiddleware,  this.collectionsController.getAll);
    // Get one
    this.router.get(`${this.path}/:id`, checkUser,validate(ValidateUuidDTO, "params"), this.collectionsController.getOne);
    
    // Create new
    this.router.post(
      `${this.path}/`, 
      protect, 
      check_access("create_category"), 
      validate(CreateCollectionDTO, "body", true), 
      validate(CreateProductDTO, "body", true), 
      validateFiles(reqCoverName, reqFilesName, reqImagesName), 
      this.collectionsController.create
    );

    this.router.put(
      `${this.path}/`, 
      protect, 
      check_access("create_category"), 
      validate(ValidateUuidDTO, "params"), 
      validate(CreateCollectionDTO, "body", true), 
      validate(UpdateProductDTO, "body", true),  
      this.collectionsController.update
    );
 

  }
}
