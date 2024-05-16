import { NextFunction, Request, Response } from "express";
import flat from "flat";
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

import BrandService from "./brands.service";
import { CreateBrandDTO, UpdateBrandDTO } from "./brands.dto";
import { ISearchQuery } from "../shared/interface/query.interface";
import { IDefaultQuery } from "../shared/interface/query.interface";
import { defaults } from "../shared/defaults/defaults";
import ImageService from "../shared/modules/images/images.service";
import { uploadFile } from "../shared/utils/fileUpload";
import { UploadedFile } from "express-fileupload";
import { reqT } from '../shared/utils/language';

export default class BrandsController {
  private brandsService = new BrandService()
  private imagesService = new ImageService()

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      const data = await this.brandsService.create(
        req.body as CreateBrandDTO,
        req.files.image as UploadedFile
      )

      res.status(201).json({
        success: true,
        data: {
          ...data
        },
        message: reqT('created_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const brandData: UpdateBrandDTO = req.body
      const { id } = req.params

      const data = await this.brandsService.update(id, brandData, req.files?.image as UploadedFile)

      res.status(200).json({
        success: true,
        data: {
          brand: data
        },
        message: reqT('saved_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req
      const filters = extractQuery(query).filters
      const sorts = extractQuery(query).sorts

      const data = await this.brandsService.findAll(filters, sorts)
      const count = await this.brandsService.count(filters)

      res.status(200).json({
        success: true,
        data: {
          brands: data,
          pagination: buildPagination(count, sorts)
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = req.params

      const data = await this.brandsService.findOne(identifier)

      res.status(200).json({
        success: true,
        data: {
          brand: flat.unflatten(data)
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      await this.brandsService.delete(id)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }
}