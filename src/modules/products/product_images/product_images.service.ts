import ProductImagesDAO from "./product_images.dao";
import { ICreateProductImage, IProductImage, IUpdateProductCover } from "./product_images.interface";

export default class ProductImageService {
  private dao = new ProductImagesDAO()
  async create(values: ICreateProductImage) {
    return await this.dao.create(values)
  }
  async updateProductCover(product_id: string, values: IUpdateProductCover) {
    return await this.dao.updateProductCover(product_id, values);
  }
  async findOne(id: string) {
    return await this.dao.getById(id)
  }
  async findProductCover(product_id: string): Promise<IProductImage> {
    return await this.dao.getProductCover(product_id)
  }
  async findProductSimpleImages(product_id: string): Promise<IProductImage[]> {
    return await this.dao.getNonCoverByProduct(product_id)
  }
  async findByProduct(product_id: string): Promise<IProductImage[]> {
    return await this.dao.getByProduct(product_id)
  }
  async delete(id: string) {
    await this.dao.deleteById(id)
  }
  async deleteByProduct(id: string) {
    await this.dao.deleteByProductId(id)
  }
  async deleteCoverImage(product_id: string) {
    await this.dao.deleteCoverImageByProductId(product_id)
  }
}