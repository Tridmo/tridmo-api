import { NextFunction, Request, Response } from "express";
import NotificationsService from './notifications.service';
import { reqT } from '../shared/utils/language';
import { CustomRequest } from "../shared/interface/routes.interface";
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

export default class NotificationsController {
  private service = new NotificationsService()

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.body?.notifier_id) {
        req.body.notifier_id = req.user.profile.id
      }
      const data = await this.service.create(req.body)

      res.status(201).json({
        success: true,
        data: {
          notification: data
        },
        message: reqT('created_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public markAsSeen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = await this.service.update(
        { id, seen: false },
        { seen: true }
      )

      res.status(200).json({
        success: true,
        data: {
          notification: data
        },
        message: reqT('updated_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public markAsSeenMany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateMany(
        req.body.notifications.map(e => { return { id: e, seen: false } }),
        { seen: true }
      )

      res.status(200).json({
        success: true,
        data: {
          notification: data
        },
        message: reqT('updated_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public markAsSeenAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateByReceipent(
        { recipient_id: req.user.profile.id, seen: false },
        { seen: true }
      )

      res.status(200).json({
        success: true,
        data: {
          notifications: data
        },
        message: reqT('updated_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filters, sorts } = extractQuery(req.query)
      const data = await this.service.findBy({
        ...filters,
        recipient_id: req.user.profile.id,
      }, sorts)

      const count = await this.service.count({
        ...filters,
        recipient_id: req.user.profile.id,
      })
      const unreadCount = await this.service.count({
        ...filters,
        seen: false,
        recipient_id: req.user.profile.id,
      })

      res.status(200).json({
        success: true,
        data: {
          unread_count: unreadCount,
          notifications: data,
          pagination: buildPagination(count, sorts)
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public counts = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const unreadCount = await this.service.count({
        seen: false,
        recipient_id: req.user.profile.id,
      })

      res.status(200).json({
        success: true,
        data: {
          unread_count: unreadCount,
        }
      })
    } catch (error) {
      next(error)
    }
  }


  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      await this.service.deleteById(id)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public deleteAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteBy({
        recipient_id: req.user.profile.id
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