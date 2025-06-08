import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import check_access from '../shared/middlewares/auth/check_access';
import protect from '../shared/middlewares/auth/protect';
import validate from '../shared/middlewares/validate';
import CountriesController from './countries.controller';
import { CreateCountryDTO, GetCountriesQuery, UpdateCountryDTO } from './dto/countries.dto';

export default class CountriesRoute implements Routes {
  public path = '/countries';
  public router = Router();
  public countriesController = new CountriesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, validate(GetCountriesQuery, "query", true), this.countriesController.getAll);
    // Get one
    this.router.get(`${this.path}/:id`, this.countriesController.getOne);
    
    // Create new
    this.router.post(`${this.path}/`, protect, check_access('create_product'), validate(CreateCountryDTO, "body"), this.countriesController.create);
    // Update one
    this.router.put(`${this.path}/:id`, protect, check_access('update_product'), validate(UpdateCountryDTO, "body", true), this.countriesController.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access('delete_product'), this.countriesController.delete);
  }
}
