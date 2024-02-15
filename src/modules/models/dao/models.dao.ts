import { IDefaultQuery } from './../../../modules/shared/interface/query.interface';
import { getFirst } from "../../shared/utils/utils";
import { ICreateModel, IGetModelsQuery, IModel, IUpdateModel } from "../interface/models.interface";
import KnexService from "../../../database/connection";

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

    async count(keyword: string = "", filters) {
        const { categories, colors, styles, ...otherFilters } = filters

        return await KnexService('models')
            .countDistinct("models.id")
            .innerJoin(function () {
                this.select(['model_colors.model_id'])
                    .from('model_colors')
                    .whereIn("color_id", colors)
                    .groupBy('model_colors.id')
                    .as('model_colors')
            }, { 'models.id': 'model_colors.model_id' })
            .whereIn("category_id", categories)
            .whereIn("style_id", styles)
            .andWhere(Object.keys(filters).length ? filters : undefined)
            .whereILike('models.name', `%${keyword || ''}%`)
            .where({ is_deleted: false })
    }

    async getAll(keyword: string = "",
        filters: IGetModelsQuery,
        sorts: IDefaultQuery) {
        const { limit, offset, order, orderBy } = sorts
        const { categories, colors, styles, ...otherFilters } = filters

        return await KnexService("models")
            .select([
                'models.*',
                'brands.id as brand.id',
                'brands.name as brand.name',
                'brands.description as brand.description',

                'file.id as file.id',
                'file.name as file.name',
                'file.size as file.size',
                'file.ext as file.ext',
                'file.src as file.src',

                'style.id as style.id',
                'style.name as style.name',

                'categories.id as category.id',
                'categories.name as category.name',
                'categories.parent_id as category.parent_id',
                'parent_name as category.parent_name',

                KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                KnexService.raw('jsonb_agg(distinct "model_colors") as colors'),

            ])
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
            .leftJoin("brands", { 'models.brand_id': 'brands.id' })
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
            .where('model_images.is_main', '=', false)
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
            .limit(limit)
            .offset(offset)
            .whereIn("category_id", categories)
            .whereIn("style_id", styles)
            .where({ is_deleted: false })
            .andWhere(Object.keys(filters).length ? filters : undefined)
            .whereILike('models.name', `%${keyword || ''}%`)
            .orderBy(`models.${orderBy}`, order)
            .groupBy(
                'models.id',
                'brands.id',
                'style.id',
                'file.id',
                'categories.id',
                'categories.name',
                'categories.parent_id',
                'categories.parent_name')
    }

    async getById(id: string): Promise<IModel> {
        return getFirst(
            await KnexService('models')
                .select([
                    'models.*',
                    'brands.id as brand.id',
                    'brands.name as brand.name',
                    'brands.description as brand.description',

                    'file.id as file.id',
                    'file.name as file.name',
                    'file.size as file.size',
                    'file.ext as file.ext',
                    'file.src as file.src',

                    'style.id as style.id',
                    'style.name as style.name',

                    'categories.id as category.id',
                    'categories.name as category.name',
                    'categories.parent_id as category.parent_id',
                    'parent_name as category.parent_name',

                    KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                    KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                    KnexService.raw('jsonb_agg(distinct "model_colors") as colors'),

                ])
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
                .leftJoin("brands", { 'models.brand_id': 'brands.id' })
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
                .where('model_images.is_main', '=', false)
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
                .groupBy(
                    'models.id',
                    'brands.id',
                    'style.id',
                    'file.id',
                    'categories.id',
                    'categories.name',
                    'categories.parent_id',
                    'categories.parent_name')
                .where({ 'models.id': id })
        )
    }

    async getBySlug(slug: string) {
        return getFirst(
            await KnexService('models')
                .select([
                    'models.*',
                    'brands.id as brand.id',
                    'brands.name as brand.name',
                    'brands.description as brand.description',

                    'file.id as file.id',
                    'file.name as file.name',
                    'file.size as file.size',
                    'file.ext as file.ext',
                    'file.src as file.src',

                    'style.id as style.id',
                    'style.name as style.name',

                    'categories.id as category.id',
                    'categories.name as category.name',
                    'categories.parent_id as category.parent_id',
                    'parent_name as category.parent_name',

                    KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                    KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                    KnexService.raw('jsonb_agg(distinct "model_colors") as colors'),

                ])
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
                .leftJoin("brands", { 'models.brand_id': 'brands.id' })
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
                .where('model_images.is_main', '=', false)
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
                .groupBy(
                    'models.id',
                    'brands.id',
                    'style.id',
                    'file.id',
                    'categories.id',
                    'categories.name',
                    'categories.parent_id',
                    'categories.parent_name')
                .where({ 'models.slug': slug })
        )
    }

    async getByBrandId(brand_id: string) {
        return getFirst(
            await KnexService('models')
                .select('*')
                .where({ brand_id })
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