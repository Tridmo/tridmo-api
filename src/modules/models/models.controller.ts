import { isEmpty, isUUID } from "class-validator";
import { NextFunction, query, Request, Response } from "express";
import buildPagination from "../shared/utils/paginationBuilder";
import extractQuery from "../shared/utils/extractQuery";
import { ICounts, IGetCountsQuery, IGetModelsQuery } from "./models.interface";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import { defaults } from "../shared/defaults/defaults"
import { CustomRequest } from "../shared/interface/routes.interface";
import ModelService from "./models.service";
import { UploadedFile } from "express-fileupload";
import ModelImageService from "./model_images/model_images.service";
import { reqT } from "../shared/utils/language";
import InteractionService from "../interactions/interactions.service";
import logger from "../../lib/logger";


export default class ModelsController {
  private modelsService = new ModelService()
  private modelImageService = new ModelImageService()
  private interactionsService = new InteractionService()

  public compress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sorts } = extractQuery(req.query)
      const data = await this.modelsService.compressModelsImages(req.body.alreadyDoneIds, sorts.limit);
      res.status(200).json({
        data
      })
    } catch (error) {
      logger.error('Model Image Compress Error: ', error);

      next(error)
    }
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const model = await this.modelsService.create(
        req.body,
        req.files[defaults.reqCoverName] as UploadedFile,
        req.files[defaults.reqImagesName] as UploadedFile[],
        req.files[defaults.reqFileName] as UploadedFile,
      )

      res.status(201).json({
        success: true,
        data: {
          model
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

      const model = await this.modelsService.update(
        id,
        req.body,
        req.files && req.files[defaults.reqCoverName] ? req.files[defaults.reqCoverName] as UploadedFile : null,
        req.files && req.files[defaults.reqImagesName] ? req.files[defaults.reqImagesName] as UploadedFile[] : null,
        req.files && req.files[defaults.reqFileName] ? req.files[defaults.reqFileName] as UploadedFile : null,
      )

      res.status(200).json({
        success: true,
        data: {
          model
        },
        message: reqT('saved_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const data = await this.modelsService.findAll(filters, sorts)
      const count = await this.modelsService.count(filters)

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

  public getCartModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const data = await this.modelsService.findForCart(filters, sorts)

      res.status(200).json({
        success: true,
        data: {
          models: data,
          count: data.length
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public getCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filters } = extractQuery(req.query)

      const count = await this.modelsService.count(filters)

      res.status(200).json({
        success: true,
        data: {
          count: count,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public getCounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: IGetCountsQuery = extractQuery(req.query).filters
      const counts: ICounts = {}

      const { all, top, available, not_available, deleted, ...others } = filters

      if (all) counts.all = await this.modelsService.count({})
      if (top) counts.top = await this.modelsService.count({ ...others, top: true })
      if (available) counts.available = await this.modelsService.count({ ...others, availability: 1 })
      if (not_available) counts.not_available = await this.modelsService.count({ ...others, availability: 2 })
      if (deleted) counts.deleted = await this.modelsService.count({ ...others, is_deleted: true })
      else counts.count = await this.modelsService.count({ ...others })

      res.status(200).json({
        success: true,
        data: {
          counts,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const model = await this.modelsService.findOne(req.params.identifier, req.user?.profile)

      // update views
      await this.interactionsService.increment(model?.interaction_id, 'views')

      res.status(200).json({
        success: true,
        data: {
          model
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getCoverImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cover = await this.modelImageService.findModelCover(req.params.id)

      res.status(200).json({
        success: true,
        data: cover
      })
    } catch (error) {
      next(error)
    }
  }

  public getOneByFilters = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { query } = req
      const extractedQuery = extractQuery(query)
      const filters = extractedQuery.filters

      let data = await this.modelsService.findByFilters(filters)

      res.status(200).json({
        success: true,
        data: {
          model: data
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.modelsService.deleteImage(req.params.image_id)

      res.status(200).json({
        success: true,
        message: "Image deleted successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public addColors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const added = await this.modelsService.addColors(
        req.params.id,
        req.body.colors
      )

      res.status(201).json({
        success: true,
        message: "Colors added successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public addImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const added = await this.modelsService.addImages(
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

  public updateFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = await this.modelsService.updateFile(
        req.params.id,
        req.files[defaults.reqFileName] as UploadedFile
      )

      res.status(200).json({
        success: true,
        message: "File uploaded and updated successfully",
        data: {
          file
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public addMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const added = await this.modelsService.addMaterials(
        req.params.id,
        req.body.materials
      )

      res.status(201).json({
        success: true,
        message: "Materials added successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public removeMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleted = await this.modelsService.removeMaterial(
        req.params.id,
        Number(req.params.material_id)
      )

      res.status(200).json({
        success: true,
        message: "Material removed from product"
      })
    } catch (error) {
      next(error)
    }
  }

  public removeColor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleted = await this.modelsService.removeColor(
        req.params.id,
        Number(req.params.color_id)
      )

      res.status(200).json({
        success: true,
        message: "Color removed from model"
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.modelsService.deleteById(req.params.id)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public download = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const presignedUrl = await this.modelsService.download(
        req.params.id,
        req.user
      )

      res.status(200).json({
        success: true,
        message: 'Url is valid for 60 seconds!',
        data: {
          url: presignedUrl
        }
      })
    } catch (error) {
      next(error)
    }
  }
}