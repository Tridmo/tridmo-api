import { NextFunction, Request, Response } from "express";
import buildPagination from "../shared/utils/paginationBuilder";
import extractQuery from "../shared/utils/extractQuery";
import { defaults } from "../shared/defaults/defaults"
import { CustomRequest } from "../shared/interface/routes.interface";
import ProductService from "./products.service";
import { UploadedFile } from "express-fileupload";
import ProductImageService from "./product_images/product_images.service";
import { reqT } from "../shared/utils/language";

export default class ProductsController {
  private productsService = new ProductService()
  private productImageService = new ProductImageService()


  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productsService.create(
        req.body,
        req.files[defaults.reqCoverName] as UploadedFile,
        req.files[defaults.reqImagesName] as UploadedFile[],
      )

      res.status(201).json({
        success: true,
        data: {
          product
        },
        message: reqT('created_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public createFromModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productsService.createFromModel(req.params.model_id, req.body);

      res.status(201).json({
        success: true,
        data: { product },
        message: reqT('created_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productsService.update(
        req.params.id,
        req.body,
        req.files && req.files[defaults.reqCoverName] ? req.files[defaults.reqCoverName] as UploadedFile : null,
        req.files && req.files[defaults.reqImagesName] ? req.files[defaults.reqImagesName] as UploadedFile[] : null
      )

      res.status(200).json({
        success: true,
        data: { product },
        message: reqT('saved_successfully')
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const data = await this.productsService.findAll(filters, sorts)
      const count = await this.productsService.count(filters)

      res.status(200).json({
        success: true,
        data: {
          products: data,
          pagination: buildPagination(count, sorts)
        },
      })
    } catch (error) {
      next(error)
    }
  }

  public getCartProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const data = await this.productsService.findForCart(filters, sorts)

      res.status(200).json({
        success: true,
        data: {
          products: data,
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

      const count = await this.productsService.count(filters)

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

  public getOne = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.productsService.findOne(req.params.identifier, req.user?.profile)

      res.status(200).json({
        success: true,
        data: { product }
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.productsService.deleteById(req.params.id)

      res.status(200).json({
        success: true,
        message: reqT('deleted_successfully')
      })
    } catch (error) {
      next(error)
    }
  }
}