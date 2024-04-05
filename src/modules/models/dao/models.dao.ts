import { IDefaultQuery } from './../../../modules/shared/interface/query.interface';
import { getFirst } from "../../shared/utils/utils";
import { ICreateModel, IGetModelsQuery, IModel, IUpdateModel } from "../interface/models.interface";
import KnexService from "../../../database/connection";
import { isUUID } from 'class-validator';

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

    async count(filters) {
        const { categories, styles, name, ...otherFilters } = filters

        return (
            await KnexService('models')
                .countDistinct("models.id")
                .innerJoin(function () {
                    this.select(['model_colors.model_id'])
                        .from('model_colors')
                        .groupBy('model_colors.id')
                        .as('model_colors')
                }, { 'models.id': 'model_colors.model_id' })
                .where({ is_deleted: false })
                .modify((query) => {
                    if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
                    if (styles && styles.length > 0) query.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
                    if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
                    if (name && name.length) query.whereILike('models.name', `%${name}%`)
                })
        )[0].count
    }

    async getAll(
        filters: IGetModelsQuery,
        sorts: IDefaultQuery
    ): Promise<IModel[]> {
        const { limit, offset, order, orderBy } = sorts
        const { categories, styles, name, ...otherFilters } = filters

        return await KnexService("models")
            .select([
                'models.*',
                'brands.id as brand.id',
                'brands.name as brand.name',
                'brands.description as brand.description',

                'style.id as style.id',
                'style.name as style.name',

                'interactions.views as views',
                'interactions.likes as likes',
                'interactions.saves as saves',

                KnexService.raw('jsonb_agg(distinct "model_images") as cover'),

            ])
            .leftJoin("brands", { 'models.brand_id': 'brands.id' })
            .leftJoin("interactions", { 'models.interaction_id': 'interactions.id' })
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
            .limit(limit)
            .offset(offset)
            .where({ is_deleted: otherFilters.is_deleted || false })
            .modify((query) => {
                if (orderBy) {
                    if (orderBy == 'views' || orderBy == 'likes' || orderBy == 'saves') {
                        query.orderBy(`interactions.${orderBy}`, order)
                    }
                    else query.orderBy(`models.${orderBy}`, order)
                }
                if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
                if (styles && styles.length > 0) query.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
                if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
                if (name && name.length) query.whereILike('models.name', `%${name}%`)
            })
            .groupBy(
                'models.id',
                'brands.id',
                'style.id',
                'interactions.id'
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
                    'brands.description as brand.description',
                    'brands.address as brand.address',
                    'brands.phone as brand.phone',

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

                    KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                    KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                    KnexService.raw('jsonb_agg(distinct "model_colors") as colors'),
                    KnexService.raw(`coalesce(jsonb_agg(distinct "interior_models") filter (where "interior_models" is not null), '[]'::jsonb ) as used_interiors`),

                ])
                .leftJoin("interactions", { 'models.interaction_id': 'interactions.id' })

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
                        "images.key as brand_logo"
                    ])
                        .from('brands')
                        .as('brands')
                        .leftJoin('images', { 'images.id': 'brands.image_id' })
                        .groupBy('brands.id', 'images.key')
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
                        .leftJoin("images", { 'model_images.image_id': 'images.id' })
                        .groupBy('model_images.id', 'images.id')
                        .orderBy(`model_images.created_at`, 'asc')
                }, { 'models.id': 'model_images.model_id' })
                // .where('model_images.is_main', '=', false)
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
                        'interior_models.interior_id'
                    ])
                        .from('interior_models')
                        .as('interior_models')
                        .leftJoin("interiors", { 'interior_models.interior_id': 'interiors.id' })
                        .groupBy('interior_models.id')
                }, { 'models.id': 'interior_models.model_id' })
                .groupBy(
                    'models.id',
                    'interactions.id',
                    'brands.id',
                    'brands.name',
                    'brands.address',
                    'brands.phone',
                    'brands.brand_logo',
                    'brands.description',
                    'style.id',
                    'model_platforms.name',
                    'render_platforms.name',
                    'file.id',
                    'categories.id',
                    'categories.name',
                    'categories.parent_id',
                    'categories.parent_name')

                .where({
                    [`models.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier
                })
        )
    }

    async getSimilarSlugs(slug: string): Promise<IModel[]> {
        return await KnexService('models')
            .select(['slug'])
            .whereILike('slug', `${slug}%`)
    }

    async getByBrandId(brand_id: string) {
        return getFirst(
            await KnexService('models')
                .select('*')
                .where({ brand_id })
        )
    }

    async getByIdMinimal(model_id: string) {
        return getFirst(
            await KnexService('models')
                .select('*')
                .where({ id: model_id })
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
            .where(Object.keys(filters).length ? filters : undefined)
            .whereILike('models.name', `%${keyword || ''}%`)
    }

    async deleteById(model_id: string): Promise<number> {
        return await KnexService('models')
            .where({ id: model_id })
            .delete()
    }

    async deleteByBrandId(brand_id: string): Promise<number> {
        return await KnexService('models')
            .where({ brand_id })
            .delete()
    }

}