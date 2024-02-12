import { ValidateUuidDTO } from './../shared/dto/params.dto';
import { Router } from 'express'; 
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate'; 
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access'; 
import TransactionsController from './transactions.controller';

export default class TransactionsRoute implements Routes {
  public path = '/transactions';
  public router = Router();
  public transactionsController = new TransactionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    // this.router.get(`${this.path}/`, this.transactionsController.getAll);
    // // Get one
    this.router.get(`${this.path}/:id`, this.transactionsController.getById);
    
    // Create new
    this.router.post(
      `${this.path}/webhook`,  
      this.transactionsController.create
    );

  }
}
