import { ISearchQuery, IDefaultQuery } from './../shared/interface/query.interface';
import { isEmpty, isUUID } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { defaults, fileDefaults } from "../shared/defaults/defaults"
import { RequestWithUser } from "../shared/interface/routes.interface";

import ImageService from "../shared/modules/images/images.service";
import { uploadFile } from "../shared/utils/fileUpload";
import InteriorService from "./interiors.service";
import InteriorModelsService from "./interior_models/interior_models.service";
import extractQuery from '../../modules/shared/utils/extractQuery';
import buildPagination from '../../modules/shared/utils/paginationBuilder';
import { IGetModelsQuery } from '../../modules/models/interface/models.interface';
import { UploadedFile } from 'express-fileupload';
import { IGetInteriorsQuery } from './interface/interiors.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import UsersService from '../users/users.service';
import InteriorImageService from './interior_images/interior_images.service';

export default class InteriorsController {
  private interiorsService = new InteriorService()
  private interiorImagesService = new InteriorImageService()
  private imagesService = new ImageService()
  private usersService = new UsersService()
  private interiorModelsService = new InteriorModelsService()

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
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
        message: "Interior created successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req
      const { keyword }: ISearchQuery = query
      const extractedQuery = extractQuery(query)
      const sorts: IDefaultQuery = extractedQuery.sorts
      const filters: IGetInteriorsQuery = extractedQuery.filters

      if (filters.author) {
        const user = await this.usersService.getByUsername(filters.author)
        if (!user) throw new ErrorResponse(404, 'User was not found')
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

  public getByAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req
      const extractedQuery = extractQuery(query)
      const sorts: IDefaultQuery = extractedQuery.sorts

      const data = await this.interiorsService.findByAuthorUsername(
        req.params.username,
        sorts
      )
      const interiorCount =
        data.length > 0 ?
          await this.interiorsService.count(
            data.length && data[0] ? {
              author: data[0].user_id
            } : {}
          )
          : 0

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

  public getOne = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await this.interiorsService.findOne(req.params.identifier, req.user.profile)

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

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const data = await this.interiorsService.update(
        req.params.id,
        req.body
      );

      res.status(201).json({
        success: true,
        message: "Interior updated successfully",
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
        message: "Images added successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: string = req.params.id

      await this.interiorsService.deleteById(id)

      res.status(200).json({
        success: true,
        message: "Interior was deleted successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleted = await this.interiorsService.deleteImage(req.params.image_id)

      res.status(deleted ? 200 : 500).json({
        success: Boolean(deleted),
        message: deleted ? "Image deleted successfully" : "Something went wrong"
      })
    } catch (error) {
      next(error)
    }
  }

}