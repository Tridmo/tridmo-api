import { Router } from 'express';
import protect from '../shared/middlewares/auth/protect';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { DefaultQueryDTO, SearchQueryDTO } from '../shared/dto/query.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import CostsController from './costs.controller';
import { CreateCostDTO, UpdateCostDTO } from './dto/costs.dto';

export default class CostsRoute implements Routes {
  public path = '/costs';
  public router = Router();
  public costsController = new CostsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`,  validate(DefaultQueryDTO, "query", true), this.costsController.getAll);
    // Get one
    this.router.get(`${this.path}/:id`, this.costsController.getOne);
    
    // Create new
    this.router.post(`${this.path}/`, protect, validate(CreateCostDTO, "body"), this.costsController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, validate(UpdateCostDTO, "body", true), this.costsController.update);
  }
}
