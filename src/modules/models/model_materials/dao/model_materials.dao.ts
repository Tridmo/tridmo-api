import { getFirst } from "../../../shared/utils/utils";
import KnexService from '../../../../database/connection';
import { ICreateModelMaterial } from "../interface/model_materials.interface";

export default class ModelMaterialsDAO {
    async create({model_id, material_id}: ICreateModelMaterial){
        return getFirst(
            await KnexService("model_materials")
                .insert({
                    model_id,
                    material_id
                })
                .returning("*")
        )
    }

    async getByModelAndMaterial(model_id: string, material_id : number) {
        return getFirst(
            await KnexService('model_materials')
            .where({
                model_id,
                material_id
            })
        )
    }

    async deleteById(id: string) {
        return await KnexService('model_materials')
            .where({id: id})
            .delete()
    }

    async deleteByModelId(id: string) {
        return await KnexService('model_materials')
            .where({model_id: id})
            .delete()
    }

    async deleteByMaterialAndModel(model_id: string, material_id: number) {
        return await KnexService('model_materials')
            .where({
                model_id,
                material_id
            })
            .delete()
    }
}