import { Router } from "express";
import { WebsitesController } from "./websites.controller";
import protect from "../../shared/middlewares/auth/protect";
import check_access from "../../shared/middlewares/auth/check_access";
import { Routes } from "../../shared/interface/routes.interface";

export class WebsitesRoute implements Routes {
  public path = '/websites';
  public router = Router();
  public controller = new WebsitesController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path + '/', protect, check_access('frontend_content_control'), this.controller.getAll);
    this.router.get(this.path + '/byname/:name', protect, check_access('frontend_content_control'), this.controller.getByName);
    this.router.get(this.path + '/:id', protect, check_access('frontend_content_control'), this.controller.getById);
    this.router.post(this.path + '/', protect, check_access('frontend_content_control'), this.controller.create);
    this.router.put(this.path + '/:id', protect, check_access('frontend_content_control'), this.controller.update);
    this.router.delete(this.path + '/:id', protect, check_access('frontend_content_control'), this.controller.delete);
  }
}
