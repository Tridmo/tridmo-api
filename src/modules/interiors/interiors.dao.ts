import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateInterior, ICreateInteriorLike, IFilterInteriorLike, IGetInteriorsQuery, IInterior, IInteriorLike, IUpdateInterior } from "./interiors.interface";
import KnexService from "../../database/connection";
import { isDefined, isUUID } from 'class-validator';

export default class InteriorsDAO {

  async create(data: ICreateInterior) {
    return getFirst(
      await KnexService('interiors')
        .insert({ ...data })
        .returning("*")
    )
  }

  async update(id: string, values: IUpdateInterior) {
    return getFirst(
      await KnexService('interiors')
        .update({ ...values })
        .where({ id })
        .returning("*")
    )
  }

  async createLike(interaction_id: string, values: ICreateInteriorLike) {
    const insert = getFirst(
      await KnexService('interior_likes')
        .insert(values)
        .returning("*")
    )
    await KnexService('interactions').increment('likes').where({ id: interaction_id })
    return insert
  }

  async removeLike(interaction_id: string, values: ICreateInteriorLike) {
    await KnexService('interior_likes').where(values).delete()
    await KnexService('interactions').decrement('likes').where({ id: interaction_id })
  }

  async findLike(filters: IFilterInteriorLike) {
    return await KnexService('interior_likes').where(filters)
  }

  async count(
    filters: IGetInteriorsQuery,
  ): Promise<number> {
    const { styles, status, categories, platforms, name, author, has_models_of_brand, ...otherFilters } = filters

    const query = KnexService('interiors')
      .countDistinct("interiors.id")
      .where({ 'interiors.is_deleted': otherFilters.is_deleted || false })
      .modify((q) => {
        if (isDefined(status)) q.where("status", status)
        if (isDefined(categories) && categories.length > 0) q.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
        if (isDefined(styles) && styles.length > 0) q.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
        if (isDefined(platforms) && platforms.length > 0) q.whereIn("interiors.render_platform_id", Array.isArray(platforms) ? platforms : [platforms])
        if (isDefined(name) && name.length) q.whereILike('name', `%${name}%`)
        if (isDefined(author) && author.length) q.andWhere('interiors.user_id', author)
        if (Object.keys(otherFilters).length) q.andWhere(otherFilters)
        if (isDefined(has_models_of_brand)) {
          q.innerJoin('interior_models', { 'interior_models.interior_id': 'interiors.id' })
            .innerJoin('models', { 'models.id': 'interior_models.model_id' })
            .where('models.brand_id', '=', has_models_of_brand)
        }
      })
    return (await query)[0].count as number
  }

  async getAll(
    filters: IGetInteriorsQuery,
    sorts: IDefaultQuery
  ): Promise<IInterior[]> {

    const { limit, offset, order, orderBy } = sorts
    const { exclude_interiors, status, styles, categories, platforms, author, name, has_models_of_brand, ...otherFilters } = filters

    return await KnexService("interiors")
      .select([
        'interiors.*',

        'style.id as style.id',
        'style.name as style.name',

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
      .leftJoin({ style: "styles" }, { "interiors.style_id": "style.id" })
      .leftJoin({ category: "categories" }, { "interiors.category_id": "category.id" })
      .leftJoin("interactions", { 'interiors.interaction_id': 'interactions.id' })
      .leftJoin(function () {
        this.select([
          'interior_images.id',
          'interior_images.is_main',
          'interior_images.index',
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
      .where({ 'interiors.is_deleted': otherFilters.is_deleted || false })
      .groupBy(
        'interiors.id',
        'style.id',
        'category.id',
        'author.id',
        'interactions.id'
      )
      .modify((q) => {
        if (isDefined(orderBy)) {
          if (orderBy == 'views' || orderBy == 'likes' || orderBy == 'saves') {
            q.orderBy(`interactions.${orderBy}`, order)
          }
          else q.orderBy(`interiors.${orderBy}`, order)
        }
        if (isDefined(exclude_interiors) && exclude_interiors.length > 0) q.whereNotIn("interiors.id", Array.isArray(exclude_interiors) ? exclude_interiors : [exclude_interiors])
        if (isDefined(status)) q.whereIn("interiors.status", Array.isArray(status) ? status : [status])
        if (isDefined(categories) && categories.length > 0) q.whereIn("interiors.category_id", Array.isArray(categories) ? categories : [categories])
        if (isDefined(styles) && styles.length > 0) q.whereIn("interiors.style_id", Array.isArray(styles) ? styles : [styles])
        if (isDefined(platforms) && platforms.length > 0) q.whereIn("interiors.render_platform_id", Array.isArray(platforms) ? platforms : [platforms])
        if (isDefined(name) && name.length) q.whereILike('interiors.name', `%${name}%`)
        if (isDefined(author) && author.length) q.andWhere('interiors.user_id', author)
        if (Object.keys(otherFilters).length) q.andWhere(otherFilters)
        if (isDefined(has_models_of_brand)) {
          q.innerJoin(function () {
            this.select('interior_id', 'model_id', KnexService.raw('count(id) as count'))
              .from('interior_models')
              .groupBy('interior_id', 'model_id')
              .as('tags_count')
          }, { 'interiors.id': 'tags_count.interior_id' })
            .innerJoin('models', { 'models.id': 'tags_count.model_id' })
            .where('models.brand_id', '=', has_models_of_brand)
        } else if (!has_models_of_brand) {
          q.leftJoin(function () {
            this.select('interior_id', KnexService.raw('count(id) as count'))
              .from('interior_models')
              .groupBy('interior_id')
              .as('tags_count')
          }, { 'interiors.id': 'tags_count.interior_id' })
        }
      })
  }

  async getByIdMinimal(id: string): Promise<IInterior> {
    return getFirst(
      await KnexService('interiors')
        .select('*')
        .where({ id: id, is_deleted: false })
    )
  }

  async getByIdOrSlug(identifier: string): Promise<IInterior> {
    return getFirst(
      await KnexService('interiors')
        .select([
          'interiors.*',

          'style.id as style.id',
          'style.name as style.name',

          'categories.id as category.id',
          'categories.name as category.name',
          'categories.parent_id as category.parent_id',
          'parent_name as category.parent_name',

          'author.id as author.id',
          'author.full_name as author.full_name',
          'author.username as author.username',
          'author.company_name as author.company_name',
          'author.image_src as author.image_src',

          'interactions.views as views',
          'interactions.likes as likes',
          'interactions.saves as saves',

          KnexService.raw(`
            (select json_agg(
              json_build_object(
                'id', "interior_images"."id",
                'is_main', "interior_images"."is_main",
                'index', "interior_images"."index",
                'image_id', "interior_images"."image_id",
                'interior_id', "interior_images"."interior_id",
                'image_src', "images"."src"
              )
              order by "interior_images"."index" asc
            )
            from "interior_images"
            left join "images" on "interior_images"."image_id" = "images"."id"
            where "interior_images"."interior_id" = "interiors"."id"
            and "interior_images"."is_main" = false
            ) as images
          `),
          KnexService.raw(`jsonb_agg(distinct interior_models) as used_models`),
        ])
        .join({ author: 'profiles' }, 'author.id', 'interiors.user_id')
        .leftJoin({ style: "styles" }, "style.id", "interiors.style_id")
        .leftJoin("interactions", "interactions.id", "interiors.interaction_id")
        .leftJoin(function () {
          this.select([
            "categories.id",
            "categories.name",
            "categories.parent_id",
            "parent.name as parent_name"
          ])
            .leftJoin({ parent: "categories" }, { "categories.parent_id": "parent.id" })
            .from("categories")
            .as("categories")
            .groupBy("categories.id", "parent.id")
        }, { "interiors.category_id": "categories.id" })
        .leftJoin(function () {
          this.select([
            'interior_models.id',
            'interior_models.model_id',
            'interior_models.interior_id'
          ])
            .from('interior_models')
            .as('interior_models')
            .leftJoin("models", { 'interior_models.model_id': 'models.id' })
            .groupBy('interior_models.id')
        }, { 'interiors.id': 'interior_models.interior_id' })
        .groupBy(
          'interiors.id',
          'interactions.id',
          'style.id',
          'author.id',
          'categories.id',
          'categories.name',
          'categories.parent_id',
          'categories.parent_name'
        )
        .where({
          [`interiors.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier,
          is_deleted: false
        })

    )
  }

  async getByAuthor(user_id: string, filters: IGetInteriorsQuery = {}): Promise<IInterior[]> {

    const { has_models_of_brand } = filters

    return await KnexService('interiors')
      .select([
        'interiors.*',

        'style.id as style.id',
        'style.name as style.name',

        'author.id as author.id',
        'author.full_name as author.full_name',
        'author.username as author.username',
        'author.company_name as author.company_name',
        'author.image_src as author.image_src',

        KnexService.raw('jsonb_agg(distinct "interior_images") as cover'),

      ])
      .join({ author: 'profiles' }, 'author.id', 'interiors.user_id')
      .leftJoin({ style: "styles" }, "style.id", "interiors.style_id")
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
      .where({ is_deleted: false, user_id })
      .orderBy(`interiors.created_at`, 'desc')
      .groupBy('interiors.id', 'style.id')
      .modify(q => {
        if (has_models_of_brand) {
          q.innerJoin('interior_models', { 'interior_models.interior_id': 'interiors.id' })
            .innerJoin('models', { 'models.id': 'interior_models.model_id' })
            .where('models.brand_id', '=', has_models_of_brand)
        }
      })

  }

  async getSimilarSlugs(slug: string): Promise<IInterior[]> {
    return await KnexService('interiors')
      .select(['slug'])
      .whereILike('slug', `${slug}%`)
      .where({ is_deleted: false })
  }

  async deleteById(id: string): Promise<void> {
    await KnexService('interiors')
      .update({ is_deleted: true })
      .where({ id: id, is_deleted: false })
  }
}