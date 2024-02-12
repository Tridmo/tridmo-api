import requestIp from 'request-ip';
import { CreateCollectionDTO } from './dto/collections.dto';
import { IUpdateProduct } from '../products/interface/products.interface';
import { ISearchQuery, IDefaultQuery } from '../shared/interface/query.interface';
import { isEmpty } from "class-validator";
import { NextFunction, Request, Response } from "express";
import flat from "flat";

import { ICreateProduct } from "../products/interface/products.interface";
import { ICreateProductImage } from "../products/product_images/interface/product_images.interface";
import { defaults } from "../shared/defaults/defaults"
import { RequestWithUser } from "../shared/interface/routes.interface";

import { uploadFile } from "../shared/utils/fileUpload";
import CollectionService from "./collections.service";
import { getFirst } from "../shared/utils/utils";
import extractQuery from '../shared/utils/extractQuery';
import buildPagination from '../shared/utils/paginationBuilder';
import CollectionProductsService from './collection_products/collection_products.service';
import FilesService from '../shared/modules/files/files.service'
import ProductsService from '../products/products.service'
import ImagesService from '../shared/modules/images/images.service'
import ProductImageService from "../products/product_images/product_images.service";
import generateSlug, { indexSlug } from '../../modules/shared/utils/generateSlug';
import ProductColorService from "../products/product_colors/product_colors.service";
import ErrorResponse from '../../modules/shared/utils/errorResponse';
import OrderService from "../orders/orders.service";
import OrderItemService from "../orders/order_items/order_items.service";
import UserProductViewService from '../../modules/views/user_views/user_product_views.service';
import { ICreateCollection, IUpdateCollection } from './interface/collections.interface';
import RoleService from "../auth/roles/roles.service";
import { s3Vars } from '../../config/conf';

export default class CollectionsController {
  private collectionService = new CollectionService()
  private roleService = new RoleService()
  private collectionProductsService = new CollectionProductsService()
  private filesService = new FilesService()
  private productsService = new ProductsService()
  private imagesService = new ImagesService()
  private productColorsService = new ProductColorService()
  private productImagesService = new ProductImageService()
  private ordersService = new OrderService()
  private orderItemsService = new OrderItemService()
  private userProductViewService = new UserProductViewService()

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { products, colors }: CreateCollectionDTO = req.body

      const _products = Array.isArray(products) ? products : typeof products == 'string' ? JSON.parse(String(products).includes("'") ? String(products).replace(/'/g, '"') : products) : []
      const _colors = Array.isArray(colors) ? colors : typeof colors == 'string' ? JSON.parse(String(colors).includes("'") ? String(colors).replace(/'/g, '"') : colors) : []

      const { style_id, title, description, cost_id, is_free }: ICreateProduct = req.body
      let { category_id }: ICreateCollection = req.body
      let { slug }: ICreateProduct = req.body

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
        description,
        slug,
        cost_id,
        style_id,
        is_free,
        file_id
      })

      const collection = await this.collectionService.create({
        product_id: product.id,
        category_id
      })

      const cover = await uploadFile(req['files'][defaults.reqCoverName], "images/product-images", s3Vars.imagesBucket)
      const cover_image = await this.imagesService.create({ ...cover[0] })
      const coverInteriorImageData: ICreateProductImage = {
        product_id: product.id,
        image_id: cover_image.id,
        is_main: true
      }
      await this.productImagesService.create(coverInteriorImageData)

      const images = await uploadFile(req['files'][defaults.reqImagesName], "images/product-images", s3Vars.imagesBucket)
      for (const i of images) {
        const image = await this.imagesService.create(i)
        const imageData: ICreateProductImage = {
          product_id: product.id,
          image_id: image.id,
          is_main: false
        }
        await this.productImagesService.create(imageData)
      }

      if (_colors && _colors.length) {
        if (_colors.length > 1) {
          for (const color_id of _colors) {
            await this.productColorsService.create({ product_id: product.id, color_id })
          }
        } else {
          const color_id = _colors[0]
          await this.productColorsService.create({ product_id: product.id, color_id })
        }
      }

      if (_products) {
        if (_products.length > 1) {
          for (const product_id of _products) {
            await this.collectionProductsService.create({ collection_id: collection.id, product_id })
          }
        } else {
          const product_id = _products[0]
          await this.collectionProductsService.create({ collection_id: collection.id, product_id })
        }
      }

      res.status(201).json({
        success: true,
        data: product,
        message: "Collection created successfully"
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

      const styles = req.query.styles
      const colors = req.query.colors

      const data = await this.collectionService.findAll(keyword, sorts, styles, colors)
      const collectionCount = await this.collectionService.count()

      const result = []
      for (const collection of data) {
        result.push(flat.unflatten(collection))
      }

      const pagination = buildPagination(Number(collectionCount), sorts)

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
      const { id } = req.params
      const reqUser = req.user;

      let data = await this.collectionService.findOne(id)

      if (isEmpty(data)) {
        throw new ErrorResponse(400, "Collection was not found");
      }
      data = flat.unflatten(data)

      let order = null
      let is_bought = null

      const remote_ip = requestIp.getClientIp(req);
      const device = req.headers['user-agent'];


      if (reqUser) {
        const user_id = reqUser.profile.id

        const purchased_items = await this.orderItemsService.findPurchasedItemsByUser(user_id)
        const purchasedModel = await purchased_items.find((product) => product.product_id == data.product_id)

        if (!data['products']['is_free']) {
          if (!purchasedModel) {
            delete data['products']['file']
            delete data['products']['file_id']

            is_bought = false
          } else {
            is_bought = true
          }

        } else {
          is_bought = false
        }

        const user_role = (await this.roleService.getByUser(user_id)).role_id
        if(user_role == 3){
          is_bought = true
          data['products']['is_free'] = true
        }

        order = getFirst(await this.ordersService.findByUserAndStatus(user_id, 1))
        const userProductView = await this.userProductViewService.findOneByFilters({ user_id, product_id: data.product_id })

        if (!userProductView) {
          await this.userProductViewService.create({ user_id, product_id: data.product_id, remote_ip, device })
        }
      } else {

        if (!data['products']['is_free']) {
          delete data['products']['file']
          delete data['products']['file_id']
        }
        is_bought = false
      }

      const order_item = order && !isEmpty(order) ? await this.orderItemsService.findByProductAndOrder(data.product_id, order.id) : null;

      data.in_cart = order_item ? true : false
      data.is_bought = is_bought


      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updateProductData: IUpdateProduct = req.body
      const { category_id }: IUpdateCollection = req.body
      const { id } = req.params

      const foundCollection = await this.collectionService.findOne(id);

      if (!foundCollection) {
        throw new ErrorResponse(400, 'not found')
      }

      const foundProduct = await this.productsService.findOne(foundCollection.product_id)


      let file_id = foundProduct.file_id
      if (req['files'][defaults.reqFilesName]) {
        const files = await uploadFile(req['files'][defaults.reqFilesName], "files/product-files", s3Vars.filesBucket)
        const file = await this.filesService.create({ ...files[0] })

        file_id = file.id
      }

      const product = await this.productsService.update(foundProduct.id, {
        ...updateProductData,
        file_id
      })
      if (category_id) await this.collectionService.update(id, { category_id })

      res.status(201).json({
        success: true,
        data: product,
        message: "Collection updated successfully"
      })
    } catch (error) {
      next(error)
    }
  }
}