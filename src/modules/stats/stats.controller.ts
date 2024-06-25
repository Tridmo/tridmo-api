import { NextFunction, Request, Response } from "express";
import StatsService from "./stats.service"
import { CustomRequest } from "../shared/interface/routes.interface";
import BrandsDAO from "../brands/brands.dao";
import ModelsDAO from "../models/models.dao";
import CategoriesDAO from "../categories/categories.dao";
import UsersDAO from "../users/users.dao";
import { authVariables } from "../auth/variables";
import InteriorsDAO from "../interiors/interiors.dao";


const modelDao = new ModelsDAO()

export default class StatsController {
  private service = new StatsService();

  public getRegisterStats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getRegisteredUsersStats({
        month: req.query.month,
        year: req.query.year
      })
      const userCount = await new UsersDAO().count({ role_id: authVariables.roles.designer })

      res.status(200).json({
        success: !!stats,
        data: {
          count: userCount,
          chart_data: stats
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getInteriorsStats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getInteriorsStats({
        month: req.query.month,
        year: req.query.year
      })
      const interiorsCount = await new InteriorsDAO().count({})

      res.status(200).json({
        success: !!stats,
        data: {
          count: interiorsCount,
          chart_data: stats
        }
      })
    } catch (error) {
      next(error)
    }
  }


  public getModelStats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const filters = {
        limit: req.query.limit || 10,
        month: req.query.month,
        year: req.query.year,
        week: req.query.week,
      }

      const models =
        req.query.topic == 'downloads'
          ? await this.service.getMostDownloadedModels(filters)
          : req.query.topic == 'tags'
            ? await this.service.getMostUsedModels(filters)
            : await this.service.getMostDownloadedModels(filters);

      const modelsCount = await modelDao.count({})
      const modelsAvailableCount = await modelDao.count({ availability: 1 })
      const modelsUnavailableCount = await modelDao.count({ availability: 2 })

      res.status(200).json({
        success: !!models || !!models.length,
        data: {
          count: modelsCount,
          available_count: modelsAvailableCount,
          unavailable_count: modelsUnavailableCount,
          top_list: models
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getBrandStats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const filters = {
        limit: req.query.limit || 10,
        month: req.query.month,
        year: req.query.year,
        week: req.query.week,
      }

      const brands =
        req.query.topic == 'downloads'
          ? await this.service.getBrandsWithMostDownloads(filters)
          : req.query.topic == 'tags'
            ? await this.service.getBrandsWithMostTags(filters)
            : await this.service.getBrandsWithMostDownloads(filters)

      const brandsCount = await new BrandsDAO().count({})

      res.status(200).json({
        success: !!brands || !!brands.length,
        data: {
          count: brandsCount,
          top_list: brands
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getCategoryStats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const filters = {
        limit: req.query.limit || 10,
        month: req.query.month,
        year: req.query.year,
        week: req.query.week,
      }

      const categs =
        req.query.topic == 'downloads'
          ? await this.service.getCategoriesWithMostDownloads(filters)
          : req.query.topic == 'tags'
            ? await this.service.getCategoriesWithMostTags(filters)
            : await this.service.getCategoriesWithMostDownloads(filters)

      const categsCount = await new CategoriesDAO().count({ type: 'model' })

      res.status(200).json({
        success: !!categs || !!categs.length,
        data: {
          count: categsCount,
          top_list: categs
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getDownloadStats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getDownloadsStats({
        month: req.query.month,
        year: req.query.year
      })
      const downloadsCount = await this.service.getDownloadsCount({
        model_id: req.query.model_id,
        brand_id: req.query.brand_id,
        user_id: req.query.user_id,
      })

      res.status(200).json({
        success: !!stats,
        data: {
          count: downloadsCount,
          chart_data: stats,
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getTagsStats = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getTagsStats({
        month: req.query.month,
        year: req.query.year
      })
      const tagsCount = await this.service.getTagsCount({
        model_id: req.query.model_id,
        brand_id: req.query.brand_id,
        user_id: req.query.user_id,
      })

      res.status(200).json({
        success: !!stats,
        data: {
          count: tagsCount,
          chart_data: stats,
        }
      })
    } catch (error) {
      next(error)
    }
  }
}