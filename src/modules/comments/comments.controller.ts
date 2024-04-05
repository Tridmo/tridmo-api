import { NextFunction, Request, Response } from "express";
import { RequestWithUser } from '../shared/interface/routes.interface';
import CommentsService from './comments.service';
import extractQuery from '../shared/utils/extractQuery';

export default class CommentsController {
    private service = new CommentsService()

    public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {

            const data = await this.service.create(req.body, req.user.profile)

            res.status(201).json({
                success: true,
                data: {
                    comment: data
                },
                message: "Comment created successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {

            const data = await this.service.update(req.params.id, req.body)

            res.status(200).json({
                success: true,
                data: {
                    comment: data
                },
                message: "Comment updated successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const { filters, sorts } = extractQuery(req.query)

            const data = await this.service.findAll(filters, sorts)

            res.status(200).json({
                success: true,
                data: {
                    comments: data
                }
            })
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            await this.service.delete({ id })

            res.status(200).json({
                success: true,
                message: "Comment deleted"
            })
        } catch (error) {
            next(error)
        }
    }
}