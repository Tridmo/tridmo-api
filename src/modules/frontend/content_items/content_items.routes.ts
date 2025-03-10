import { Router } from "express";
import protect from "../../shared/middlewares/auth/protect";
import check_access from "../../shared/middlewares/auth/check_access";
import { Routes } from "../../shared/interface/routes.interface";
import { ContentItemsController } from "./content_items.controller";
import validationMiddleware from "../../shared/middlewares/validate";
import { CreateContentItemDTO } from "./content_items.dto";
import validateFiles from "../../shared/middlewares/validateFiles";
import { defaults } from "../../shared/defaults/defaults";

export class ContentItemsRoute implements Routes {
  public path = '/content-items';
  public router = Router();
  public controller = new ContentItemsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path + '/', this.controller.getAll);
    this.router.get(this.path + '/:id', this.controller.getById);
    this.router.post(this.path + '/',
      protect,
      check_access('frontend_content_control'),
      validationMiddleware(CreateContentItemDTO, 'body', false),
      validateFiles(
        defaults.reqDesktopImageName,
        defaults.reqTabletImageName,
        defaults.reqMobileImageName
      ),
      this.controller.create
    );
    this.router.put(this.path + '/:id',
      protect,
      check_access('frontend_content_control'),
      this.controller.update
    );
    this.router.delete(this.path + '/:id',
      protect,
      check_access('frontend_content_control'),
      this.controller.delete
    );
  }
}
