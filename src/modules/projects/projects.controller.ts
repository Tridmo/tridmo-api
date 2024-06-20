import { NextFunction, Request, Response } from "express";
import InteriorModelsService from './projects.service';
import { reqT } from '../shared/utils/language';
import { CustomRequest } from "../shared/interface/routes.interface";
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

export default class InteriorModelsController {
  private service = new InteriorModelsService()

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.create({
        ...req.body,
        user_id: req.user.profile.id,
      })

      res.status(201).json({
        success: true,
        data: {
          project: data
        },
        message: reqT('created_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public addModel = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.addModel({
        project_id: req.params.id,
        model_id: req.params.model_id
      }, req.user.profile)

      res.status(201).json({
        success: true,
        data: {
          project_model: data
        },
        message: reqT('added_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public addModelToMany = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.addModelToManyProjects(req.params.model_id, req.body.projects, req.user.profile)

      res.status(200).json({
        success: true,
        data: {
          project_models: data
        },
        message: reqT('added_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = await this.service.update(id, req.body, req.user.profile)

      res.status(200).json({
        success: true,
        data: {
          project: data
        },
        message: reqT('saved_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filters, sorts } = extractQuery(req.query)
      filters.user_id = req.user.profile.id
      const data = await this.service.findAll(filters, sorts)

      const count = await this.service.count(filters)

      res.status(200).json({
        success: true,
        data: {
          projects: data,
          pagination: buildPagination(count, sorts)
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.findById(req.params.id, req.user.profile)

      res.status(200).json({
        success: true,
        data: {
          project: data
        }
      })
    } catch (error) {
      next(error)
    }
  }


  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id, req.user.profile)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public removeModel = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deletepProjectModel(req.params.id, req.params.model_id, req.user.profile)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }
}