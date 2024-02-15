import { getFirst } from "../../../shared/utils/utils";
import KnexService from '../../../../database/connection';
import { ICreateModelColor } from "../interface/model_colors.interface";

export default class ModelColorsDAO {
    async create({ model_id, color_id }: ICreateModelColor) {
        return getFirst(
            await KnexService("model_colors")
                .insert({
                    model_id,
                    color_id
                })
                .onConflict(['model_id', 'color_id'])
                .ignore()
                .returning("*")
        )
    }

    async getByModelAndColor(model_id: string, color_id: number) {
        return getFirst(
            await KnexService('model_colors')
                .where({
                    model_id,
                    color_id
                })
        )
    }


    async deleteById(id: string): Promise<number> {
        return await KnexService('model_colors')
            .where({ id: id })
            .delete()
    }

    async deleteByModelId(id: string): Promise<number> {
        return await KnexService('model_colors')
            .where({ model_id: id })
            .delete()
    }

    async deleteByColorAndModel(model_id: string, color_id: number): Promise<number> {
        return await KnexService('model_colors')
            .where({
                model_id,
                color_id
            })
            .delete()
    }
}