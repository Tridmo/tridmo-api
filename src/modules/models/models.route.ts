import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import ModelsController from './models.controller';
import { AddColorsDTO, AddMaterialsDTO, CreateModelDTO, GetCartModelsQueryDTO, GetCountsQueryDTO, GetModelsQueryDTO, UpdateModelDTO } from './models.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../../modules/shared/middlewares/auth/check_user';
const { reqCoverName, reqFilesName, reqImagesName, reqFileName } = defaults
import modelsFilterMiddleware from '../shared/middlewares/models/filter';
import { ParserMiddleware } from '../shared/middlewares/parser';

export default class ModelsRoute implements Routes {
  public path = '/models';
  public router = Router();
  public modelsController = new ModelsController();
  public parser = new ParserMiddleware();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/compress`, this.modelsController.compress);
    // Get all
    this.router.get(`${this.path}/`, validate(GetModelsQueryDTO, "query", true), this.modelsController.getAll);
    this.router.get(`${this.path}/cart`, validate(GetCartModelsQueryDTO, "query", true), this.modelsController.getCartModels);
    this.router.get(`${this.path}/count`, validate(GetModelsQueryDTO, "query", true), this.modelsController.getCount);
    this.router.get(`${this.path}/counts`, validate(GetCountsQueryDTO, "query", true), this.modelsController.getCounts);
    // get by filters
    this.router.get(`${this.path}/filter`, checkUser, this.modelsController.getOneByFilters);
    // Create new
    this.router.post(
      `${this.path}/`,
      protect,
      check_access("create_product"),
      validate(CreateModelDTO, "body", true),
      validateFiles(reqCoverName, reqFileName, reqImagesName),
      this.parser.parse(),
      this.modelsController.create
    );
    // Get cover
    this.router.get(`${this.path}/images/cover/:id`, this.modelsController.getCoverImage);
    // Get one
    this.router.get(`${this.path}/:identifier`, checkUser, this.modelsController.getOne);
    // Update file
    this.router.put(`${this.path}/file/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validateFiles(reqFileName), this.modelsController.updateFile);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validate(UpdateModelDTO, "body", true), this.parser.parse(), this.modelsController.update);
    // Add materials
    this.router.post(`${this.path}/materials/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validate(AddMaterialsDTO, "body", true), this.modelsController.addMaterials);
    // Add colors
    this.router.post(`${this.path}/colors/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), validate(AddColorsDTO, "body", true), this.modelsController.addColors);
    // Add images
    this.router.post(`${this.path}/images/:id`, protect, check_access("update_product"), validate(ValidateUuidDTO, "params"), this.modelsController.addImages);
    // Delete image
    this.router.delete(`${this.path}/images/:image_id`, protect, check_access("update_product"), this.modelsController.deleteImage);
    // Remove material
    this.router.delete(`${this.path}/materials/:material_id/:id`, protect, check_access("update_product"), this.modelsController.removeMaterial);
    // Remove color
    this.router.delete(`${this.path}/colors/:color_id/:id`, protect, check_access("update_product"), this.modelsController.removeColor);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_product"), validate(ValidateUuidDTO, "params"), this.modelsController.delete);

    this.router.post(`${this.path}/download/:id`, protect, validate(ValidateUuidDTO, "params"), this.modelsController.download);
  }
}
