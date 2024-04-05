import { NextFunction, Request, Response } from "express";
import SavedModelsService from './saved_models.service';
import { RequestWithUser } from '../shared/interface/routes.interface';

export default class SavedModelsController {
    private service = new SavedModelsService()

    public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {

            const data = await this.service.create({
                user_id: req.user.profile.id,
                model_id: req.body.model_id
            })

            res.status(201).json({
                success: true,
                data,
                message: "Interior saved successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const data = await this.service.findAll(req.query)

            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { model_id } = req.params
            await this.service.delete({
                user_id: req.user.profile.id,
                model_id: model_id
            })

            res.status(200).json({
                success: true,
                message: "Interior removed from saved list"
            })
        } catch (error) {
            next(error)
        }
    }
}