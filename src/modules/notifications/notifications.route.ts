import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import { CreateNotificationDTO, MarkManyNotificationDTO } from './notifications.dto';
import NotificationsController from './notifications.controller';

export default class NotificationsRoute implements Routes {
  public path = '/notifications';
  public router = Router();
  public controller = new NotificationsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, protect, this.controller.getAll);
    this.router.get(`${this.path}/counts`, protect, this.controller.counts);
    this.router.post(`${this.path}/`, protect, validate(CreateNotificationDTO, "body", true), this.controller.create);
    this.router.put(`${this.path}/`, protect, validate(MarkManyNotificationDTO, "body", true), this.controller.markAsSeenMany);
    this.router.put(`${this.path}/all`, protect, this.controller.markAsSeenAll);
    this.router.put(`${this.path}/:id`, protect, validate(ValidateUuidDTO, "params"), this.controller.markAsSeen);
    this.router.delete(`${this.path}/`, protect, this.controller.deleteAll);
    this.router.delete(`${this.path}/:id`, protect, validate(ValidateUuidDTO, "params"), this.controller.delete);
  }
}
