import ModelColorsDAO from "./dao/model_colors.dao";
import { ICreateModelColor } from "./interface/model_colors.interface";

export default class ModelColorService {
    private modelColorsDao = new ModelColorsDAO()
    async create({ product_id, color_id }: ICreateModelColor) {
        const data = await this.modelColorsDao.create({
            product_id,
            color_id
        })
        return data
    }
    async findByProductAndColor(product_id: string, color_id: number) {
        return await this.modelColorsDao.getByProductAndColor(product_id, color_id)
    }
    async delete(id: string) {
        await this.modelColorsDao.deleteById(id)
    }
    async deleteByProduct(id: string) {
        await this.modelColorsDao.deleteByProductId(id)
    }
    async deleteByColorAndProduct(product_id: string, color_id: number) {
        await this.modelColorsDao.deleteByColorAndProduct(product_id, color_id)
    }
}