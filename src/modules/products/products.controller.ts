import { isEmpty } from "class-validator";
import { NextFunction, Request, Response } from "express";
import flat from "flat";
import requestIp from 'request-ip';

import buildPagination from "../shared/utils/paginationBuilder";
import ErrorResponse from "../shared/utils/errorResponse";
import extractQuery from "../shared/utils/extractQuery";
import generateSlug from "../shared/utils/generateSlug";
import { deleteFile, uploadFile } from "../shared/utils/fileUpload";

import { ICreateProduct, IGetProductsQuery, IProduct } from "./interface/products.interface";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import { ICreateProductImage } from "./product_images/interface/product_images.interface";

import { defaults } from "../shared/defaults/defaults"

import ProductService from "./products.service";
import CategoryService from "../categories/categories.service";
import ImageService from "../shared/modules/images/images.service";
import FileService from "../shared/modules/files/files.service";
import ProductImageService from "./product_images/product_images.service";
import ModelMaterialService from "../models/model_materials/model_materials.service";
import ProductColorService from "./product_colors/product_colors.service";
import UserProductViewService from "../views/user_views/user_product_views.service";
import ColorService from "../colors/colors.service";
import StyleService from "../styles/styles.service";
import OrderService from "../orders/orders.service";
import { RequestWithUser } from "../shared/interface/routes.interface";
import { getFirst } from "../shared/utils/utils";
import OrderItemService from "../orders/order_items/order_items.service";
import { IModel } from "../models/interface/models.interface";
import ModelService from "../models/models.service";
import DownloadsService from "./downloads/downloads.service";
import InteriorService from "../interiors/interiors.service";
import InteriorModelsService from "../interiors/interior_models/interior_models.service";
import CollectionsService from "../collections/collections.service";
import CollectionProductsService from "../collections/collection_products/collection_products.service";
import { checkObject, generatePresignedUrl } from "../shared/utils/s3";
import RoleService from "../auth/roles/roles.service";
import { s3Vars } from "../../config/conf";
import { IFilePublic } from "../shared/interface/files.interface";


export default class ProductsController {
  private productsService = new ProductService()
  private roleService = new RoleService()
  private imagesService = new ImageService()
  private modelsService = new ModelService()
  private modelMaterialsService = new ModelMaterialService()
  private productColorsService = new ProductColorService()
  private productImagesService = new ProductImageService()
  private userProductViewsService = new UserProductViewService()
  private downloadsService = new DownloadsService()
  private interiorsService = new InteriorService()
  private interiorModelsService = new InteriorModelsService()
  private orderItemsService = new OrderItemService()
  private collectionsService = new CollectionsService()
  private collectionProductsService = new CollectionProductsService()
  private ordersService = new OrderService()
  private filesService = new FileService()

  // public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //     try {
  //         const {style_id, title, description, cost_id, slug, file_id}: ICreateProduct = req.body

  //         const productData = {style_id, title, description, cost_id, file_id,
  //             slug: slug ? slug : generateSlug(title + Date.now())
  //         };

  //         const data = await this.productsService.create(productData)

  //         res.status(201).json({
  //             success: true,
  //             data,
  //             message: "Product created successfully"
  //         })
  //     } catch (error) {
  //         next(error)
  //     }
  // }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const productData: ICreateProduct = req.body

      const foundProduct: IProduct = await this.productsService.findOne(id);
      if (isEmpty(foundProduct)) {
        throw new ErrorResponse(400, "Product was not found");
      }

      if (isEmpty(productData)) {
        res.status(400).json({
          success: true,
          message: "Empty values"
        })
        return
      }

      const data = await this.productsService.update(id, productData)

      res.status(200).json({
        success: true,
        data,
        message: "Successfully updated"
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
      const filters = extractedQuery.filters
      const sorts: IDefaultQuery = extractedQuery.sorts

      const categories = req.query.categories
      const styles = req.query.styles
      const colors = req.query.colors

      const data = await this.productsService.findAll(keyword, filters, sorts, categories, styles, colors)
      const productCount = Number(await this.productsService.countByCriteria(keyword, filters, categories, styles, colors))

      const pagination = buildPagination(productCount, sorts)

      const result = []
      for (const product of data) {
        result.push(flat.unflatten(product))
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

  public getCoverImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_id } = req.params
      const cover = await this.productImagesService.findProductCover(product_id)

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
      let { identifier } = req.params
      const { type } = req.query
      const reqUser = req.user
      const remote_ip = requestIp.getClientIp(req);
      const device = req.headers['user-agent'];
      const isSlug = type && !isEmpty(type) && type == "slug"

      let data = isSlug
        ? await this.productsService.findBySlug(identifier)
        : await this.productsService.findOne(identifier)

      const file = await this.filesService.findOne(data.file_id)      

      const filePublicData: IFilePublic = {
        name: file.name,
        size: file.size,
        ext: file.ext,
        mimetype: file.mimetype,
      }

      data['file'] = filePublicData

      if (isEmpty(data)) {
        throw new ErrorResponse(400, "Model was not found");
      }

      let id = data.id

      let order = null
      let is_bought = false

      if (reqUser) {
        const user_id = reqUser.profile.id
        const purchased_items = await this.orderItemsService.findPurchasedItemsByUser(user_id)
        const purchasedModel = await purchased_items.find((product) => product.product_id == data.id)
        const user_role = (await this.roleService.getByUser(user_id)).role_id

        if(user_role == 3){
          is_bought = true
          data.is_free = true
        }
        else if (user_role != 3){
          if (data.is_free || purchasedModel) {
            is_bought = true
          }
        }
        order = getFirst(await this.ordersService.findByUserAndStatus(user_id, 1))
        const userProductView = await this.userProductViewsService.findOneByFilters({ user_id, product_id: data.id })
        if (isEmpty(userProductView)) {
          await this.userProductViewsService.create({ user_id: reqUser.profile.id, product_id: id })
        }
      } else {
        if (data.is_free) {
          is_bought = true
        }
      }

      await this.productsService.update(id, { views_count: data.views_count + 1 })

      data['model'] = data['model'] ? data['model'][0] : null
      data['interior'] = data['interior'] ? data['interior'][0] : null
      data['collection'] = data['collection'] ? data['collection'][0] : null

      const order_item = order && !isEmpty(order) ? await this.orderItemsService.findByProductAndOrder(data.id, order.id) : null;

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

  public deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const image_id = Number(req.params.image_id)

      const image = await this.imagesService.findOne(image_id);
      if (isEmpty(image)) {
        throw new ErrorResponse(400, "Image was not found");
      }
      await deleteFile(s3Vars.imagesBucket, image.src)

      await this.productImagesService.deleteByImage(image_id)
      await this.imagesService.delete(image_id)

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
      const { id } = req.params
      const { colors } = req.body
      const _colors = Array.isArray(colors) ? colors : JSON.parse(String(colors).includes("'") ? String(colors).replace(/'/g, '"') : colors)

      const foundProduct: IProduct = await this.productsService.findOne(id);
      if (isEmpty(foundProduct)) {
        throw new ErrorResponse(400, "Product was not found");
      }

      if (_colors.length > 1) {
        for (const color_id of _colors) {
          const found_product_color = await this.productColorsService.findByProductAndColor(id, color_id)
          if (!found_product_color) await this.productColorsService.create({ product_id: id, color_id })
        }
      } else {
        const found_product_color = await this.productColorsService.findByProductAndColor(id, _colors[0])
        if (!found_product_color) await this.productColorsService.create({ product_id: id, color_id: _colors[0] })
      }

      res.status(200).json({
        success: true,
        message: "Colors added successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public addImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      if (req["files"] && req["files"][defaults.reqCoverName]) {
        const cover = await uploadFile(req['files'][defaults.reqCoverName], "images/product-images", s3Vars.imagesBucket)
        const cover_image = await this.imagesService.create({ ...cover[0] })
        const coverModelImageData: ICreateProductImage = {
          product_id: id,
          image_id: cover_image.id,
          is_main: true
        }
        await this.productImagesService.create(coverModelImageData)
      }

      if (req["files"] && req["files"][defaults.reqImagesName]) {
        const images = await uploadFile(req['files'][defaults.reqImagesName], "images/product-images", s3Vars.imagesBucket)
        for (const i of images) {
          const image = await this.imagesService.create(i)
          const imageData: ICreateProductImage = {
            product_id: id,
            image_id: image.id,
            is_main: false
          }
          await this.productImagesService.create(imageData)
        }
      }

      res.status(200).json({
        success: true,
        message: "Images added successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public updateFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params

      const foundProduct: IProduct = await this.productsService.findOne(id);
      if (isEmpty(foundProduct)) throw new ErrorResponse(404, "Product was not found");
      const oldFile = await this.filesService.findOne(foundProduct.file_id);

      const fileExists = await checkObject(s3Vars.filesBucket, oldFile.key)
      if (fileExists) {
        await deleteFile(s3Vars.filesBucket, oldFile.key)
      }

      const files = await uploadFile(req['files'][defaults.reqFileName], "files/product-files", s3Vars.filesBucket)
      const file = await this.filesService.update(foundProduct.file_id, {...files[0]})

      await this.productsService.update(id, {file_exists: true})

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
      const { id } = req.params
      const { materials } = req.body
      const _materials = Array.isArray(materials) ? materials : JSON.parse(String(materials).includes("'") ? String(materials).replace(/'/g, '"') : materials)

      const foundModel: IModel = await this.modelsService.findByProduct(id);
      if (isEmpty(foundModel) || !foundModel) {
        throw new ErrorResponse(400, "Model was not found");
      }

      if (_materials.length > 1) {
        for (const material_id of _materials) {
          const found_model_material = await this.modelMaterialsService.findByModelAndMaterial(id, material_id)
          if (!found_model_material) await this.modelMaterialsService.create({ model_id: id, material_id })
        }
      } else {
        const found_model_material = await this.modelMaterialsService.findByModelAndMaterial(id, _materials[0])
        if (!found_model_material) await this.modelMaterialsService.create({ model_id: foundModel.id, material_id: _materials[0] })
      }

      res.status(200).json({
        success: true,
        message: "Materials added successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public removeMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, material_id } = req.params

      const foundModel: IModel = await this.modelsService.findByProduct(id);
      if (isEmpty(foundModel) || !foundModel) {
        throw new ErrorResponse(400, "Model was not found");
      }

      await this.modelMaterialsService.deleteByMaterialAndModel(foundModel.id, Number(material_id))

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
      const { id, color_id } = req.params

      const foundProduct: IProduct = await this.productsService.findOne(id);
      if (isEmpty(foundProduct)) {
        throw new ErrorResponse(400, "Product was not found");
      }

      await this.productColorsService.deleteByColorAndProduct(id, Number(color_id))

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
      const { id } = req.params
      const product = await this.productsService.findOne(id)
      const interior = await this.interiorsService.findByProduct(id)
      const model = await this.modelsService.findByProduct(id)

      if (!product || isEmpty(product)) {
        throw new ErrorResponse(400, "Product was not found");
      }
      const file_id = product.file_id

      const order_items = await this.orderItemsService.findByProduct(id)

      if (order_items && order_items.length) {
        throw new ErrorResponse(400, `Product has orders and cannot be deleted!`);
      }

      if (model && !isEmpty(model)) {
        await this.modelMaterialsService.deleteByModel(model.id)
        await this.modelsService.delete(model.id)
      }

      if (interior && !isEmpty(interior)) {
        await this.interiorModelsService.deleteByInterior(interior.id)
        await this.interiorsService.delete(interior.id)
      }

      await this.productColorsService.deleteByProduct(id)
      await this.productImagesService.deleteByProduct(id)
      await this.userProductViewsService.deleteByProduct(id)
      await this.downloadsService.deleteByProduct(id)

      const collection = await this.collectionsService.findByProduct(id)
      if (collection && !isEmpty(collection)) {
        await this.collectionProductsService.deleteByProductAndCollection(id, collection.id)
        await this.collectionsService.deleteByProduct(id)
      }

      for await (const product_image of (await this.productImagesService.findByProduct(id))) {
        const image = await this.imagesService.findOne(product_image.image_id)
        await deleteFile(s3Vars.imagesBucket, image.src)
        await this.imagesService.delete(product_image.image_id)
      }
      await this.productsService.delete(id)

      const file = await this.filesService.findOne(file_id)
      await deleteFile(s3Vars.filesBucket, file.src)
      await this.filesService.delete(file_id)

      res.status(200).json({
        success: true,
        message: "Product deleted successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public downloadProduct = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const reqUser = req.user;

      let data = await this.productsService.findOne(id)

      if (isEmpty(data)) {
        throw new ErrorResponse(400, "Product was not found");
      }
      const file = await this.filesService.findOne(data.file_id)

      const presignedUrl = generatePresignedUrl(file.key)

      await this.downloadsService.create({
        product_id: data.id, user_id: reqUser.profile.id
      })

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