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
import UsersService from "../users/users.service";
import ErrorResponse from "../shared/utils/errorResponse";
import { CustomRequest } from "../shared/interface/routes.interface";
import { authVariables } from "../auth/variables";
import BrandsDAO from "./brands.dao";

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

  public getAllByUserDownloads = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await new UsersService().getByUsername_min(req.params.username);
      if (!user) throw new ErrorResponse(404, req.t.user_404())

      const data = await this.brandsService.findAllByUserDownloads(user.id)

      res.status(200).json({
        success: true,
        data: {
          brands: data,
        }
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier } = req.params

      const data = await this.brandsService.findOne(identifier)

      if (
        !!req.user &&
        (
          req.user?.profile?.role_id == authVariables.roles.admin ||
          req.user?.profile?.role?.id == authVariables.roles.admin
        )
      ) {
        const brandAdmin = await new BrandsDAO().getBrandAdmin({ brand_id: data.id });
        if (!!brandAdmin) data['username'] = brandAdmin.profiles?.username
      }

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