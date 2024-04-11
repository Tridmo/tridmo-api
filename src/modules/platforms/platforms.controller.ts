import { NextFunction, Request, Response } from "express";
import { ISearchQuery } from "../shared/interface/query.interface";
import PlatformsService from './platforms.service';
import { CreatePlatformDto, UpdatePlatformDto } from './platforms.dto';
import { reqT } from '../shared/utils/language';
import extractQuery from '../shared/utils/extractQuery';

export default class PlatformsController {
    private service = new PlatformsService()

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const values: CreatePlatformDto = req.body
            const data = await this.service.create(values)

            res.status(201).json({
                success: true,
                data: {
                    platform: data
                },
                message: reqT('created_successfully')
            })
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const values: UpdatePlatformDto = req.body
            const { id } = req.params
            const data = await this.service.update(id, values)

            res.status(200).json({
                success: true,
                data: {
                    platform: data
                },
                message: reqT('saved_successfully')
            })
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { query } = req
            const { filters, sorts } = extractQuery(req.query)

            const data = await this.service.findAll(filters)

            console.log(data);

            res.status(200).json({
                success: true,
                data: {
                    platforms: data
                }
            })
        } catch (error) {
            next(error)
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            const data = await this.service.findOne(id)

            res.status(200).json({
                success: true,
                data: {
                    platform: data
                }
            })
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            await this.service.delete(id)

            res.status(200).json({
                success: true,
                message: reqT('deleted_successfully')
            })
        } catch (error) {
            next(error)
        }
    }
}