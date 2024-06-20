import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import ChatController from './chat.controller';
import protect from '../shared/middlewares/auth/protect';

export default class ChatRoute implements Routes {
  public path = '/chat';
  public router = Router();
  public controller = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/token`, protect, this.controller.getToken);
    this.router.get(`${this.path}/contextual/:id`, protect, this.controller.initApp);
  }
}
