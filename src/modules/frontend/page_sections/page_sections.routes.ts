import { Router } from "express";
import protect from "../../shared/middlewares/auth/protect";
import check_access from "../../shared/middlewares/auth/check_access";
import { Routes } from "../../shared/interface/routes.interface";
import { PageSectionsController } from "./page_sections.controller";

export class PageSectionsRoute implements Routes {
  public path = '/page-sections';
  public router = Router();
  public controller = new PageSectionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path + '/', this.controller.getAll);
    this.router.get(this.path + '/byname/:name', this.controller.getByName);
    this.router.get(this.path + '/:id', this.controller.getById);
    this.router.post(this.path + '/', protect, check_access('frontend_content_control'), this.controller.create);
    this.router.put(this.path + '/:id', protect, check_access('frontend_content_control'), this.controller.update);
    this.router.delete(this.path + '/:id', protect, check_access('frontend_content_control'), this.controller.delete);
  }
}

