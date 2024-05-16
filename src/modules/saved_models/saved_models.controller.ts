import { NextFunction, Request, Response } from "express";
import SavedModelsService from './saved_models.service';
import { CustomRequest } from '../shared/interface/routes.interface';
import { reqT } from '../shared/utils/language';
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

export default class SavedModelsController {
  private service = new SavedModelsService()

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      const data = await this.service.create({
        user_id: req.user.profile.id,
        model_id: req.body.model_id
      })

      res.status(201).json({
        success: true,
        data,
        message: reqT('saved_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const data = await this.service.findAll(
        {
          ...filters,
          user_id: req.user.profile.id
        },
        sorts
      )
      const count = await this.service.count(
        {
          ...filters,
          user_id: req.user.profile.id
        }
      )
      res.status(200).json({
        success: true,
        data: {
          models: data,
          pagination: buildPagination(count, sorts)
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { model_id } = req.params
      await this.service.delete({
        user_id: req.user.profile.id,
        model_id: model_id
      })

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }
}