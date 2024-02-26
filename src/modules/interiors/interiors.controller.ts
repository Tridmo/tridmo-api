import { IUpdateProduct } from './../products/interface/products.interface';
import { ISearchQuery, IDefaultQuery } from './../shared/interface/query.interface';
import { isEmpty } from "class-validator";
import { NextFunction, Request, Response } from "express";
import flat from "flat";
import requestIp from 'request-ip';
import ErrorResponse from "../shared/utils/errorResponse";
import generateSlug, { indexSlug } from "../shared/utils/generateSlug";

import { ICreateProduct } from "../products/interface/products.interface";
import { ICreateInterior, IInterior } from "./interface/interiors.interface";
import { ICreateModelImage } from "../products/model_images/interface/model_images.interface";
import { defaults, fileDefaults } from "../shared/defaults/defaults"
import { RequestWithUser } from "../shared/interface/routes.interface";

import ImageService from "../shared/modules/images/images.service";
import FileService from "../shared/modules/files/files.service";
import ModelImageService from "../products/model_images/model_images.service";
import ModelColorService from "../products/model_colors/model_colors.service";
import ProductService from "../products/products.service";
import RoleService from "../auth/roles/roles.service";
import { CreateInteriorDTO, UpdateInteriorDTO } from "./dto/interiors.dto";
import { uploadFile } from "../shared/utils/fileUpload";
import InteriorService from "./interiors.service";
import OrderService from "../orders/orders.service";
import OrderItemService from "../orders/order_items/order_items.service";
import { getFirst } from "../../modules/shared/utils/utils";
import InteriorModelsService from "./interior_models/interior_models.service";
import extractQuery from '../../modules/shared/utils/extractQuery';
import buildPagination from '../../modules/shared/utils/paginationBuilder';
import UserProductViewService from '../../modules/views/user_views/user_product_views.service';
import { IGetModelsQuery } from '../../modules/models/interface/models.interface';
import { s3Vars } from "../../config/conf";

export default class InteriorsController {
  private interiorsService = new InteriorService()
  private roleService = new RoleService()
  private productsService = new ProductService()
  private imagesService = new ImageService()
  private filesService = new FileService()
  private modelImagesService = new ModelImageService()
  private modelColorsService = new ModelColorService()
  private ordersService = new OrderService()
  private orderItemsService = new OrderItemService()
  private interiorModelsService = new InteriorModelsService()
  private userProductViewService = new UserProductViewService()

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { image_tags, ...interiorValues } = req.body
      const interior = await this.interiorsService.create(interiorValues, models)

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
      const filters: IGetModelsQuery = extractedQuery.filters

      const styles = req.query.styles
      const colors = req.query.colors
      const categories = req.query.categories

      const data = await this.interiorsService.findAll(keyword, sorts, categories, styles, colors, filters)
      const interiorCount = await this.interiorsService.count(keyword, filters, categories, styles, colors)



      const result = []
      for (const interior of data) {
        result.push(flat.unflatten(interior))
      }

      const pagination = buildPagination(Number(interiorCount), sorts)

      res.status(200).json({
        success: true,
        data: result,
        pagination
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      let { identifier } = req.params
      const { type } = req.query
      const reqUser = req.user;

      const isSlug = type && !isEmpty(type) && type == "slug"

      let data = isSlug
        ? await this.interiorsService.findBySlug(identifier)
        : await this.interiorsService.findOne(identifier)

      const file = await this.filesService.findOne(data['products.file_id'])

      if (isEmpty(data)) {
        throw new ErrorResponse(400, "Interior was not found");
      }
      data = flat.unflatten(data)

      let order = null
      let is_bought = false

      const remote_ip = requestIp.getClientIp(req);
      const device = req.headers['user-agent'];


      if (reqUser) {

        const user_id = reqUser.profile.id

        const purchased_items = await this.orderItemsService.findPurchasedItemsByUser(user_id)
        const purchasedModel = await purchased_items.find((product) => product.product_id == data.product_id)
        const user_role = (await this.roleService.getByUser(user_id)).role_id
        if (user_role == 3) {
          is_bought = true
          data['products']['is_free'] = true
          data['products']['file'] = file
        }
        else if (user_role != 3) {
          if (data['products']['is_free'] || purchasedModel) {
            is_bought = true
            data['products']['file'] = file
          }
        }

        order = getFirst(await this.ordersService.findByUserAndStatus(user_id, 1))
        const userProductView = await this.userProductViewService.findOneByFilters({ user_id, product_id: data.product_id })
        if (!userProductView) {
          await this.userProductViewService.create({ user_id, product_id: data.product_id, remote_ip, device })
        }
      }
      else {
        if (data['products']['is_free']) {
          is_bought = true
          data['products']['file'] = file
        }
      }

      const order_item = order && !isEmpty(order) ? await this.orderItemsService.findByProductAndOrder(data.product_id, order.id) : null;

      data.in_cart = order_item ? true : false
      data.is_bought = is_bought

      data['images'].sort((a, b) => new Date(a['created_at']).valueOf() - new Date(b['created_at']).valueOf())

      res.status(200).json({
        success: true,
        data: flat.unflatten(data)
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { colors, models }: UpdateInteriorDTO = req.body
      const updateProductData: IUpdateProduct = req.body
      const { id } = req.params

      const foundInterior = await this.interiorsService.findOne(id);

      if (!foundInterior) {
        throw new ErrorResponse(400, 'not found')
      }

      const foundProduct = await this.productsService.findOne(foundInterior.product_id)


      const _colors = Array.isArray(colors) ? colors : typeof colors == 'string' ? JSON.parse(String(colors).includes("'") ? String(colors).replace(/'/g, '"') : colors) : []
      const _models = Array.isArray(models) ? models : typeof models == 'string' ? JSON.parse(String(models).includes("'") ? String(models).replace(/'/g, '"') : models) : []

      let file_id = foundProduct.file_id
      if (req['files'] && req['files'][defaults.reqFilesName]) {
        const files = await uploadFile(req['files'][defaults.reqFilesName], "files/product-files", s3Vars.filesBucket)
        const file = await this.filesService.create({ ...files[0] })

        file_id = file.id
      }

      if (updateProductData.category_id) {
        await this.interiorsService.update(id, { category_id: updateProductData.category_id })
        delete updateProductData["category_id"]
      }

      delete updateProductData["models"]
      delete updateProductData["colors"]

      const product = await this.productsService.update(foundProduct.id, {
        ...updateProductData,
        file_id
      })

      console.log("colors      ", _colors);
      if (_colors && _colors.length) {
        if (_colors.length > 1) {
          for (const color_id of _colors) {
            await this.modelColorsService.create({ product_id: foundProduct.id, color_id })
          }
        } else {
          const color_id = _colors[0]
          await this.modelColorsService.create({ product_id: foundProduct.id, color_id })
        }
      }

      if (req['files'] && req['files'][defaults.reqCoverName]) {
        await this.modelImagesService.deleteCoverImage(foundProduct.id)

        const cover = await uploadFile(req['files'][defaults.reqCoverName], "images/product-images", s3Vars.imagesBucket)
        const cover_image = await this.imagesService.create({ ...cover[0] })
        const coverInteriorImageData: ICreateModelImage = {
          product_id: foundProduct.id,
          image_id: cover_image.id,
          is_main: true
        }
        await this.modelImagesService.create(coverInteriorImageData)
      }



      if (req['files'] && req['files'][defaults.reqImagesName]) {
        const images = await uploadFile(req['files'][defaults.reqImagesName], "images/product-images", s3Vars.imagesBucket)
        for (const i of images) {
          const image = await this.imagesService.create(i)
          const imageData: ICreateModelImage = {
            product_id: foundProduct.id,
            image_id: image.id,
            is_main: false
          }
          await this.modelImagesService.create(imageData)
        }
      }

      if (_models && _models.length) {
        await this.interiorModelsService.deleteByInterior(foundInterior.id)
        for (const model_id of _models) {
          await this.interiorModelsService.create({ interior_id: foundInterior.id, model_id })
        }
      }

      res.status(201).json({
        success: true,
        data: product,
        message: "Interior updated successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: string = req.params.id

      await this.interiorsService.delete(id)

      res.status(200).json({
        success: true,
        message: "Interior was deleted successfully"
      })
    } catch (error) {
      next(error)
    }
  }
}