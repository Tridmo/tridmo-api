import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { ICreateSavedModel, IFilterSavedModel } from "./interface/saved_models.interface";
import SavedModelsDAO from './dao/saved_models.dao';

export default class SavedModelsService {
    private dao = new SavedModelsDAO()

    async create(
        values: ICreateSavedModel
    ) {
        const exist = await this.dao.getAll({ user_id: values.user_id, model_id: values.model_id });

        if (exist.length > 0) return exist;

        const data = await this.dao.create(values)

        return data
    }

    async findAll(filters: IFilterSavedModel) {
        const data = await this.dao.getAll(filters);
        return data
    }

    async delete(where: IFilterSavedModel): Promise<number> {
        return await this.dao.deleteById(where);
    }
}