import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { ISavedInterior, ICreateSavedInterior, IFilterSavedInterior } from "./interface/saved_interiors.interface";
import SavedInteriorsDAO from './dao/saved_interiors.dao';

export default class SavedInteriorsService {
    private dao = new SavedInteriorsDAO()

    async create(
        values: ICreateSavedInterior
    ) {
        const exist = await this.dao.getAll({ user_id: values.user_id, interior_id: values.interior_id });

        if (exist.length > 0) return exist;

        const data = await this.dao.create(values)

        return data
    }

    async findAll(filters: IFilterSavedInterior) {
        const data = await this.dao.getAll(filters);
        return data
    }

    async delete(where: IFilterSavedInterior): Promise<number> {
        return await this.dao.delete(where);
    }
}