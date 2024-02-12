import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import ProductsController from './products.controller';
import { AddColorsDTO, AddMaterialsDTO, GetProductsQueryDTO, UpdateProductDTO } from './dto/products.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import checkUser from '../shared/middlewares/auth/check_user';
import check_access from '../shared/middlewares/auth/check_access';
import modelsFilterMiddleware from '../shared/middlewares/models/filter';
const { reqFileName } = defaults

export default class ProductsRoute implements Routes {
  public path = '/products';
  public router = Router();
  public productsController = new ProductsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, validate(GetProductsQueryDTO, "query", true), modelsFilterMiddleware, this.productsController.getAll);
    // Get cover
    this.router.get(`${this.path}/images/cover/:product_id`, this.productsController.getCoverImage);
    // Get one
    this.router.get(`${this.path}/:identifier`, checkUser, this.productsController.getOne);
    // Update file
    this.router.put(`${this.path}/file/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validateFiles(reqFileName), this.productsController.updateFile);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validate(UpdateProductDTO, "body", true), validate(ValidateUuidDTO, "params"), this.productsController.update);
    // Add materials
    this.router.post(`${this.path}/materials/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validate(AddMaterialsDTO, "body", true), this.productsController.addMaterials);
    // Add colors
    this.router.post(`${this.path}/colors/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validate(AddColorsDTO, "body", true), this.productsController.addColors);
    // Add images
    this.router.post(`${this.path}/images/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), this.productsController.addImages);
    // Delete image
    this.router.delete(`${this.path}/images/:image_id`, protect, check_access("update_product"), this.productsController.deleteImage);
    // Remove material
    this.router.delete(`${this.path}/materials/:material_id/:id`, protect, check_access("update_product"), this.productsController.removeMaterial);
    // Remove color
    this.router.delete(`${this.path}/colors/:color_id/:id`, protect, check_access("update_product"), this.productsController.removeColor);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_product"), validate(ValidateUuidDTO, "params"), this.productsController.delete);

    this.router.post(`${this.path}/download/:id`, protect, validate(ValidateUuidDTO, "params"), this.productsController.downloadProduct);

  }
}
