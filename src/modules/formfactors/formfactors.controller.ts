import { NextFunction, Request, Response } from "express";

import FormfactorService from "./formfactors.service";

import { CreateFormfactorDTO, UpdateFormfactorDTO } from "./dto/formfactors.dto";
import { ISearchQuery } from "../shared/interface/query.interface";
 
export default class FormfactorsController {
    private formfactorsService = new FormfactorService()

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const formfactorData: CreateFormfactorDTO = req.body
            const data = await this.formfactorsService.create(formfactorData)

            res.status(201).json({
                success: true,
                data,
                message: "Formfactor created successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const formfactorData: UpdateFormfactorDTO = req.body
            const { id } = req.params
            const data = await this.formfactorsService.update(id, formfactorData)

            res.status(200).json({
                success: true,
                data,
                message: "Formfactor updated successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { query } = req
            const { keyword }: ISearchQuery = query
            const data = await this.formfactorsService.findAll(keyword)

            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }

    public getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            const data = await this.formfactorsService.findOne(id)

            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            await this.formfactorsService.delete(id)
            
            res.status(200).json({
                success: true,
                message: "Formfactor deleted successfully"
            })
        } catch (error) {
            next(error)
        }
    }
}