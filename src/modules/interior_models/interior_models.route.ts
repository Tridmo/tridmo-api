import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import { CreateInteriorModelDTO } from './interior_models.dto';
import InteriorModelsController from './interior_models.controller';

export default class InteriorModelsRoute implements Routes {
  public path = '/tags';
  public router = Router();
  public controller = new InteriorModelsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.controller.getAll);
    this.router.get(`${this.path}/:id`, this.controller.getByInterior);
    this.router.post(`${this.path}/`, protect, validate(CreateInteriorModelDTO, "body", true), this.controller.create);
    this.router.delete(`${this.path}/:id`, protect, this.controller.delete);
    this.router.delete(`${this.path}/interior/:interior_id`, protect, this.controller.deleteByInterior);
  }
}
