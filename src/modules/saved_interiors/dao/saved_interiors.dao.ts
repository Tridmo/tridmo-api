import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateSavedInterior, IFilterSavedInterior, ISavedInterior } from "../interface/saved_interiors.interface";

export default class SavedInteriorsDAO {
    async create({ interior_id, user_id }: ICreateSavedInterior) {
        return getFirst(
            await KnexService('saved_interiors')
                .insert({
                    interior_id,
                    user_id
                })
                .returning("*")
        )
    }

    async getAll(filters?: IFilterSavedInterior): Promise<ISavedInterior[]> {
        return await KnexService('saved_interiors')
            .select([
                'saved_interiors.*'
            ])
            .where(filters)
    }

    async delete(where: IFilterSavedInterior): Promise<number> {
        return await KnexService('saved_interiors')
            .where(where)
            .delete()
    }
}