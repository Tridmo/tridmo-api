import { getFirst } from "../../shared/utils/utils";
import KnexService from '../../../database/connection';
import { ICreateProductImage, IUpdateProductCover } from "./product_images.interface";

export default class ProductImagesDAO {
  async create(values: ICreateProductImage) {
    return getFirst(
      await KnexService("product_images")
        .insert(values)
        .returning("*")
    )
  }

  async updateProductCover(product_id: string, values: IUpdateProductCover) {
    return getFirst(
      await KnexService("product_images")
        .update(values)
        .where({ product_id })
        .returning("*")
    )
  }

  async deleteById(id: string) {
    return await KnexService('product_images')
      .where({ id: id })
      .delete()
  }

  async getById(id: string) {
    return getFirst(
      await KnexService('product_images')
        .where({ id: id })
    )
  }

  async getByProduct(product_id: string) {
    return await KnexService('product_images')
      .where({ product_id })
  }

  async getNonCoverByProduct(product_id: string) {
    return await KnexService('product_images')
      .where({ product_id, is_cover: false })
  }

  async getProductCover(product_id: string) {
    return getFirst(
      await KnexService('product_images')
        .where({
          product_id,
          is_cover: true
        })
    )
  }

  async deleteByProductId(id: string) {
    return await KnexService('product_images')
      .where({ product_id: id })
      .delete()
  }

  async deleteCoverImageByProductId(product_id: string) {
    return await KnexService('product_images')
      .where({
        product_id,
        is_cover: true
      })
      .delete()
  }
}