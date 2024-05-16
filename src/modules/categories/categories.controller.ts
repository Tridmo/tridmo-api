import { IGetModelsQuery } from '../models/models.interface';
import { NextFunction, Request, Response } from "express";
import extractQuery from "../../modules/shared/utils/extractQuery";
import CategoryService from "./categories.service";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.dto";
import { IGetCategoriesQuery } from "./categories.interface";
import { reqT } from '../shared/utils/language';

export default class CategoriesController {
  private categoriesService = new CategoryService()

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryData: CreateCategoryDTO = req.body
      const data = await this.categoriesService.create(categoryData)

      res.status(201).json({
        success: true,
        data,
        message: reqT('created_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryData: UpdateCategoryDTO = req.body
      const { id } = req.params
      const data = await this.categoriesService.update(id, categoryData)

      res.status(200).json({
        success: true,
        data,
        message: reqT('saved_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req;
      const extractedQuery = extractQuery(query)
      const filters = extractedQuery.filters


      const data = await this.categoriesService.findAll(filters)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getByBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.categoriesService.findByBrand(req.params.brand_id)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getAllParents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const { query } = req;
      const { filters, sorts } = extractQuery(query)

      const data = await this.categoriesService.findAllParents(filters, sorts)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getChildrenOfCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = await this.categoriesService.findChildren(id)

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
      const data = await this.categoriesService.findOne(id)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public deleteOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const { cascade } = req.query

      await this.categoriesService.delete(id, cascade && cascade == 'true')

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }
}