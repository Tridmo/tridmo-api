import { uploadFile } from '../shared/utils/fileUpload';
import ErrorResponse from '../shared/utils/errorResponse';
import { fileDefaults } from '../shared/defaults/defaults';
import { IDefaultQuery } from '../shared/interface/query.interface';
import ProductsDAO from "./products.dao";
import { ICreateProduct, ICreateProductFromModel, IGetProductsQuery, IProduct, IUpdateProduct } from "./products.interface";
import generateSlug, { indexSlug } from '../shared/utils/generateSlug';
import { isEmpty } from 'lodash';
import { s3Vars } from '../../config/conf';
import { IRequestFile } from '../shared/interface/files.interface';
import ProductImageService from './product_images/product_images.service';
import flat from 'flat'
import { IUser } from '../users/users.interface';
import { reqT } from '../shared/utils/language';
import { GetCartProductsQueryDTO } from './products.dto';
import ModelService from '../models/models.service';
import ColorService from '../colors/colors.service';
import MaterialService from '../materials/materials.service';

export default class ProductService {
  private dao = new ProductsDAO()
  private modelService = new ModelService()
  private colorService = new ColorService()
  private materialService = new MaterialService()
  private productImagesService = new ProductImageService()

  async create(
    data: ICreateProduct,
    cover: IRequestFile,
    images: IRequestFile[]
  ): Promise<IProduct> {

    // generate unique slug
    data.slug = generateSlug(data.name)
    const foundSlugs = await this.dao.getSimilarSlugs(data.slug)
    if (foundSlugs && !isEmpty(foundSlugs)) data.slug = indexSlug(data.slug, foundSlugs.map(product => product.slug))

    // create product
    const product = await this.dao.create(data)

    // upload and create cover image
    const uploadedCover = (await uploadFile({
      files: cover,
      folder: `images/products/${product?.slug}`,
      bucketName: s3Vars.imagesBucket,
      fileName: 'cover',
      dimensions: fileDefaults.model_cover
    }))[0]
    await this.productImagesService.create({
      product_id: product.id,
      src: uploadedCover.src,
      is_cover: true,
      index: 0
    })

    // upload and create other images
    const uploadedImages = await uploadFile({
      files: images,
      folder: `images/products/${data.slug}`,
      bucketName: s3Vars.imagesBucket,
      dimensions: fileDefaults.model,
    })
    await Promise.all(uploadedImages.map(async (i, index) => {
      await this.productImagesService.create({
        product_id: product.id,
        src: i.src,
        is_cover: false,
        index: index + 1
      })
    }))

    return product;
  }

  async createFromModel(
    model_id: string,
    data: ICreateProductFromModel,
  ): Promise<IProduct> {

    const model = await this.modelService.findOne(model_id)

    if (model.product_id) throw new ErrorResponse(400, "Model already has a product")
    if (!model.furniture_cost && !data.price) throw new ErrorResponse(400, "Price can not be empty");
    const insertData: ICreateProduct = {
      category_id: model.category_id,
      name: data.name || model.name,
      description: data.description ?? model.description,
      height: model.height,
      length: model.length,
      width: model.width,
      price: data.price || model.furniture_cost,
      slug: model.slug,
      discount_percent: data.discount_percent,
      discount_until: data.discount_until,
      brand: model.brand.name,
      has_delivery: data.has_delivery,
      colors: [],
      materials: []
    }

    if (data.name && data.name != model.name) {
      insertData.slug = generateSlug(data.name)
      const foundSlugs = await this.dao.getSimilarSlugs(insertData.slug)
      if (foundSlugs && !isEmpty(foundSlugs)) insertData.slug = indexSlug(insertData.slug, foundSlugs.map(product => product.slug))
    }

    insertData.colors = [...model.colors.map(e => e.color.hex_value)]
    insertData.materials = [...model.materials.map(e => e.material.name)]

    console.log(insertData);

    const product = await this.dao.create(insertData)

    await this.modelService.update(model_id, { product_id: product.id })

    await this.productImagesService.create({
      product_id: product.id,
      src: model.cover,
      is_cover: true,
      index: 0
    })

    await Promise.all(model.images.map(async (i) => {
      await this.productImagesService.create({
        product_id: product.id,
        src: i.image_src,
        is_cover: false,
        index: i.index
      })
    }))

    return product;
  }

  async update(
    id: string,
    values: IUpdateProduct,
    cover?: IRequestFile,
    images?: IRequestFile[]
  ): Promise<IProduct> {

    const found: IProduct = await this.dao.getByIdMinimal(id);
    if (isEmpty(found)) throw new ErrorResponse(404, reqT('model_404'));

    const { removed_images, ...otherValues } = values;

    const product: IProduct = Object.keys(otherValues).length ? await this.dao.update(id, otherValues) : found

    if (cover) {
      const uploadedCover = (await uploadFile({
        files: cover,
        folder: `images/products/${product.slug}`,
        bucketName: s3Vars.imagesBucket,
        fileName: 'cover',
        dimensions: fileDefaults.model_cover
      }))[0];
      await this.productImagesService.updateProductCover(product.id, { src: uploadedCover.src });
    }

    if (removed_images && removed_images?.length) {
      for (const i of removed_images) {
        await this.productImagesService.delete(i)
      }
    }

    if (images) {
      const otherImages = await this.productImagesService.findByProduct(id)
      const maxIndex = Math.max(...otherImages.map(item => item.index));
      const startIndex = maxIndex ? maxIndex + 1 : 1;

      const uploadedImages = await uploadFile({
        files: images,
        folder: `images/products/${product.slug}`,
        bucketName: s3Vars.imagesBucket,
        dimensions: fileDefaults.model,
      })

      await Promise.all(uploadedImages.map(async (i, index) => {
        await this.productImagesService.create({
          product_id: product.id,
          src: i.src,
          is_cover: false,
          index: startIndex + index,
        })
      }))
    }

    return product;
  }

  async findAll(
    filters: IGetProductsQuery,
    sorts: IDefaultQuery
  ): Promise<IProduct[]> {

    const data = await this.dao.getAll(filters, sorts);

    data.forEach((m, i) => data[i] = flat.unflatten(m))

    return data;
  }

  async findForCart(
    filters: GetCartProductsQueryDTO,
    sorts: IDefaultQuery
  ): Promise<IProduct[]> {

    const data = await this.dao.getForCart(filters, sorts);

    data.forEach((m, i) => data[i] = flat.unflatten(m));

    return data;
  }

  async count(filters: IGetProductsQuery): Promise<number> {
    return await this.dao.count(filters);
  }

  async findOne(identifier: string, currentUser?: IUser): Promise<IProduct> {
    const data = await this.dao.getByIdOrSlug(identifier);
    if (!data) throw new ErrorResponse(404, reqT('model_404'));
    return flat.unflatten(data);
  }

  async findById(id: string): Promise<IProduct> {
    const data = await this.dao.getByIdMinimal(id);
    if (!data) throw new ErrorResponse(404, reqT('model_404'));
    return data;
  }

  async deleteById(product_id: string): Promise<number> {
    const product = await this.dao.getByIdMinimal(product_id);
    if (!product) throw new ErrorResponse(404, reqT('model_404'));
    return await this.dao.deleteById(product_id)
  }

}