import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import FormfactorsController from './formfactors.controller';
import { CreateFormfactorDTO, UpdateFormfactorDTO } from './dto/formfactors.dto';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';

export default class FormfactorsRoute implements Routes {
  public path = '/formfactors';
  public router = Router();
  public formfactorsController = new FormfactorsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, this.formfactorsController.getAll);
    // Get one
    this.router.get(`${this.path}/:id`, this.formfactorsController.getOne);
    
    // Create new
    this.router.post(`${this.path}/`, protect, check_access("create_formfactor"), validate(CreateFormfactorDTO, "body", true), this.formfactorsController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access("update_formfactor"), validate(UpdateFormfactorDTO, "body", true), this.formfactorsController.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_formfactor"), this.formfactorsController.delete);
  }
}
