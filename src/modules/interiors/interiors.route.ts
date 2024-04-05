import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import InteriorsController from './interiors.controller';
import { CreateInteriorDTO, GetInteriorsQueryDTO, UpdateInteriorDTO } from './dto/interiors.dto';
import validateFiles from '../shared/middlewares/validateFiles';
import { defaults } from "../shared/defaults/defaults"
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
const { reqCoverName, reqFilesName, reqImagesName, reqPresentationName } = defaults
import checkUser from '../../modules/shared/middlewares/auth/check_user';
import modelsFilterMiddleware from '../../modules/shared/middlewares/models/filter';
export default class InteriorsRoute implements Routes {
  public path = '/interiors';
  public router = Router();
  public interiorsController = new InteriorsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/images/cover/:id`, this.interiorsController.getCoverImage);
    this.router.post(`${this.path}/images/:id`, protect, check_access("update_interior"), validate(ValidateUuidDTO, "params"), this.interiorsController.addImages);

    // Get all
    this.router.get(`${this.path}/`, validate(GetInteriorsQueryDTO, "query", true), this.interiorsController.getAll);
    // Get one
    this.router.get(`${this.path}/:identifier`, checkUser, this.interiorsController.getOne);

    // Create new
    this.router.post(
      `${this.path}/`,
      protect,
      check_access("create_interior"),
      validate(CreateInteriorDTO, "body", true),
      validateFiles(reqCoverName, reqImagesName),
      this.interiorsController.create
    );

    this.router.put(
      `${this.path}/:id`,
      protect,
      check_access("update_interior"),
      validate(ValidateUuidDTO, "params"),
      validate(UpdateInteriorDTO, "body", true),
      this.interiorsController.update
    );
    this.router.delete(`${this.path}/images/:image_id`, protect, check_access("update_interior"), this.interiorsController.deleteImage);
    this.router.delete(`${this.path}/:id`, protect, check_access("delete_interior"), validate(ValidateUuidDTO, "params"), this.interiorsController.delete);
  }
}
