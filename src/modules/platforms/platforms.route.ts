import { Router } from 'express';
import { ValidateUuidDTO } from '../shared/dto/params.dto';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import protect from '../shared/middlewares/auth/protect';
import check_access from '../shared/middlewares/auth/check_access';
import PlatformsController from './platforms.controller';
import { CreatePlatformDto, UpdatePlatformDto } from './platforms.dto';

export default class PlatformsRoute implements Routes {
    public path = '/platforms';
    public router = Router();
    public controller = new PlatformsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/model`, (req, res, next) => { req.query.type = '1'; next() }, this.controller.getAll);
        this.router.get(`${this.path}/render`, (req, res, next) => { req.query.type = '2'; next() }, this.controller.getAll);
        this.router.get(`${this.path}/:id`, validate(ValidateUuidDTO, "params"), this.controller.getOne);
        this.router.post(`${this.path}/`, protect, check_access("create_material"), validate(CreatePlatformDto, "body", true), this.controller.create);
        this.router.put(`${this.path}/:id`, protect, check_access("update_material"), validate(UpdatePlatformDto, "body", true), validate(ValidateUuidDTO, "params"), this.controller.update);
        this.router.delete(`${this.path}/:id`, protect, check_access("delete_material"), validate(ValidateUuidDTO, "params"), this.controller.delete);
    }
}
