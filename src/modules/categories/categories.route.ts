import { Router } from 'express';
import protect from '../shared/middlewares/auth/protect';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import CategoriesController from './categories.controller';
import { CreateCategoryDTO, UpdateCategoryDTO } from './categories.dto';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';

export default class CategoriesRoute implements Routes {
  public path = '/categories';
  public router = Router();
  public categoriesController = new CategoriesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, this.categoriesController.getAll);
    // Get brands
    this.router.get(`${this.path}/brand/:brand_id`, this.categoriesController.getByBrand);
    this.router.get(`${this.path}/model_tags/:identifier`, this.categoriesController.getByModelInteriors);
    this.router.get(`${this.path}/user/downloads/:username`, protect, check_access('update_brand'), this.categoriesController.getByUserDownloads);
    this.router.get(`${this.path}/user/interiors/:username`, protect, check_access('update_brand'), this.categoriesController.getByUserInteriors);
    // Get main parent categories
    this.router.get(`${this.path}/main`, this.categoriesController.getAllParents);
    // Get children of one category
    this.router.get(`${this.path}/in/:id`, this.categoriesController.getChildrenOfCategory);
    // Get one
    this.router.get(`${this.path}/:id`, this.categoriesController.getOne);

    // Create new
    this.router.post(`${this.path}/`, protect, check_access("create_category"), validate(CreateCategoryDTO, "body", true), this.categoriesController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_category"), validate(UpdateCategoryDTO, "body", true), this.categoriesController.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_category"), this.categoriesController.deleteOne);
  }
}
