import { ISearchQuery, IDefaultQuery } from './../shared/interface/query.interface';
import { isEmpty, isUUID } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { defaults, fileDefaults } from "../shared/defaults/defaults"
import { CustomRequest } from "../shared/interface/routes.interface";

import ImageService from "../shared/modules/images/images.service";
import { uploadFile } from "../shared/utils/fileUpload";
import InteriorService from "./interiors.service";
import InteriorModelsService from "./interior_models/interior_models.service";
import extractQuery from '../../modules/shared/utils/extractQuery';
import buildPagination from '../../modules/shared/utils/paginationBuilder';
import { IGetModelsQuery } from '../models/models.interface';
import { UploadedFile } from 'express-fileupload';
import { IGetInteriorsQuery } from './interiors.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import UsersService from '../users/users.service';
import InteriorImageService from './interior_images/interior_images.service';
import { reqT } from '../shared/utils/language';
import { processValue } from '../shared/utils/processObject';
import UserRoleService from '../users/user_roles/user_roles.service';
import { authVariables } from '../auth/variables';
import InteractionService from '../interactions/interactions.service';
import InteriorViewsDAO from './interior_views/dao';
import requestIp from 'request-ip';
import path from 'path';
import fs from 'fs';
import logger from '../../lib/logger';

export default class InteriorsController {
  private interiorsService = new InteriorService()
  private interiorImagesService = new InteriorImageService()
  private interactionsService = new InteractionService()
  private usersService = new UsersService()
  private interiorModelsService = new InteriorModelsService()

  public compress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sorts } = extractQuery(req.query)
      const data = await this.interiorsService.compressInteriorsImages(req.body.alreadyDoneIds, sorts.limit);
      res.status(200).json({
        data
      })
    } catch (error) {
      logger.error('COMPRESS ERROR: ', error);
      next(error)
    }
  }

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { image_tags, ...interiorValues } = req.body
      const interior = await this.interiorsService.create(
        interiorValues,
        req.files[defaults.reqCoverName] as UploadedFile,
        req.files[defaults.reqImagesName] as UploadedFile[],
        req.user.profile
      )

      res.status(201).json({
        success: true,
        data: {
          interior
        },
        message: reqT('interior_created')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { query } = req
      const extractedQuery = extractQuery(query)
      const sorts: IDefaultQuery = extractedQuery.sorts
      const filters: IGetInteriorsQuery = extractedQuery.filters

      if (query.status) {
        const s = processValue(query.status)

        if (s == '0') {
          if (!req.user) throw new ErrorResponse(401, reqT('unauthorized'))
          const role = await new UserRoleService().getByUserAndRole({ user_id: req.user.profile.id, role_id: authVariables.roles.admin })
          if (!role) throw new ErrorResponse(401, reqT('unauthorized'))
        }
      }

      if (filters.author) {
        const user = await this.usersService.getByUsername(filters.author)
        if (!user) throw new ErrorResponse(404, reqT('user_404'))
        filters.author = user.id
      }

      const data = await this.interiorsService.findAll(filters, sorts)
      const interiorCount = await this.interiorsService.count(filters)

      const pagination = buildPagination(Number(interiorCount), sorts)

      res.status(200).json({
        success: true,
        data: {
          interiors: data,
          pagination
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getByAuthor = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { query, user } = req
      const extractedQuery = extractQuery(query)
      const sorts: IDefaultQuery = extractedQuery.sorts
      const filters: IGetInteriorsQuery = extractedQuery.filters

      if (query.status) {
        const s = processValue(query.status)
        if (s == '0' || s.includes('0')) {
          const roles = await new UserRoleService().getByUserId(user.profile.id)
          if (!roles || !roles.length || !roles.includes(authVariables.roles.designer) || !roles.includes(authVariables.roles.admin)) throw new ErrorResponse(401, reqT('unauthorized'))
        }
      }

      filters.author = user.profile.id

      const data = await this.interiorsService.findAll(filters, sorts)
      const interiorCount = await this.interiorsService.count(filters)

      const pagination = buildPagination(Number(interiorCount), sorts)

      res.status(200).json({
        success: true,
        data: {
          interiors: data,
          pagination
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getCoverImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cover = await this.interiorImagesService.findInteriorCover(req.params.id)

      res.status(200).json({
        success: true,
        data: cover
      })
    } catch (error) {
      next(error)
    }
  }

  public getCounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const all = await this.interiorsService.count({})
      const unchecked = await this.interiorsService.count({ status: 0 })
      const checked = await this.interiorsService.count({ status: 1 })

      res.status(200).json({
        success: true,
        data: {
          all,
          checked,
          unchecked
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const data = await this.interiorsService.findOne(req.params.identifier, req.user?.profile)

      // update views
      await new InteriorViewsDAO().create({
        interior_id: data.id,
        user_id: req?.user?.profile?.id,
        ip_address: requestIp.getClientIp(req),
        client_agent: req.headers['user-agent']
      })
      await this.interactionsService.increment(data?.interaction_id, 'views')

      res.status(200).json({
        success: true,
        data: {
          interior: data
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public addLike = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const liked = await this.interiorsService.addLike({ interior_id: req.params.id, user_id: req.user?.profile?.id })
      res.status(200).json({ success: liked })
    } catch (error) {
      next(error)
    }
  }

  public removeLike = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      await this.interiorsService.removeLike({ interior_id: req.params.id, user_id: req.user?.profile?.id })
      res.status(200).json({ success: true })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      const data = await this.interiorsService.update(
        req.params.id,
        req.body,
        req.user.profile,
        req.files && req.files[defaults.reqCoverName] ? req.files[defaults.reqCoverName] as UploadedFile : null,
        req.files && req.files[defaults.reqImagesName] ? req.files[defaults.reqImagesName] as UploadedFile[] : null,
      );

      res.status(200).json({
        success: true,
        message: reqT('saved_successfully'),
        data: {
          interior: data
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public updateStatus = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      const data = await this.interiorsService.update(
        req.params.id,
        req.body,
        req.user.profile,
        null,
        null
      );

      res.status(200).json({
        success: true,
        message: reqT('saved_successfully'),
        data: {
          interior: data
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public addImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const added = await this.interiorsService.addImages(
        req.params.id,
        req.files[defaults.reqCoverName] as UploadedFile,
        req.files[defaults.reqImagesName] as UploadedFile[]
      )

      res.status(201).json({
        success: true,
        message: reqT('saved_successfully'),
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: string = req.params.id

      await this.interiorsService.deleteById(id, req.user.profile)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.interiorsService.deleteImage(req.params.image_id)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

}