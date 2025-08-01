import { isUUID } from 'class-validator';
import KnexService from "../../database/connection";
import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateModel, IGetCartModelsQuery, IGetModelsQuery, IModel, IUpdateModel } from "./models.interface";

export default class ModelsDAO {

  async create(data: ICreateModel) {
    return getFirst(
      await KnexService('models')
        .insert({ ...data })
        .returning("*")
    )
  }

  async update(model_id: string, values: IUpdateModel) {
    return getFirst(
      await KnexService('models')
        .where({ id: model_id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async updateByBrand(brand_id: string, values) {
    return getFirst(
      await KnexService('models')
        .where({ brand_id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async count(filters: IGetModelsQuery) {
    const { categories, exclude_models, styles, name, country_id, ...otherFilters } = filters

    return (
      await KnexService('models')
        .countDistinct("models.id")
        .innerJoin(function () {
          this.select(['model_colors.model_id'])
            .from('model_colors')
            .groupBy('model_colors.id')
            .as('model_colors')
        }, { 'models.id': 'model_colors.model_id' })
        .innerJoin(function () {
          this.select(['brands.*'])
            .from('brands')
            .as('brands')
            .modify((query) => {
              if (country_id?.length) query.where('brands.country_id', country_id)
            })
            .groupBy('brands.id')
        }, { 'models.brand_id': 'brands.id' })
        .where({ 'models.is_deleted': false })
        .modify((query) => {
          if (exclude_models && exclude_models.length > 0) query.whereNotIn("models.id", Array.isArray(exclude_models) ? exclude_models : [exclude_models])
          if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
          if (styles && styles.length > 0) query.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
          if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
          if (name?.length) query.whereILike('models.name', `%${name}%`)
        })
    )[0].count
  }

  async getAll(
    filters: IGetModelsQuery,
    sorts: IDefaultQuery
  ): Promise<IModel[]> {
    const { limit, offset, order, orderBy } = sorts
    const { categories, exclude_models, styles, name, country_id, ...otherFilters } = filters

    return await KnexService("models")
      .select([
        'models.*',
        'brands.id as brand.id',
        'brands.name as brand.name',
        'brands.slug as brand.slug',
        'brands.description as brand.description',
        'brand_country as brand.country',

        'style.id as style.id',
        'style.name as style.name',

        'interactions.views as views',
        'interactions.likes as likes',
        'interactions.saves as saves',

        'categories.id as category.id',
        'categories.name as category.name',
        'categories.parent_id as category.parent_id',
        'parent_name as category.parent_name',

        KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
        KnexService.raw('count(distinct downloads.id) as downloads_count'),

      ])
      .innerJoin(function () {
        this.select([
          'brands.*',
          'countries.name as brand_country'
        ])
          .from('brands')
          .as('brands')
          .leftJoin('countries', { 'countries.id': 'brands.country_id' })
          .groupBy('brands.id', 'countries.id')
          .modify((query) => {
            if (country_id?.length) query.where('brands.country_id', country_id)
          })
      }, { 'models.brand_id': 'brands.id' })
      .leftJoin("downloads", { 'models.id': 'downloads.model_id' })
      .leftJoin("interactions", { 'models.interaction_id': 'interactions.id' })
      .leftJoin({ style: "styles" }, { "models.style_id": "style.id" })
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
      }, { "models.category_id": "categories.id" })
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
      }, { 'models.id': 'model_images.model_id' })
      .limit(limit)
      .offset(offset)
      .where({ 'models.is_deleted': otherFilters.is_deleted || false })
      .modify((query) => {
        if (orderBy) {
          if (orderBy == 'views' || orderBy == 'likes' || orderBy == 'saves') {
            query.orderByRaw('CASE WHEN models.availability = 2 THEN 1 ELSE 0 END ASC')
              .orderBy(`interactions.${orderBy}`, order)
          }
          else
            query.orderByRaw('CASE WHEN models.availability = 2 THEN 1 ELSE 0 END ASC')
              .orderBy(`models.${orderBy}`, order)
        }
        if (exclude_models && exclude_models.length > 0) query.whereNotIn("models.id", Array.isArray(exclude_models) ? exclude_models : [exclude_models])
        if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
        if (styles && styles.length > 0) query.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
        if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
        if (name?.length) query.whereILike('models.name', `%${name}%`)
      })
      .groupBy(
        'models.id',
        'brands.id',
        'brands.name',
        'brands.slug',
        'brands.description',
        'brands.brand_country',
        'style.id',
        'interactions.id',
        'categories.id',
        'categories.name',
        'categories.parent_id',
        'categories.parent_name'
      )
  }

  async getForCart(
    filters: IGetCartModelsQuery,
    sorts: IDefaultQuery
  ): Promise<IModel[]> {
    const { limit, offset, order, orderBy } = sorts
    const { in: IN } = filters

    return await KnexService("models")
      .select([
        'models.id',
        'models.name',
        'models.slug',
        'models.furniture_cost as price',
        'brands.id as brand.id',
        'brands.name as brand.name',
        'model_images.cover_image_src as cover',
      ])
      .leftJoin("brands", { 'models.brand_id': 'brands.id' })
      .innerJoin(function () {
        this.select([
          'model_images.model_id',
          'images.src as cover_image_src'
        ])
          .from('model_images')
          .as('model_images')
          .where('model_images.is_main', '=', true)
          .leftJoin("images", { 'model_images.image_id': 'images.id' })
          .groupBy('model_images.id', 'images.id')
      }, { 'models.id': 'model_images.model_id' })
      .limit(limit)
      .offset(offset)
      .where({ 'models.is_deleted': false })
      .modify((query) => {
        if (orderBy) query.orderBy(`models.${orderBy}`, order);
        if (IN && IN.length > 0) query.whereIn("models.id", Array.isArray(IN) ? IN : [IN])
      })
      .groupBy(
        'models.id',
        'brands.id',
        'model_images.cover_image_src'
      )
  }

  async getByIdOrSlug(identifier: string): Promise<IModel> {
    return getFirst(
      await KnexService('models')
        .select([
          'models.*',

          'brands.id as brand.id',
          'brand_logo as brand.logo',
          'brands.name as brand.name',
          'brands.slug as brand.slug',
          'brands.description as brand.description',
          'brands.address as brand.address',
          'brand_country as brand.country',
          'brands.phone as brand.phone',
          "brand_admin_user_id as brand.admin_user_id",

          'file.id as file.id',
          'file.name as file.name',
          'file.size as file.size',
          'file.ext as file.ext',
          'file.src as file.src',

          'style.id as style.id',
          'style.name as style.name',

          'model_platforms.name as model_platform.name',
          'render_platforms.name as render_platform.name',

          'categories.id as category.id',
          'categories.name as category.name',
          'categories.parent_id as category.parent_id',
          'parent_name as category.parent_name',

          'interactions.views as views',
          'interactions.likes as likes',
          'interactions.saves as saves',

          'products.slug as product_slug',

          'model_images.cover_image_src as cover',

          KnexService.raw('count(distinct downloads.id) as downloads_count'),
          KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
          KnexService.raw('jsonb_agg(distinct "model_colors") as colors'),
          KnexService.raw(`jsonb_agg(distinct "interior_models") as used_interiors`),

          KnexService.raw(`
            (select json_agg(
              json_build_object(
                'id', "model_images"."id",
                'is_main', "model_images"."is_main",
                'index', "model_images"."index",
                'image_id', "model_images"."image_id",
                'model_id', "model_images"."model_id",
                'image_src', "images"."src"
              )
              order by "model_images"."index" asc
            )
            from "model_images"
            left join "images" on "model_images"."image_id" = "images"."id"
            where "model_images"."model_id" = "models"."id" and "is_main" = false
            ) as images
          `),

        ])
        .leftJoin("products", { 'models.product_id': 'products.id' })
        .leftJoin("interactions", { 'models.interaction_id': 'interactions.id' })
        .leftJoin("downloads", { 'models.id': 'downloads.model_id' })
        .leftJoin(function () {
          this.select([
            'model_materials.model_id',
            "materials.id as material.id",
            "materials.name as material.name"
          ])
            .from('model_materials')
            .as('model_materials')
            .leftJoin("materials", { 'model_materials.material_id': 'materials.id' })
            .groupBy('model_materials.id', "materials.id")
        }, { 'models.id': 'model_materials.model_id' })
        .leftJoin({ style: "styles" }, { "models.style_id": "style.id" })
        .leftJoin({ model_platforms: "platforms" }, {
          "models.model_platform_id": "model_platforms.id",
          "model_platforms.type": 1
        })
        .leftJoin({ render_platforms: "platforms" }, {
          "models.render_platform_id": "render_platforms.id",
          "render_platforms.type": 2
        })
        .leftJoin(function () {
          this.select([
            "brands.*",
            "images.key as brand_logo",
            "brand_admins.profile_id as brand_admin_user_id",
            "countries.name as brand_country"
          ])
            .from('brands')
            .as('brands')
            .leftJoin('images', { 'images.id': 'brands.image_id' })
            .leftJoin('brand_admins', { 'brand_admins.brand_id': 'brands.id' })
            .leftJoin('countries', { 'countries.id': 'brands.country_id' })
            .groupBy('brands.id', 'brand_admins.profile_id', 'images.key', 'countries.name')
        }, { 'models.brand_id': 'brands.id' })
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
        }, { "models.category_id": "categories.id" })
        .leftJoin({ file: "files" }, { "models.file_id": "file.id" })
        .innerJoin(function () {
          this.select([
            'model_images.model_id',
            'images.src as cover_image_src'
          ])
            .from('model_images')
            .as('model_images')
            .where('model_images.is_main', '=', true)
            .leftJoin("images", { 'model_images.image_id': 'images.id' })
            .groupBy('model_images.id', 'images.id')
        }, { 'models.id': 'model_images.model_id' })
        .leftJoin(function () {
          this.select([
            'model_colors.id',
            'model_colors.model_id',
            'color.id as color.id',
            'color.name as color.name',
            'color.hex_value as color.hex_value',
          ])
            .from('model_colors')
            .as('model_colors')
            .leftJoin({ color: "colors" }, { 'model_colors.color_id': 'color.id' })
            .groupBy('model_colors.id', 'color.id')
        }, { 'models.id': 'model_colors.model_id' })
        .leftJoin(function () {
          this.select([
            'interior_models.id',
            'interior_models.model_id',
            'interior_models.interior_id',
            'interiors.id as interior.id',
            'interiors.slug as interior.slug',
            'interiors.name as interior.name',
            'interior_cover as interior.cover',
            'author_full_name as interior.author.full_name',
            'author_username as interior.author.username',
            'author_company_name as interior.author.company_name',
            'author_image_src as interior.author.image_src',
          ])
            .from('interior_models')
            .as('interior_models')
            .leftJoin(function () {
              this.select([
                'interiors.*',
                'author.id as author_id',
                'author.full_name as author_full_name',
                'author.username as author_username',
                'author.company_name as author_company_name',
                'author.image_src as author_image_src',
                KnexService.raw('jsonb_agg(distinct "interior_images") as interior_cover'),
              ])
                .from('interiors')
                .as('interiors')
                .leftJoin({ author: 'profiles' }, { 'author.id': 'interiors.user_id' })
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
                .groupBy('interiors.id', 'author.id', 'interior_images.id')
            }, { 'interior_models.interior_id': 'interiors.id' })

            .groupBy(
              'interior_models.id',
              'interiors.id',
              'interiors.name',
              'interiors.slug',
              'interior_cover',
              'author_full_name',
              'author_username',
              'author_company_name',
              'author_image_src',
            )
        }, { 'models.id': 'interior_models.model_id' })
        .groupBy(
          'models.id',
          'interactions.id',
          'products.slug',
          'brands.id',
          'brands.name',
          'brands.slug',
          'brands.address',
          'brands.phone',
          'brands.brand_logo',
          'brands.description',
          'brands.brand_admin_user_id',
          'brands.brand_country',
          'style.id',
          'model_platforms.name',
          'render_platforms.name',
          'file.id',
          'categories.id',
          'categories.name',
          'categories.parent_id',
          'categories.parent_name',
          'model_images.cover_image_src'
        )

        .where({
          [`models.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier,
          'models.is_deleted': false
        })
    )
  }

  async getByIdOrSlug_min(identifier: string): Promise<IModel> {
    return getFirst(
      await KnexService('models')
        .select('models.*')
        .where({
          [`models.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier,
          'models.is_deleted': false
        })
    )
  }

  async getSimilarSlugs(slug: string): Promise<IModel[]> {
    return await KnexService('models')
      .select(['slug'])
      .whereILike('slug', `${slug}%`)
      .where({ is_deleted: false })
  }

  async getByBrandId(brand_id: string) {
    return getFirst(
      await KnexService('models')
        .select('*')
        .where({ brand_id, is_deleted: false })
    )
  }

  async getByIdMinimal(model_id: string) {
    return getFirst(
      await KnexService('models')
        .select('*')
        .where({ id: model_id, is_deleted: false })
    )
  }

  async getByFilters(keyword: string, filters: IGetModelsQuery): Promise<IModel[]> {
    return await KnexService('models')
      .select([
        "models.*",
        "images as models.images"
      ])
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
          .leftJoin("images", { 'model_images.image_id': 'images.id' })
          .groupBy('model_images.id', 'images.id')
          .where({ 'is_main': true })
      }, { 'models.id': 'model_images.model_id' })
      .where(Object.keys(filters).length ? { ...filters, is_deleted: false } : undefined)
      .whereILike('models.name', `%${keyword || ''}%`)
  }

  async deleteById(model_id: string): Promise<number> {
    return await KnexService('models')
      .update({ is_deleted: true })
      .where({ id: model_id, is_deleted: false })
  }

  async deleteByBrandId(brand_id: string): Promise<number> {
    return await KnexService('models')
      .update({ is_deleted: true })
      .where({ brand_id, is_deleted: false })
  }

}