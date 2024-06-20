import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import { CreateProjectDTO } from './projects.dto';
import ProjectsController from './projects.controller';

export default class ProjectsRoute implements Routes {
  public path = '/projects';
  public router = Router();
  public controller = new ProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, protect, this.controller.getAll);
    this.router.get(`${this.path}/:id`, protect, this.controller.getOne);
    this.router.put(`${this.path}/:id`, protect, validate(CreateProjectDTO, "body"), this.controller.update);
    this.router.post(`${this.path}/`, protect, validate(CreateProjectDTO, "body"), this.controller.create);
    this.router.post(`${this.path}/model/:model_id`, protect, this.controller.addModelToMany);
    this.router.post(`${this.path}/:id/model/:model_id`, protect, this.controller.addModel);
    this.router.delete(`${this.path}/:id/model/:model_id`, protect, this.controller.removeModel);
    this.router.delete(`${this.path}/:id`, protect, this.controller.delete);
  }
}
