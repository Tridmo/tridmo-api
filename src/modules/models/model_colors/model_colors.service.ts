import ColorService from '../../colors/colors.service';
import ModelColorsDAO from "./dao/model_colors.dao";
import { ICreateModelColor, IModelColor } from "./interface/model_colors.interface";

export default class ModelColorService {
    private modelColorsDao = new ModelColorsDAO()
    private colorService = new ColorService()

    async create({ model_id, color_id }: ICreateModelColor): Promise<IModelColor> {

        await this.colorService.findOne(color_id)

        const data = await this.modelColorsDao.create({
            model_id,
            color_id
        })

        return data
    }
    async findByModelAndColor(model_id: string, color_id: number): Promise<IModelColor> {
        return await this.modelColorsDao.getByModelAndColor(model_id, color_id)
    }
    async delete(id: string): Promise<number> {
        return await this.modelColorsDao.deleteById(id)
    }
    async deleteByModel(id: string): Promise<number> {
        return await this.modelColorsDao.deleteByModelId(id)
    }
    async deleteByColorAndModel(model_id: string, color_id: number): Promise<number> {
        return await this.modelColorsDao.deleteByColorAndModel(model_id, color_id)
    }
}