import { NextFunction, Request, Response } from "express";
import InteriorModelsService from './interior_models.service';
import { reqT } from '../shared/utils/language';
import { CustomRequest } from "../shared/interface/routes.interface";
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";
import { authVariables } from "../auth/variables";
import InteriorService from "../interiors/interiors.service";
import ErrorResponse from "../shared/utils/errorResponse";

export default class InteriorModelsController {
  private service = new InteriorModelsService()
  private interiors = new InteriorService()

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.create(req.body)

      res.status(201).json({
        success: true,
        data: {
          tag: data
        },
        message: reqT('created_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = await this.service.update(id, req.body)

      res.status(200).json({
        success: true,
        data: {
          tag: data
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
      const data = await this.service.findAll(filters, sorts)

      res.status(200).json({
        success: true,
        data: {
          tags: data
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getInteriorsByTaggedModel = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const data = await this.service.findInteriorsByTaggedModel(req.params.model_id, filters, sorts)
      const count = await this.service.count({ model_id: req.params.model_id })

      res.status(200).json({
        success: true,
        data: {
          count,
          interiors: data,
          pagination: buildPagination(count, sorts)
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getByInterior = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.findBy({ interior_id: req.params.id })

      res.status(200).json({
        success: true,
        data: {
          tags: data
        }
      })
    } catch (error) {
      next(error)
    }
  }


  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tag = await this.service.findById(req.params.id)
      if (!tag) throw new ErrorResponse(403, req.t.interior_model_404(), 'not_found');
      const interior = await this.interiors.findById(tag.interior_id)
      if (!interior) throw new ErrorResponse(403, req.t.interior_404(), 'not_found');

      if (req.user.profile.role_id != authVariables.roles.admin || req.user.profile.id != interior.user_id) {
        throw new ErrorResponse(403, req.t.access_denied(), 'access_denied')
      }

      await this.service.deleteBy({ id: req.params.id })

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public deleteByInterior = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interior = await this.interiors.findById(req.params.interior_id)
      if (!interior) throw new ErrorResponse(403, req.t.interior_404(), 'not_found');

      if (req.user.profile.role_id != authVariables.roles.admin || req.user.profile.id != interior.user_id) {
        throw new ErrorResponse(403, req.t.access_denied(), 'access_denied')
      }

      await this.service.deleteBy({
        interior_id: req.params.interior_id
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