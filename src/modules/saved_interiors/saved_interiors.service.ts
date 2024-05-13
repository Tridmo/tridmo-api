import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { ISavedInterior, ICreateSavedInterior, IFilterSavedInterior } from "./interface/saved_interiors.interface";
import SavedInteriorsDAO from './dao/saved_interiors.dao';
import flat from 'flat'

export default class SavedInteriorsService {
  private dao = new SavedInteriorsDAO()

  async create(
    values: ICreateSavedInterior
  ) {
    const exist = await this.dao.getAll({ user_id: values.user_id, interior_id: values.interior_id }, {});

    if (exist.length == 0) {
      return await this.dao.create(values)
    }

    return exist[0]
  }

  async findAll(filters: IFilterSavedInterior, sorts?: IDefaultQuery) {
    const data = await this.dao.getAll(filters, sorts);
    data.forEach((e, i) => data[i] = flat.unflatten(e))
    return data
  }

  async findAllMin(filters: IFilterSavedInterior, sorts?: IDefaultQuery) {
    const data = await this.dao.getAllMin(filters, sorts);
    return data
  }

  async count(filters: IFilterSavedInterior) {
    return await this.dao.count(filters);
  }

  async delete(where: IFilterSavedInterior): Promise<number> {
    return await this.dao.delete(where);
  }
}