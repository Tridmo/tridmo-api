import { IGetModelsQuery } from '../models/models.interface';
import { NextFunction, Request, Response } from "express";
import extractQuery from "../../modules/shared/utils/extractQuery";
import CategoryService from "./categories.service";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.dto";
import { IGetCategoriesQuery } from "./categories.interface";
import { reqT } from '../shared/utils/language';
import UsersService from '../users/users.service';
import ErrorResponse from '../shared/utils/errorResponse';
import { CustomRequest } from '../shared/interface/routes.interface';
import ModelService from '../models/models.service';
import ModelsDAO from '../models/models.dao';
import { IRequestFile } from '../shared/interface/files.interface';
import { defaults } from '../shared/defaults/defaults';

export default class CategoriesController {
  private categoriesService = new CategoryService()

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryData: CreateCategoryDTO = req.body
      const data = await this.categoriesService.create(categoryData, req.files?.[defaults.reqImageName] as IRequestFile)

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
      const data = await this.categoriesService.update(id, categoryData, req?.files?.[defaults.reqImageName] as IRequestFile)

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
      const { filters } = extractQuery(req.query)
      const data = await this.categoriesService.findByBrand(req.params.brand_id, filters)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getByUserDownloads = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await new UsersService().getByUsername_min(req.params.username);
      if (!user) throw new ErrorResponse(404, req.t.user_404())

      const { filters, sorts } = extractQuery(req.query)

      const data = await this.categoriesService.findByUserDownloads(user.id, filters)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }


  public getByUserInteriors = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await new UsersService().getByUsername_min(req.params.username);
      if (!user) throw new ErrorResponse(404, req.t.user_404())

      const data = await this.categoriesService.findByUserInteriors(user.id)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getByModelInteriors = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const model = await new ModelsDAO().getByIdOrSlug_min(req.params.identifier);
      if (!model) throw new ErrorResponse(404, req.t.model_404())

      const data = await this.categoriesService.findByModelInteriors(model.id)

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

  public getAllNonParents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const { query } = req;
      const { filters, sorts } = extractQuery(query)

      const data = await this.categoriesService.findAllNonParents(filters, sorts)

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