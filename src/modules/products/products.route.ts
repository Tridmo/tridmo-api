import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import ProductsController from './products.controller';
import { CreateProductDTO, CreateProductFromModelDTO, GetCartProductsQueryDTO, GetProductsQueryDTO, UpdateProductDTO } from './products.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';
const { reqCoverName, reqFilesName, reqImagesName, reqFileName } = defaults
import { ParserMiddleware } from '../shared/middlewares/parser';

export default class ProductsRoute implements Routes {
  public path = '/products';
  public router = Router();
  public controller = new ProductsController();
  public parser = new ParserMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, validate(GetProductsQueryDTO, "query", true), this.controller.getAll);
    this.router.get(`${this.path}/cart`, validate(GetCartProductsQueryDTO, "query", true), this.controller.getCartProducts);
    this.router.get(`${this.path}/count`, validate(GetProductsQueryDTO, "query", true), this.controller.getCount);

    // Create new
    this.router.post(
      `${this.path}/`,
      protect,
      check_access("create_product"),
      validate(CreateProductDTO, "body", true),
      validateFiles(reqCoverName, reqImagesName),
      this.parser.parse(),
      this.controller.create
    );
    // Create from model
    this.router.post(
      `${this.path}/from-model/:model_id`,
      protect,
      check_access("create_product"),
      validate(CreateProductFromModelDTO, "body", true),
      this.parser.parse(),
      this.controller.createFromModel
    );
    // Get one
    this.router.get(`${this.path}/:identifier`, checkUser, this.controller.getOne);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validate(UpdateProductDTO, "body", true), this.parser.parse(), this.controller.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_product"), validate(ValidateUuidDTO, "params"), this.controller.delete);
  }
}
