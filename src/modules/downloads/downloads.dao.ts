import { ICreateDownload, IFilterDownload } from './downloads.interface'
import KnexService from '../../database/connection';
import { getFirst } from "../shared/utils/utils";
import { IDefaultQuery } from '../shared/interface/query.interface';
import { IGetModelsQuery } from '../models/models.interface';

export default class DownloadsDao {
  async create({ user_id, model_id }: ICreateDownload) {
    return getFirst(
      await KnexService("downloads")
        .insert({
          user_id,
          model_id
        })
        .returning("*")
    )
  }

  async getAll(filters: IFilterDownload) {
    return await KnexService('downloads')
      .select('*')
      .where(filters)
  }

  async count(filters: IFilterDownload) {
    return (
      await KnexService('downloads')
        .count('*')
        .where(filters)
    )[0]?.count
  }

  async getAllWithModel(filters: IFilterDownload & IGetModelsQuery, sorts: IDefaultQuery) {
    const { order, orderBy, limit, offset } = sorts
    const { categories, styles, name, user_id, model_id, ...otherFilters } = filters

    return await KnexService('downloads')
      .select([
        'downloads.*',
        'models.id as model.id',
        'models.name as model.name',
        'models.slug as model.slug',
        'models.created_at as model.created_at',
        'models.brand_id as model.brand.id',
        'models.brand_name as model.brand.name',
        'models.category_id as model.category.id',
        'models.category_name as model.category.name',
        'models.cover as model.cover',
      ])
      .innerJoin(function () {
        this.select([
          'models.id',
          'models.name',
          'models.slug',
          'models.brand_id',
          'models.category_id',
          'models.created_at',
          'brands.name as brand_name',
          'categories.name as category_name',
          KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
        ])
          .from('models')
          .as('models')
          .leftJoin("brands", { 'models.brand_id': 'brands.id' })
          .leftJoin('categories', { "models.category_id": "categories.id" })
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
          .groupBy('models.id', 'brands.id', 'categories.id')
          .modify((query) => {
            if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
            if (styles && styles.length > 0) query.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
            if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
            if (name && name.length) query.whereILike('models.name', `%${name}%`)
          })
      }, { 'models.id': 'downloads.model_id' })
      .groupBy(
        'downloads.id',
        'models.id',
        'models.name',
        'models.slug',
        'models.brand_id',
        'models.brand_name',
        'models.category_id',
        'models.category_name',
        'models.cover',
        'models.created_at',
      )
      .limit(limit)
      .offset(offset)
      .modify(q => {
        if (user_id) q.where({ 'downloads.user_id': user_id })
        if (model_id) q.where({ 'downloads.model_id': model_id })
        if (orderBy) q.orderBy(`models.${orderBy}`, order)
      })
  }

  async deleteByModel(model_id: string) {
    return await KnexService('downloads')
      .where({ model_id })
      .delete()
  }

}