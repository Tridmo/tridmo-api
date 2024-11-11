import { Router } from 'express';
import protect from '../shared/middlewares/auth/protect';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { DefaultQueryDTO, SearchQueryDTO } from '../shared/dto/query.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import { AddItemDTO, UserIdAndStatusDTO } from './dto/orders.dto';
import OrdersController from './orders.controller';
import check_access from '../shared/middlewares/auth/check_access';

export default class OrdersRoute implements Routes {
  public path = '/cart';
  public router = Router();
  public ordersController = new OrdersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //checkout
    this.router.post(`${this.path}/checkout`, protect, this.ordersController.checkout);
    // Add item
    this.router.post(`${this.path}/`, protect, check_access("create_order"), validate(AddItemDTO), this.ordersController.addItem);
    // Remove item
    this.router.delete(`${this.path}/item/:item_id`, protect, check_access("create_order"), this.ordersController.removeItem);
    // Get by user
    this.router.get(`${this.path}/user/:id`, protect, check_access("get_orders"), validate(ValidateUuidDTO, "params"), this.ordersController.getByUser);
    // Get by user and status
    this.router.get(`${this.path}/user/:id/:status`, protect, check_access("get_orders"), validate(UserIdAndStatusDTO, "params"), this.ordersController.getByUserAndStatus);
    // Get active
    this.router.get(`${this.path}/current`, protect, check_access("get_orders"), this.ordersController.getCurrent);
    // Get all for user
    this.router.get(`${this.path}/purchases`, protect, check_access("get_orders"), this.ordersController.getPurchases);
    // Get one
    this.router.get(`${this.path}/:id`, protect, check_access("get_order"), validate(ValidateUuidDTO, "params"), this.ordersController.getOne);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, check_access("create_order"), validate(ValidateUuidDTO, "params"), this.ordersController.delete);
  }
}
