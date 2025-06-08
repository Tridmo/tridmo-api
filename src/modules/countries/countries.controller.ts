import { NextFunction, Response } from "express";

import CountryService from "./countries.service";

import extractQuery from "../shared/utils/extractQuery";

import { CustomRequest } from "modules/shared/interface/routes.interface";
import { CreateCountryDTO, UpdateCountryDTO } from "./dto/countries.dto";

export default class CountriesController {
    private readonly countriesService = new CountryService()

    public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const countryData: CreateCountryDTO = req.body

            const data = await this.countriesService.create(countryData)

            res.status(201).json({
                success: true,
                data,
                message: req.t.created_successfully()
            })
        } catch (error) {
            next(error)
        }
    }

    public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const countryData: UpdateCountryDTO = req.body
            const { id } = req.params

            const data = await this.countriesService.update(id, countryData)

            res.status(200).json({
                success: true,
                data,
                message: req.t.updated_successfully()
            })
        } catch (error) {
            next(error)
        }
    }

    public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { query } = req
            const filters = extractQuery(query).filters
            const sorts = extractQuery(query).sorts

            const data = await this.countriesService.findAll(filters, sorts)

            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }

    public getOne = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params

            const data = await this.countriesService.findOne(id)

            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }

    public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params

            const data = await this.countriesService.delete(id)

            res.status(200).json({
                success: true,
                data,
                message: req.t.deleted_successfully()
            })
        } catch (error) {
            next(error)
        }
    }
}