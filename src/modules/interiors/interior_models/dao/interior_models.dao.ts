import { getFirst } from "../../../shared/utils/utils";
import KnexService from '../../../../database/connection';
import { ICreateInteriorModel } from "../interface/interior_models.interface";

export default class InteriorModelsDAO {
    async create(values: ICreateInteriorModel) {
        return getFirst(
            await KnexService("interior_models")
                .insert({
                    ...values
                })
                .returning("*")
        )
    }

    async deleteById(id: number) {
        return await KnexService('interior_models')
            .where({ id: id })
            .delete()
    }

    async deleteByModelId(id: string) {
        return await KnexService('interior_models')
            .where({ model_id: id })
            .delete()
    }

    async deleteByInteriorAndModel(model_id: string, interior_id: string) {
        return await KnexService('interior_models')
            .where({
                model_id,
                interior_id
            })
            .delete()
    }

    async deleteByInterior(interior_id: string) {
        return await KnexService('interior_models')
            .where({
                interior_id
            })
            .delete()
    }

    async getByInteriorAndModel(model_id: string, interior_id: string) {
        return getFirst(
            await KnexService('interior_models')
                .select("*")
                .where({
                    model_id,
                    interior_id
                })
        )
    }
}