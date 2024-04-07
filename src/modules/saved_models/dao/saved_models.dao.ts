import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateSavedModel, IFilterSavedModel, ISavedModel } from "../interface/saved_models.interface";

export default class SavedModelsDAO {
    async create({ model_id, user_id }: ICreateSavedModel) {
        return getFirst(
            await KnexService('saved_models')
                .insert({
                    model_id,
                    user_id
                })
                .returning("*")
        )
    }

    async getAll(filters?: IFilterSavedModel): Promise<ISavedModel[]> {
        return await KnexService('saved_models')
            .select([
                'saved_models.*'
            ])
            .where(filters)
    }

    async deleteById(where: IFilterSavedModel): Promise<number> {
        return await KnexService('saved_models')
            .where(where)
            .delete()
    }
}