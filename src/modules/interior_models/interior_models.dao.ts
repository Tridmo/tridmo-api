import KnexService from '../../database/connection';
import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateInteriorModel, IFilterInteriorModel, IInteriorModel, IUpdateInteriorModel } from "./interior_models.interface";

export default class InteriorModelsDAO {
  async create(values: ICreateInteriorModel): Promise<IInteriorModel> {
    return getFirst(
      await KnexService('interior_models')
        .insert({
          ...values
        })
        .returning('*')
    )
  }

  async update(id: string, values: IUpdateInteriorModel): Promise<IInteriorModel> {
    return getFirst(
      await KnexService('interior_models')
        .where({ id: id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async getById(id: string): Promise<IInteriorModel> {
    return getFirst(
      await KnexService('interior_models')
        .select([
          'interior_models.*',
          'models.id as model.id',
          'models.name as model.name',
          'models.slug as model.slug',
          'models.brand_id as model.brand.id',
          'models.brand_name as model.brand.name',
          'models.style_id as model.style.id',
          'models.style_name as model.style.name',
          'models.cover as model.cover',
        ])
        .leftJoin(function () {
          this.select([
            'models.id',
            'models.name',
            'models.slug',
            'models.brand_id',
            'models.style_id',
            'brands.name as brand_name',
            'style.name as style_name',
            KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
          ])
            .from('models')
            .as('models')
            .leftJoin("brands", { 'models.brand_id': 'brands.id' })
            .leftJoin({ style: "styles" }, { "models.style_id": "style.id" })
            .leftJoin(function () {
              this.select([
                'model_images.id',
                'model_images.is_main',
                'model_images.image_id',
                'model_images.model_id',
                'model_images.created_at',

                // 'images.id as images.id',
                'images.src as image_src'
              ])
                .from('model_images')
                .as('model_images')
                .where('model_images.is_main', '=', true)
                .leftJoin("images", { 'model_images.image_id': 'images.id' })
                .groupBy('model_images.id', 'images.id')
                .orderBy(`model_images.created_at`, 'asc')
            }, { 'models.id': 'model_images.model_id' })
            .groupBy('models.id', 'brands.id', 'style.id')
        }, { 'models.id': 'interior_models.model_id' })
        .groupBy(
          'interior_models.id',
          'models.id',
          'models.name',
          'models.slug',
          'models.brand_id',
          'models.brand_name',
          'models.style_id',
          'models.style_name',
          'models.cover',
        )
        .where('interior_models.id', '=', id)
    )
  }
  async getBy(filters: IFilterInteriorModel): Promise<IInteriorModel[]> {
    return await KnexService('interior_models')
      .select([
        'interior_models.*',
        'models.id as model.id',
        'models.name as model.name',
        'models.slug as model.slug',
        'models.brand_id as model.brand.id',
        'models.brand_name as model.brand.name',
        'models.style_id as model.style.id',
        'models.style_name as model.style.name',
        'models.cover as model.cover',
      ])
      .leftJoin(function () {
        this.select([
          'models.id',
          'models.name',
          'models.slug',
          'models.brand_id',
          'models.style_id',
          'brands.name as brand_name',
          'style.name as style_name',
          KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
        ])
          .from('models')
          .as('models')
          .leftJoin("brands", { 'models.brand_id': 'brands.id' })
          .leftJoin({ style: "styles" }, { "models.style_id": "style.id" })
          .leftJoin(function () {
            this.select([
              'model_images.id',
              'model_images.is_main',
              'model_images.image_id',
              'model_images.model_id',
              'model_images.created_at',

              // 'images.id as images.id',
              'images.src as image_src'
            ])
              .from('model_images')
              .as('model_images')
              .where('model_images.is_main', '=', true)
              .leftJoin("images", { 'model_images.image_id': 'images.id' })
              .groupBy('model_images.id', 'images.id')
              .orderBy(`model_images.created_at`, 'asc')
          }, { 'models.id': 'model_images.model_id' })
          .groupBy('models.id', 'brands.id', 'style.id')
      }, { 'models.id': 'interior_models.model_id' })
      .groupBy(
        'interior_models.id',
        'models.id',
        'models.name',
        'models.slug',
        'models.brand_id',
        'models.brand_name',
        'models.style_id',
        'models.style_name',
        'models.cover',
      )
      .where(filters)
  }

  async getAll(filters: IFilterInteriorModel, sorts: IDefaultQuery): Promise<IInteriorModel[]> {
    const { order, orderBy, limit, offset } = sorts
    return await KnexService('interior_models')
      .select('*')
      .offset(offset)
      .limit(limit)
      .orderBy(`interior_models.${orderBy}`, order)
      .where(filters)
  }

  async deleteBy(filters: IFilterInteriorModel): Promise<number> {
    return await KnexService('interior_models')
      .where(filters)
      .delete()
  }
}