import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateInterior, ICreateInteriorLike, IFilterInteriorLike, IGetInteriorsQuery, IInterior, IInteriorLike, IUpdateInterior } from "./interiors.interface";
import KnexService from "../../database/connection";
import { isUUID } from 'class-validator';

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
    const { styles, status, categories, platforms, name, author, ...otherFilters } = filters

    return (
      await KnexService('interiors')
        .countDistinct("id")
        .where({ is_deleted: otherFilters.is_deleted || false })
        .modify((q) => {
          if (status) q.whereIn("status", Array.isArray(status) ? status : [status])
          if (categories && categories.length > 0) q.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
          if (styles && styles.length > 0) q.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
          if (platforms && platforms.length > 0) q.whereIn("interiors.render_platform_id", Array.isArray(platforms) ? platforms : [platforms])
          if (name && name.length) q.whereILike('name', `%${name}%`)
          if (author && author.length) q.andWhere('interiors.user_id', author)
          if (Object.keys(otherFilters).length) q.andWhere(otherFilters)
        })
    )[0].count as number
  }

  async getAll(
    filters: IGetInteriorsQuery,
    sorts: IDefaultQuery
  ): Promise<IInterior[]> {

    const { limit, offset, order, orderBy } = sorts
    const { status, styles, categories, platforms, author, name, ...otherFilters } = filters

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
        this.select('interior_id', KnexService.raw('count(id) as count'))
          .from('interior_models')
          .groupBy('interior_id')
          .as('tags_count')
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
        'style.id',
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

  async getByIdMinimal(id: string) {
    return getFirst(
      await KnexService('interiors')
        .select('*')
        .where({ id: id })
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

          KnexService.raw('jsonb_agg(distinct interior_images) as images'),
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
            .leftJoin("images", { 'interior_images.image_id': 'images.id' })
            .groupBy('interior_images.id', 'images.id')
        }, { 'interiors.id': 'interior_images.interior_id' })
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
          [`interiors.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier
        })

    )
  }

  async getByAuthor(user_id: string): Promise<IInterior[]> {
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

  }

  async getSimilarSlugs(slug: string): Promise<IInterior[]> {
    return await KnexService('interiors')
      .select(['slug'])
      .whereILike('slug', `${slug}%`)
  }

  async deleteById(id: string) {
    return await KnexService('interiors')
      .where({ id: id })
      .delete()
  }
}