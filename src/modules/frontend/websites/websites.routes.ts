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
    // Apply middleware to all routes in this router.
    this.router.use(protect, check_access('frontend_content_control'));

    this.router.get(this.path + '/', this.controller.getAll);
    this.router.get(this.path + '/byname/:name', this.controller.getByName);
    this.router.get(this.path + '/:id', this.controller.getById);
    this.router.post(this.path + '/', this.controller.create);
    this.router.put(this.path + '/:id', this.controller.update);
    this.router.delete(this.path + '/:id', this.controller.delete);
  }
}
