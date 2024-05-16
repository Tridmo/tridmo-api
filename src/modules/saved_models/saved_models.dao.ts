import KnexService from '../../database/connection';
import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateSavedModel, IFilterSavedModel, ISavedModel } from "./saved_models.interface";

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

  async count(filters?: IFilterSavedModel): Promise<number> {
    return (
      await KnexService('saved_models')
        .count('id')
        .modify(q => {
          if (Object.keys(filters).length) q.where(filters)
        })
    )[0].count
  }


  async getAll(filters?: IFilterSavedModel, sorts?: IDefaultQuery): Promise<ISavedModel[]> {
    const { order, orderBy, limit, offset } = sorts;

    return await KnexService('saved_models')
      .select([
        'saved_models.*',
        'models.id as model.id',
        'models.slug as model.slug',
        'models.name as model.name',
        'model_cover as model.cover',
        'models.brand_id as model.brand.id',
        'brand_name as model.brand.name',
      ])
      .leftJoin(function () {
        this.select([
          'models.*',
          'brand.name as brand_name',
          KnexService.raw('jsonb_agg(distinct "model_images") as model_cover'),
        ])
          .from('models')
          .as('models')
          .leftJoin({ brand: 'brands' }, { 'brand.id': 'models.brand_id' })
          .leftJoin(function () {
            this.select([
              'model_images.id',
              'model_images.is_main',
              'model_images.image_id',
              'model_images.model_id',
              'images.src as image_src'
            ])
              .from('model_images')
              .as('model_images')
              .where('model_images.is_main', '=', true)
              .leftJoin("images", { 'model_images.image_id': 'images.id' })
              .groupBy('model_images.id', 'images.id')
          }, { 'models.id': 'model_images.model_id' })
          .groupBy('models.id', 'brand.id', 'model_images.id')
      }, { 'saved_models.model_id': 'models.id' })
      .groupBy(
        'saved_models.id',
        'models.id',
        'models.name',
        'models.slug',
        'models.brand_id',
        'model_cover',
        'brand_name',
      )
      .modify(q => {
        if (Object.keys(filters).length) q.where(filters)
        if (order && orderBy) q.orderBy(`saved_models.${orderBy}`, order)
        else q.orderBy(`saved_models.created_at`, 'desc')
        if (limit) q.limit(limit)
        if (offset) q.offset(offset)
      })
  }

  async getAllMin(filters?: IFilterSavedModel, sorts?: IDefaultQuery): Promise<ISavedModel[]> {
    const { order, orderBy, limit, offset } = sorts;

    return await KnexService('saved_models')
      .select([
        'saved_models.*',
      ])
      .modify(q => {
        if (Object.keys(filters).length) q.where(filters)
        if (order && orderBy) q.orderBy(`saved_models.${orderBy}`, order)
        else q.orderBy(`saved_models.created_at`, 'desc')
        if (limit) q.limit(limit)
        if (offset) q.offset(offset)
      })
  }

  async deleteById(where: IFilterSavedModel): Promise<number> {
    return await KnexService('saved_models')
      .where(where)
      .delete()
  }
}