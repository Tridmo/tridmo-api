import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import MaterialsCcontroller from './materials.controller';
import { CreateMaterialDTO, UpdateMaterialDTO } from './dto/materials.dto';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';

export default class MaterialsRoute implements Routes {
  public path = '/materials';
  public router = Router();
  public materialsController = new MaterialsCcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, this.materialsController.getAll);
    // Get one
    this.router.get(`${this.path}/:id`, validate(ValidateUuidDTO, "params"), this.materialsController.getOne);
    
    // Create new
    this.router.post(`${this.path}/`, protect, check_access("create_material"), validate(CreateMaterialDTO, "body", true), this.materialsController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_material"), validate(UpdateMaterialDTO, "body", true), validate(ValidateUuidDTO, "params"), this.materialsController.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_material"), validate(ValidateUuidDTO, "params"), this.materialsController.delete);
  }
}
