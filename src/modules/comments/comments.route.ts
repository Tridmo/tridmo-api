import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import checkUser from '../shared/middlewares/auth/check_user';
import CommentsController from './comments.controller';
import { CreateCommentDTO, UpdateCommentDTO } from './comments.dto';

export default class CommentsRoute implements Routes {
  public path = '/comments';
  public router = Router();
  public controller = new CommentsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all
    this.router.get(`${this.path}/`, this.controller.getAll);
    // Create new
    this.router.post(`${this.path}/`, protect, validate(CreateCommentDTO, "body"), this.controller.create);
    // Update
    this.router.post(`${this.path}/:id`, protect, validate(UpdateCommentDTO, "body"), this.controller.update);
    // Delete one
    this.router.delete(`${this.path}/:id`, protect, this.controller.delete);
  }
}
