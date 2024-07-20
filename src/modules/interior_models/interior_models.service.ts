import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import { IInteriorModel, ICreateInteriorModel, IUpdateInteriorModel, IFilterInteriorModel } from "./interior_models.interface";
import InteriorModelsDAO from "./interior_models.dao";
import { IDefaultQuery } from "../shared/interface/query.interface";
import flat from 'flat';
import { IGetInteriorsQuery, IInterior } from "../interiors/interiors.interface";

export default class InteriorModelsService {
  private dao = new InteriorModelsDAO()

  async create(values: ICreateInteriorModel): Promise<IInteriorModel> {
    const newTag = await this.dao.create(values)
    return flat.unflatten(await this.findById(newTag.id))
  }

  async update(id: string, values: IUpdateInteriorModel): Promise<IInteriorModel> {
    const foundImageTag = await this.dao.getById(id);
    if (isEmpty(foundImageTag)) throw new ErrorResponse(400, "Image tag was not found");
    const data = await this.dao.update(id, values)
    return data
  }

  async count(filters: IFilterInteriorModel): Promise<number> {
    return await this.dao.count(filters);
  }

  async findById(id: string): Promise<IInteriorModel> {
    const data = await this.dao.getById(id);
    if (!data) throw new ErrorResponse(400, "Image text was not found");

    return data
  }

  async findBy(filters: IFilterInteriorModel): Promise<IInteriorModel[]> {
    const data = await this.dao.getBy(filters);
    for (let i = 0; i < data.length; i++) {
      data[i] = flat.unflatten(data[i])
    }
    return data
  }
  async findAll(filters: IFilterInteriorModel, sorts: IDefaultQuery): Promise<IInteriorModel[]> {
    const data = await this.dao.getAll(filters, sorts);
    for (let i = 0; i < data.length; i++) {
      data[i] = flat.unflatten(data[i])
    }
    return data
  }
  async findInteriorsByTaggedModel(model_id: string, filters: IGetInteriorsQuery, sorts: IDefaultQuery): Promise<IInterior[]> {
    const data = await this.dao.getInteriorsByTaggedModel(model_id, filters, sorts);
    for (let i = 0; i < data.length; i++) {
      data[i] = flat.unflatten(data[i])
    }
    return data
  }

  async deleteBy(filters: IFilterInteriorModel): Promise<number> {
    return await this.dao.deleteBy(filters);
  }
}