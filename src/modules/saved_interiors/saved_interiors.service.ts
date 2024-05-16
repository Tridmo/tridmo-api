import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { ISavedInterior, ICreateSavedInterior, IFilterSavedInterior } from "./saved_interiors.interface";
import SavedInteriorsDAO from './saved_interiors.dao';
import flat from 'flat'
import InteriorService from "../interiors/interiors.service";
import InteractionService from "../interactions/interactions.service";
import InteriorsDAO from "../interiors/interiors.dao";

export default class SavedInteriorsService {
  private dao = new SavedInteriorsDAO()
  private interiorsDao = new InteriorsDAO()
  private interactionsService = new InteractionService()

  async create(
    values: ICreateSavedInterior
  ) {
    const exist = await this.dao.getAll({ user_id: values.user_id, interior_id: values.interior_id }, {});

    if (exist.length == 0) {
      const interior = await this.interiorsDao.getByIdMinimal(values.interior_id)
      await this.interactionsService.increment(interior?.interaction_id, 'saves')
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
    if (where?.interior_id) {
      const interior = await this.interiorsDao.getByIdMinimal(where.interior_id)
      await this.interactionsService.decrement(interior?.interaction_id, 'saves')
    } else if (where?.id) {
      await this.interactionsService.decrement(where.id, 'saves')
    }
    return await this.dao.delete(where);
  }
}