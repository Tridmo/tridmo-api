import KnexService from '../../database/connection';
import { IGetInteriorsQuery, IInterior } from '../interiors/interiors.interface';
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

  async count(
    filters: IFilterInteriorModel,
  ): Promise<number> {

    const { user_id, brand_id, ...others } = filters

    return (
      await KnexService('interior_models')
        .countDistinct("interior_models.id")
        .modify((q) => {
          if (Object.keys(others).length) {
            q.andWhere(others)
          }
          if (user_id) {
            q.innerJoin('interiors', { 'interior_models.interior_id': 'interiors.id' })
              .where('interiors.user_id', '=', user_id)
          }
          if (brand_id) {
            q.innerJoin('models', { 'interior_models.model_id': 'models.id' })
              .where('models.brand_id', '=', brand_id)
          }
        })
    )[0].count as number
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
          'models.cover as model.cover',
        ])
        .leftJoin(function () {
          this.select([
            'models.id',
            'models.name',
            'models.slug',
            'models.brand_id',
            'brands.name as brand_name',
            KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
          ])
            .from('models')
            .as('models')
            .leftJoin("brands", { 'models.brand_id': 'brands.id' })
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
        'models.cover as model.cover',
      ])
      .leftJoin(function () {
        this.select([
          'models.id',
          'models.name',
          'models.slug',
          'models.brand_id',
          'brands.name as brand_name',
          KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
        ])
          .from('models')
          .as('models')
          .leftJoin("brands", { 'models.brand_id': 'brands.id' })
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
        'models.cover',
      )
      .where(filters)
  }

  async getInteriorsByTaggedModel(model_id: string, filters: IGetInteriorsQuery, sorts: IDefaultQuery): Promise<IInterior[]> {

    const { limit, offset, order, orderBy } = sorts
    const { status, styles, categories, platforms, author, name, ...otherFilters } = filters

    return await KnexService("interiors")
      .select([
        'interiors.*',

        'category.id as category.id',
        'category.name as category.name',

        'author.id as author.id',
        'author.full_name as author.full_name',
        'author.username as author.username',
        'author.company_name as author.company_name',
        'author.image_src as author.image_src',

        'interactions.views as views',
        'interactions.likes as likes',
        'interactions.saves as saves',

        KnexService.raw('jsonb_agg(distinct "interior_images") as cover'),
        KnexService.raw(`sum("tags_count".count) as tags_count`),
      ])
      .leftJoin({ author: 'profiles' }, { 'author.id': 'interiors.user_id' })
      .leftJoin({ category: "categories" }, { "interiors.category_id": "category.id" })
      .leftJoin("interactions", { 'interiors.interaction_id': 'interactions.id' })
      .innerJoin(function () {
        this.select('interior_id', KnexService.raw('count(id) as count'))
          .from('interior_models')
          .groupBy('interior_id')
          .as('tags_count')
          .where('model_id', '=', model_id)
      }, { 'interiors.id': 'tags_count.interior_id' })
      .leftJoin(function () {
        this.select([
          'interior_images.id',
          'interior_images.is_main',
          'interior_images.image_id',
          'interior_images.interior_id',
          'images.src as image_src'
        ])
          .from('interior_images')
          .as('interior_images')
          .where('interior_images.is_main', '=', true)
          .leftJoin("images", { 'interior_images.image_id': 'images.id' })
          .groupBy('interior_images.id', 'images.id')
      }, { 'interiors.id': 'interior_images.interior_id' })
      .limit(limit)
      .offset(offset)
      .where({ is_deleted: otherFilters.is_deleted || false })
      .groupBy(
        'interiors.id',
        'category.id',
        'author.id',
        'interactions.id'
      )
      .modify((q) => {
        if (orderBy) {
          if (orderBy == 'views' || orderBy == 'likes' || orderBy == 'saves') {
            q.orderBy(`interactions.${orderBy}`, order)
          }
          else q.orderBy(`interiors.${orderBy}`, order)
        }
        if (status) q.whereIn("interiors.status", Array.isArray(status) ? status : [status])
        if (categories && categories.length > 0) q.whereIn("interiors.category_id", Array.isArray(categories) ? categories : [categories])
        if (styles && styles.length > 0) q.whereIn("interiors.style_id", Array.isArray(styles) ? styles : [styles])
        if (platforms && platforms.length > 0) q.whereIn("interiors.render_platform_id", Array.isArray(platforms) ? platforms : [platforms])
        if (name && name.length) q.whereILike('interiors.name', `%${name}%`)
        if (author && author.length) q.andWhere('interiors.user_id', author)
        if (Object.keys(otherFilters).length) q.andWhere(otherFilters)
      })

  }

  async getAll(filters: IFilterInteriorModel, sorts: IDefaultQuery): Promise<IInteriorModel[]> {
    const { order, orderBy, limit, offset } = sorts
    return await KnexService('interior_models')
      .select([
        'interior_models.id',
        'interior_models.interior_id',
        'interior_models.model_id',
        'interior_models.created_at',
        'models.id as model.id',
        'models.name as model.name',
        'models.slug as model.slug',
        'models.brand_id as model.brand_id',
        'models.brand_name as model.brand_name',
        'model_cover as model.cover',
        'interiors.id as interior.id',
        'interiors.name as interior.name',
        'interiors.slug as interior.slug',
        'interior_cover as interior.cover',
        'interiors_author_id as interior.author.id',
        'interiors_author_full_name as interior.author.full_name',
        'interiors_author_username as interior.author.username',
        'interiors_author_company_name as interior.author.company_name',
        'interiors_author_image_src as interior.author.image_src',
      ])
      .innerJoin(function () {
        this.select([
          'interiors.id',
          'interiors.name',
          'interiors.slug',
          'cover_image_src as interior_cover',
          'profiles.id as interiors_author_id',
          'profiles.full_name as interiors_author_full_name',
          'profiles.username as interiors_author_username',
          'profiles.company_name as interiors_author_company_name',
          'profiles.image_src as interiors_author_image_src',
          // KnexService.raw('jsonb_agg(distinct "interior_images") as cover'),
        ])
          .from('interiors')
          .as('interiors')
          .leftJoin('profiles', { 'profiles.id': 'interiors.user_id' })
          .leftJoin(function () {
            this.select([
              'interior_images.id',
              'interior_images.is_main',
              'interior_images.image_id',
              'interior_images.interior_id',
              'images.src as cover_image_src'
            ])
              .from('interior_images')
              .as('interior_images')
              .where('interior_images.is_main', '=', true)
              .leftJoin("images", { 'interior_images.image_id': 'images.id' })
              .groupBy('interior_images.id', 'images.id')
          }, { 'interiors.id': 'interior_images.interior_id' })
      }, { 'interiors.id': 'interior_models.interior_id' })
      .innerJoin(function () {
        this.select([
          'models.id',
          'models.name',
          'models.slug',
          'models.brand_id',
          'brands.name as brand_name',
          'cover_image_src as model_cover',
          // KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
        ])
          .from('models')
          .as('models')
          .leftJoin("brands", { 'models.brand_id': 'brands.id' })
          .leftJoin(function () {
            this.select([
              'model_images.id',
              'model_images.is_main',
              'model_images.image_id',
              'model_images.model_id',
              'model_images.created_at',
              'images.src as cover_image_src'
            ])
              .from('model_images')
              .as('model_images')
              .where('model_images.is_main', '=', true)
              .leftJoin("images", { 'model_images.image_id': 'images.id' })
              .groupBy('model_images.id', 'images.id')
              .orderBy(`model_images.created_at`, 'asc')
          }, { 'models.id': 'model_images.model_id' })
          .groupBy('models.id', 'brands.id', "model_images.cover_image_src")
      }, { 'models.id': 'interior_models.model_id' })
      .offset(offset)
      .limit(limit)
      .groupBy(
        'interior_models.id',
        'models.id',
        'models.name',
        'models.slug',
        'models.brand_id',
        'models.brand_name',
        'models.model_cover',
        'interiors.id',
        'interiors.id',
        'interiors.name',
        'interiors.slug',
        'interiors.interior_cover',
        'interiors.interiors_author_id',
        'interiors.interiors_author_full_name',
        'interiors.interiors_author_username',
        'interiors.interiors_author_company_name',
        'interiors.interiors_author_image_src',
      )
      .orderBy(`interior_models.${orderBy}`, order)
      .where(filters)
  }

  async deleteBy(filters: IFilterInteriorModel): Promise<number> {
    return await KnexService('interior_models')
      .where(filters)
      .delete()
  }
}