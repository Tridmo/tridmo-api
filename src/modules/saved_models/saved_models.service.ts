import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { ICreateSavedModel, IFilterSavedModel } from "./interface/saved_models.interface";
import SavedModelsDAO from './dao/saved_models.dao';
import flat from 'flat'

export default class SavedModelsService {
  private dao = new SavedModelsDAO()

  async create(
    values: ICreateSavedModel
  ) {
    const exist = await this.dao.getAll({ user_id: values.user_id, model_id: values.model_id }, {});

    if (exist.length == 0) {
      return await this.dao.create(values)
    }

    return exist[0]
  }

  async findAll(filters: IFilterSavedModel, sorts?: IDefaultQuery) {
    const data = await this.dao.getAll(filters, sorts);
    data.forEach((e, i) => data[i] = flat.unflatten(e))
    return data
  }

  async findAllMin(filters: IFilterSavedModel, sorts?: IDefaultQuery) {
    const data = await this.dao.getAllMin(filters, sorts);
    return data
  }

  async count(filters: IFilterSavedModel) {
    return await this.dao.count(filters);
  }

  async delete(where: IFilterSavedModel): Promise<number> {
    return await this.dao.deleteById(where);
  }
}