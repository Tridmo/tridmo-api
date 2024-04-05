import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';
import SavedModelsController from './saved_models.controller';
import { CreateSavedInteriorDTO } from './dto/saved_models.dto';

export default class SavedModelsRoute implements Routes {
  public path = '/saved/models';
  public router = Router();
  public controller = new SavedModelsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, protect, this.controller.getAll);

    // Create new
    this.router.post(`${this.path}/`, protect, validate(CreateSavedInteriorDTO, "body"), this.controller.create);
    // Delete one
    this.router.delete(`${this.path}/:model_id`, protect, this.controller.delete);
  }
}
