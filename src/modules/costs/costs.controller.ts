import { NextFunction, Request, Response } from "express";

import CostService from "./costs.service";

import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

import { CreateCostDTO, UpdateCostDTO } from "./dto/costs.dto";
import { ISearchQuery } from "../shared/interface/query.interface";

export default class CostsController {
    private costsService = new CostService()

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const costData: CreateCostDTO = req.body

            const data = await this.costsService.create(costData)

            res.status(201).json({
                success: true,
                data,
                message: "Cost created successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const costData: UpdateCostDTO = req.body
            const { id } = req.params

            const data = await this.costsService.update(id, costData)

            res.status(200).json({
                success: true,
                data,
                message: "Cost updated successfully"
            })
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { query } = req
            const filters = extractQuery(query).filters
            const sorts = extractQuery(query).sorts

            const data = await this.costsService.findAll(filters, sorts)

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

            const data = await this.costsService.findOne(id)

            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }
}