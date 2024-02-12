import { isEmpty } from "class-validator";
import { NextFunction, Request, Response } from "express";
import flat from "flat";
import requestIp from 'request-ip';

import buildPagination from "../shared/utils/paginationBuilder";
import ErrorResponse from "../shared/utils/errorResponse";
import extractQuery from "../shared/utils/extractQuery";
import generateSlug, { indexSlug } from "../shared/utils/generateSlug";
import { getFirst } from "../shared/utils/utils";
import { deleteFile, uploadFile } from "../shared/utils/fileUpload";

import { ICreateProduct } from "../products/interface/products.interface";
import { ICreateModel, IGetModelsQuery, IModel, IUpdateModel } from "./interface/models.interface";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import { ICreateProductImage } from "../products/product_images/interface/product_images.interface";
import { defaults, fileDefaults } from "../shared/defaults/defaults"
import { RequestWithUser } from "../shared/interface/routes.interface";

import ModelService from "./models.service";
import CategoryService from "../categories/categories.service";
import ImageService from "../shared/modules/images/images.service";
import FileService from "../shared/modules/files/files.service";
import ProductImageService from "../products/product_images/product_images.service";
import ModelMaterialService from "./model_materials/model_materials.service";
import ProductColorService from "../products/product_colors/product_colors.service";
import UserProductViewService from "../views/user_views/user_product_views.service";
import ColorService from "../colors/colors.service";
import ProductService from "../products/products.service";
import StyleService from "../styles/styles.service";
import OrderService from "../orders/orders.service";
import OrderItemService from "../orders/order_items/order_items.service";
import { s3Vars } from "../../config/conf";


export default class ModelsController {
  private modelsService = new ModelService()
  private userProductViewService = new UserProductViewService()
  private ordersService = new OrderService()
  private orderItemsService = new OrderItemService()
  private productsService = new ProductService()
  private imagesService = new ImageService()
  private filesService = new FileService()
  private productImagesService = new ProductImageService()
  private modelMaterialsService = new ModelMaterialService()
  private productColorsService = new ProductColorService()

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formfactor_id, length, height, width, polygons_count, vertices_count, brand_id, materials, colors, yamo_id, category_id }: ICreateModel = req.body
      const { style_id, title, description, cost_id, is_free }: ICreateProduct = req.body

      const yamoIdExist = await this.modelsService.findByFilters({
        yamo_id
      });

      if (yamoIdExist) {
        throw new ErrorResponse(400, 'Bu Yamo Id allaqachon mavjud!')
      }

      let { slug }: ICreateProduct = req.body
      const _materials = Array.isArray(materials) ? materials : JSON.parse(String(materials).includes("'") ? String(materials).replace(/'/g, '"') : materials)
      const _colors = Array.isArray(colors) ? colors : JSON.parse(String(colors).includes("'") ? String(colors).replace(/'/g, '"') : colors)

      const files = await uploadFile(req['files'][defaults.reqFilesName], "files/product-files", s3Vars.filesBucket)
      const file = await this.filesService.create({ ...files[0] })
      const file_id = file.id

      slug = slug ? slug : generateSlug(title)
      const foundSlugs = await this.productsService.searchBySlug(slug)
      if (foundSlugs && !isEmpty(foundSlugs)) {
        console.log(foundSlugs.map(product => product.slug));
        slug = indexSlug(slug, foundSlugs.map(product => product.slug))
      }

      const product = await this.productsService.create({
        title,
        is_free,
        description,
        slug,
        cost_id,
        style_id,
        file_id
      })

      const model = await this.modelsService.create({
        length,
        height,
        yamo_id,
        category_id,
        width,
        polygons_count,
        vertices_count,
        brand_id,
        formfactor_id,
        product_id: product.id
      })

      if (_materials.length > 1) {
        for (const material_id of _materials) {
          await this.modelMaterialsService.create({ model_id: model.id, material_id })
        }
      } else {
        const material_id = _materials[0]
        await this.modelMaterialsService.create({ model_id: model.id, material_id })
      }

      if (_colors.length > 1) {
        for (const color_id of _colors) {
          await this.productColorsService.create({ product_id: product.id, color_id })
        }
      } else {
        const color_id = _colors[0]
        await this.productColorsService.create({ product_id: product.id, color_id })
      }


      const cover = await uploadFile(req['files'][defaults.reqCoverName], "images/product-images", s3Vars.imagesBucket, fileDefaults.model_cover)
      const cover_image = await this.imagesService.create({ ...cover[0] })
      const coverModelImageData: ICreateProductImage = {
        product_id: product.id,
        image_id: cover_image.id,
        is_main: true
      }
      await this.productImagesService.create(coverModelImageData)

      const images = await uploadFile(req['files'][defaults.reqImagesName], "images/product-images", s3Vars.imagesBucket, fileDefaults.model)
      for (const i of images) {
        const image = await this.imagesService.create(i)
        const imageData: ICreateProductImage = {
          product_id: product.id,
          image_id: image.id,
          is_main: false
        }
        await this.productImagesService.create(imageData)
      }

      res.status(201).json({
        success: true,
        data: product,
        message: "Model created successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const modelData: IUpdateModel = req.body

      const foundModel: IModel = await this.modelsService.findOne(id);
      if (isEmpty(foundModel)) {
        throw new ErrorResponse(400, "Model was not found");
      }
      if (isEmpty(modelData)) {
        res.status(400).json({
          success: true,
          message: "Empty values"
        })
        return
      }

      const data = await this.modelsService.update(id, modelData)

      res.status(200).json({
        success: true,
        data,
        message: "Sccessfully updated"
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
      const filters: IGetModelsQuery = extractedQuery.filters
      const sorts: IDefaultQuery = extractedQuery.sorts

      const categories = req.query.categories
      const styles = req.query.styles
      const colors = req.query.colors

      const data = await this.modelsService.findAll(keyword, filters, sorts, categories, styles, colors)

      const dataCount = Number(await this.modelsService.count(keyword, filters, categories, styles, colors))

      const pagination = buildPagination(dataCount, sorts)

      const result = []
      for (const model of data) {
        result.push(flat.unflatten(model))
      }

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
      const reqUser = req.user;
      let { identifier } = req.params
      const { type } = req.query

      const isSlug = type && !isEmpty(type) && type == "slug"

      let data = isSlug
        ? await this.modelsService.findBySlug(identifier)
        : await this.modelsService.findOne(identifier)

      if (isEmpty(data)) {
        throw new ErrorResponse(400, "Model was not found");
      }

      data = flat.unflatten(data)

      const remote_ip = requestIp.getClientIp(req);
      const device = req.headers['user-agent'];

      let order = null
      let is_bought = null
      if (reqUser) {

        const user_id = reqUser.profile.id
        const purchased_items = await this.orderItemsService.findPurchasedItemsByUser(user_id)

        const purchasedModel = await purchased_items.find((product) => product.product_id == data.product_id)

        if (!data['products']['is_free']) {
          if (!purchasedModel) {
            delete data['products']['file']['src']
            delete data['products']['file']['id']
            delete data['products']['file']['ext']
            delete data['products']['file_id']

            is_bought = false
          } else {
            is_bought = true
          }

        } else {
          is_bought = false
        }



        order = getFirst(await this.ordersService.findByUserAndStatus(user_id, 1))

        const userProductView = await this.userProductViewService.findOneByFilters({ user_id, product_id: data.product_id })

        if (!userProductView) {
          let view = await this.userProductViewService.create({ user_id, product_id: data.product_id, device, remote_ip })
          console.log(view)
        }
      } else {
        if (!data['products']['is_free']) {
          delete data['products']['file']['src']
          delete data['products']['file']['id']
          delete data['products']['file']['ext']
          delete data['products']['file_id']
        }
        is_bought = false

        // const userProductView = await this.userProductViewService.findByIPDeviceAndProduct({remote_ip, device, product_id: data.product_id})

        // if (!userProductView) {
        //     let j = await this.userProductViewService.create({remote_ip, device,  product_id: data.product_id}) 
        // }
      }

      const order_item = order && !isEmpty(order) ? await this.orderItemsService.findByProductAndOrder(data.product_id, order.id) : null;

      data.in_cart = order_item ? true : false
      data.is_bought = is_bought

      data['images'].sort((a, b) => new Date(a['created_at']).valueOf() - new Date(b['created_at']).valueOf())

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getOneByFilters = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { query } = req
      const extractedQuery = extractQuery(query)
      const filters = extractedQuery.filters

      let data = await this.modelsService.findByFilters(filters)

      if (isEmpty(data)) {
        throw new ErrorResponse(400, "Model was not found");
      }

      if(Array.isArray(data)){
        const result = []
        for (const model of data) {
          result.push(flat.unflatten(model))
        }
        data = result
      }else {
        data = flat.unflatten(data)
      }

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id: string = req.params.id
      await this.modelsService.delete(id)

      res.status(200).json({
        success: true,
        message: "Model was deleted successfully"
      })
    } catch (error) {
      next(error)
    }
  }
}