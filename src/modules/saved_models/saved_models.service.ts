import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { ICreateSavedModel, IFilterSavedModel } from "./saved_models.interface";
import SavedModelsDAO from './saved_models.dao';
import flat from 'flat'
import ModelService from "../models/models.service";
import InteractionService from "../interactions/interactions.service";
import ModelsDAO from "../models/models.dao";

export default class SavedModelsService {
  private dao = new SavedModelsDAO()
  private modelsDao = new ModelsDAO()
  private interactionsService = new InteractionService()

  async create(
    values: ICreateSavedModel
  ) {
    const exist = await this.dao.getAll({ user_id: values.user_id, model_id: values.model_id }, {});

    if (exist.length == 0) {
      const model = await this.modelsDao.getByIdMinimal(values.model_id)
      await this.interactionsService.increment(model?.interaction_id, 'saves')
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
    if (where?.model_id) {
      const model = await this.modelsDao.getByIdMinimal(where.model_id)
      await this.interactionsService.decrement(model?.interaction_id, 'saves')
    } else if (where?.id) {
      await this.interactionsService.decrement(where.id, 'saves')
    }
    return await this.dao.deleteById(where);
  }
}