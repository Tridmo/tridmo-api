import ProductColorsDAO from "./dao/product_colors.dao";
import { ICreateProductColor } from "./interface/product_colors.interface";

export default class ProductColorService {
    private productColorsDao = new ProductColorsDAO()
    async create({product_id, color_id}: ICreateProductColor){
        const data = await this.productColorsDao.create({
            product_id, 
            color_id
        })
        return data
    }
    async findByProductAndColor(product_id: string, color_id: number){
        return await this.productColorsDao.getByProductAndColor(product_id, color_id)
    }
    async delete(id: string){
        await this.productColorsDao.deleteById(id)
    }
    async deleteByProduct(id: string){
        await this.productColorsDao.deleteByProductId(id)
    }
    async deleteByColorAndProduct(product_id: string, color_id: number){
        await this.productColorsDao.deleteByColorAndProduct(product_id, color_id)
    }
}