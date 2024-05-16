import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';
import SavedInteriorsController from './saved_interiors.controller';
import { CreateSavedInteriotDTO } from './saved_interiors.dto';

export default class SavedInteriorsRoute implements Routes {
  public path = '/saved/interiors';
  public router = Router();
  public controller = new SavedInteriorsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, protect, this.controller.getAll);
    // Create new
    this.router.post(`${this.path}/`, protect, validate(CreateSavedInteriotDTO, "body"), this.controller.create);
    // Delete one
    this.router.delete(`${this.path}/:interior_id`, protect, this.controller.delete);
  }
}
