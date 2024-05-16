import { NextFunction, Request, Response } from "express";
import flat from "flat";
import { CustomRequest } from "../../shared/interface/routes.interface";
import requestIp from 'request-ip';

import { defaults } from "../../shared/defaults/defaults";
import { IGetUserProductViewFilters } from "./user_product_views.interface";
import UserProductViewService from "./user_product_views.service";

export default class UserProductViewsController {
  private userProductViewsService = new UserProductViewService()

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user_id = req.user?.profile.id
      const filters: IGetUserProductViewFilters = req.query
      if (user_id && !filters.user_id) filters.user_id = user_id

      const data = await this.userProductViewsService.findAll(filters)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getRecent = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqUser = req.user

      const limit = req.query.limit ? Number(req.query.limit) : defaults.recentViewsLimit

      let data = []

      if (reqUser) {
        const user_id = reqUser.profile.id
        data = await this.userProductViewsService.findWithLimit(limit, { user_id })


      } else {
        const remote_ip = requestIp.getClientIp(req);
        const device = req.headers['user-agent'];

        data = await this.userProductViewsService.findWithLimit(limit, { device, remote_ip })
      }

      const result = []

      for await (const model of data) {
        await result.push(flat.unflatten(model))
      }


      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }
}