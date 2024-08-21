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

  async count(filters: IFilterDownload & IGetModelsQuery) {
    const { brand_id, user_id, user_name, model_id, model_name, categories, styles, ...others } = filters
    return (
      await KnexService('downloads')
        .count('downloads.id')
        .modify((q) => {
          if (brand_id || model_name) {
            q.innerJoin('models', { 'downloads.model_id': 'models.id' })
              .modify(inner => {
                if (brand_id) inner.where('models.brand_id', '=', brand_id)
                if (model_name) inner.whereILike('models.name', `${model_name}%`)
                if (categories && categories.length > 0) inner.whereIn("models.category_id", Array.isArray(categories) ? categories : [categories])
                if (styles && styles.length > 0) inner.whereIn("models.style_id", Array.isArray(styles) ? styles : [styles])
                if (Object.keys(others).length > 0) inner.andWhere(others)
              })
          }
          if (user_name) {
            q.innerJoin('profiles', { 'downloads.user_id': 'profiles.id' })
              .whereILike('profiles.full_name', `${user_name}%`)
          }
          if (user_id) q.where({ 'downloads.user_id': user_id })
          if (model_id) q.where({ 'downloads.model_id': model_id })
        })
    )[0]?.count
  }

  async getAllWithModel(filters: IFilterDownload & IGetModelsQuery, sorts: IDefaultQuery) {
    const { order, orderBy, limit, offset } = sorts
    const { categories, styles, name, user_id, brand_id, model_id, user_name, model_name, ...otherFilters } = filters

    return await KnexService('downloads')
      .select([
        'downloads.*',
        'models.id as model.id',
        'models.name as model.name',
        'models.slug as model.slug',
        'models.created_at as model.created_at',
        'models.brand_id as model.brand.id',
        'models.brand_name as model.brand.name',
        'models.brand_slug as model.brand.slug',
        'models.category_id as model.category.id',
        'models.category_name as model.category.name',
        'models.cover as model.cover',
        'profiles.id as user.id',
        'profiles.full_name as user.full_name',
        'profiles.company_name as user.company_name',
        'profiles.username as user.username',
        'profiles.image_src as user.image_src',
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
          'brands.slug as brand_slug',
          'categories.name as category_name',
          'image_src as cover'
          // KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
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
              'images.src as image_src'
            ])
              .from('model_images')
              .as('model_images')
              .where('model_images.is_main', '=', true)
              .leftJoin("images", { 'model_images.image_id': 'images.id' })
              .groupBy('model_images.id', 'images.id')
              .orderBy(`model_images.created_at`, 'asc')
          }, { 'models.id': 'model_images.model_id' })
          .groupBy('models.id', 'brands.id', 'categories.id', 'model_images.image_src')
          .modify((query) => {
            if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
            if (styles && styles.length > 0) query.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
            if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
            // if (name && name.length) query.whereILike('models.name', `%${name}%`)
          })
      }, { 'models.id': 'downloads.model_id' })
      .innerJoin('profiles', { 'profiles.id': 'downloads.user_id' })
      .groupBy(
        'downloads.id',
        'models.id',
        'models.name',
        'models.slug',
        'models.brand_id',
        'models.brand_name',
        'models.brand_slug',
        'models.category_id',
        'models.category_name',
        'models.cover',
        'models.created_at',
        'profiles.id',
        'profiles.full_name',
        'profiles.company_name',
        'profiles.username',
        'profiles.image_src',
      )
      .limit(limit)
      .offset(offset)
      .modify(q => {
        if (user_id) q.where({ 'downloads.user_id': user_id })
        if (user_name) q.whereILike('profiles.full_name', `${user_name}%`)
        if (model_name) q.whereILike('models.name', `${model_name}%`)
        if (model_id) q.where({ 'downloads.model_id': model_id })
        if (brand_id) q.where('models.brand_id', '=', brand_id)
        if (orderBy) q.orderBy(orderBy != 'created_at' ? `models.${orderBy}` : `downloads.${orderBy}`, order)
      })
  }

  async deleteByModel(model_id: string) {
    return await KnexService('downloads')
      .where({ model_id })
      .delete()
  }

}