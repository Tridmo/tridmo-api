import { NextFunction, Request, Response } from "express";
import SavedInteriorsService from './saved_interiors.service';
import { CustomRequest } from '../shared/interface/routes.interface';
import { reqT } from '../shared/utils/language';
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

export default class SavedInteriorsController {
  private service = new SavedInteriorsService()

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      const data = await this.service.create({
        user_id: req.user.profile.id,
        interior_id: req.body.interior_id
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

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const data = await this.service.findAll(filters, sorts)
      const count = await this.service.count(filters)

      res.status(200).json({
        success: true,
        data: {
          interiors: data,
          pagination: buildPagination(count, sorts)
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { interior_id } = req.params
      await this.service.delete({
        user_id: req.user.profile.id,
        interior_id: interior_id
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