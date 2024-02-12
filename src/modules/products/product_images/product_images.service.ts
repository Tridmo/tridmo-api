import ProductImagesDAO from "./dao/product_images.dao";
import { ICreateProductImage, IProductImage } from "./interface/product_images.interface";

export default class ProductImageService {
    private productImagesDao = new ProductImagesDAO()
    async create({product_id, image_id, is_main}: ICreateProductImage){
        const data = await this.productImagesDao.create({
            product_id, 
            image_id, 
            is_main
        })
        return data
    }
    async findOne(id: string){
        return await this.productImagesDao.getById(id)
    }
    async findProductCover(product_id: string){
        return await this.productImagesDao.getProductCover(product_id)
    }
    async findByProduct(product_id: string): Promise<IProductImage[]>{
        return await this.productImagesDao.getByProduct(product_id)
    }
    async delete(id: string){
        await this.productImagesDao.deleteById(id)
    }
    async deleteByProduct(id: string){
        await this.productImagesDao.deleteByProductId(id)
    }
    async deleteByImage(imageId: number){
        await this.productImagesDao.deleteByImageId(imageId)
    }

    async deleteCoverImage(product_id: string){
        await this.productImagesDao.deleteCoverImageByProductId(product_id)
    }
}