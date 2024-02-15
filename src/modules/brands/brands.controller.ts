import { NextFunction, Request, Response } from "express";
import flat from "flat";
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

import BrandService from "./brands.service";
import { CreateBrandDTO, UpdateBrandDTO } from "./dto/brands.dto";
import { ISearchQuery } from "../shared/interface/query.interface";
import { IDefaultQuery } from "../shared/interface/query.interface";
import { defaults } from "../shared/defaults/defaults";
import ImageService from "../shared/modules/images/images.service";
import { uploadFile } from "../shared/utils/fileUpload";
import { UploadedFile } from "express-fileupload";

export default class BrandsController {
  private brandsService = new BrandService()
  private imagesService = new ImageService()

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, site_link, description, username, password }: CreateBrandDTO = req.body

      const data = await this.brandsService.create(
        {
          name: name.replace(/\s/g, ''),
          site_link,
          description,
          username,
          password
        },
        req.files.image as UploadedFile
      )

      res.status(201).json({
        success: true,
        data: {
          ...data
        },
        message: "Brand created successfully"
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
        message: "Brand updated successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req
      const { keyword }: ISearchQuery = query
      const filters = extractQuery(query).filters
      const sorts = extractQuery(query).sorts

      if (!query.limit) {
        const brandsCount = await this.brandsService.count()
        sorts.limit = brandsCount
      }

      const data = await this.brandsService.findAll(keyword, filters, sorts)
      const pagination = buildPagination((await this.brandsService.count()), sorts)

      // const result = []
      // for (const brand of data) {
      //     result.push(flat.unflatten(brand))
      // }

      res.status(200).json({
        success: true,
        data: {
          brands: data,
          pagination
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const data = await this.brandsService.findOne(id)

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
        message: "Brand deleted successfully"
      })
    } catch (error) {
      next(error)
    }
  }
}