import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateProduct, IGetProductsQuery } from "../interface/products.interface";
import { IDefaultQuery } from '../../shared/interface/query.interface';

export default class ProductsDAO {
    async create({ title, description, cost_id, style_id, file_id, slug, is_free }: ICreateProduct) {
        return getFirst(
            await KnexService("products")
                .insert({
                    title,
                    description,
                    cost_id,
                    file_id,
                    style_id,
                    slug,
                    is_free
                })
                .returning("*")
        )
    }

    async update(id: string, values) {
        return getFirst(
            await KnexService("products")
                .update({
                    ...values
                })
                .where({ id })
                .returning("*")
        )
    }
    async updateByFile(file_id: string, values) {
        await KnexService("products")
            .update({
                ...values
            })
            .where({ file_id })
            .returning("*")
    }

    async getAll(
        keyword: string = "",
        filters,
        sorts: IDefaultQuery,
        categories,
        styles,
        colors) {

        const { limit, offset, order, orderBy } = sorts
        return await KnexService("products")
            .select([
                "products.id",
                "products.slug",
                "products.title",
                'cost.amount as cost',
                'interiors.id as interior',
                'models.id as model',
                'models.yamo_id as yamo_id',
                'collections.id as collection',
                'categories.id as category_id',
                KnexService.raw(`jsonb_agg(distinct model_images) as images`)
            ])
            .leftJoin({ cost: "costs" }, { "products.cost_id": "cost.id" })
            .leftJoin(function () {
                this.select([
                    'model_images.product_id',
                    "image.src as image.src"
                ])
                    .from('model_images')
                    .where({ is_main: true })
                    .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                    .groupBy('model_images.id', "image.id")
                    .as('model_images')
            }, { 'products.id': 'model_images.product_id' })
            .innerJoin(function () {
                this.select([
                    'model_colors.id',
                    'model_colors.product_id',
                ])
                    .from('model_colors')
                    .whereIn("color_id", colors)
                    .groupBy('model_colors.id')
                    .as('model_colors')
            }, { 'products.id': 'model_colors.product_id' })
            .leftJoin('interiors', { "products.id": "interiors.product_id" })
            .leftJoin('models', { 'products.id': 'models.product_id' })
            .leftJoin('collections', { 'products.id': 'collections.product_id' })
            .leftJoin('categories', function () {
                this.on('models.category_id', '=', 'categories.id')
                    .orOn('interiors.category_id', '=', 'categories.id')
                    .orOn('collections.category_id', '=', 'categories.id')
            })
            .limit(limit)
            .offset(offset)
            .orderBy(`products.${orderBy}`, order)
            .where({
                ...filters
            })
            .whereILike('products.title', `%${keyword}%`)
            .orWhere({
                'models.yamo_id': keyword
            })
            .whereIn("categories.id", categories)
            .whereIn("style_id", styles)
            .groupBy(
                'products.id',
                'cost.id',
                'categories.id',
                'interiors.id',
                'models.id',
                'collections.id'
            )
    }


    async searchBySlug(keyword: string) {
        return await KnexService("products")
            .select("*")
            .orderBy(`slug`, "desc")
            .whereILike('slug', `%${keyword}%`)
    }

    async countByCriteria(
        keyword: string = "",
        filters,
        categories,
        styles,
        colors) {

        return await KnexService("products")
            .count('*')
            .from(function () {
                this.select('products.id')
                    .from('products')
                    .as('products')
                    .innerJoin(function () {
                        this.select(['model_colors.product_id'])
                            .from('model_colors')
                            .whereIn("color_id", colors)
                            .groupBy('model_colors.id')
                            .as('model_colors')
                    }, { 'products.id': 'model_colors.product_id' })
                    .leftJoin('interiors', { "products.id": "interiors.product_id" })
                    .leftJoin('models', { 'products.id': 'models.product_id' })
                    .leftJoin('collections', { 'products.id': 'collections.product_id' })
                    .leftJoin('categories', function () {
                        this.on('models.category_id', '=', 'categories.id')
                            .orOn('interiors.category_id', '=', 'categories.id')
                            .orOn('collections.category_id', '=', 'categories.id')
                    })
                    .where({ ...filters })
                    .whereILike('products.title', `%${keyword}%`)
                    .orWhereILike('models.yamo_id', `%${keyword}%`)
                    .whereIn("categories.id", categories)
                    .whereIn("style_id", styles)
                    .groupBy(
                        'products.id',
                        'categories.id',
                        'interiors.id',
                        'models.id',
                        'collections.id'
                    )
            })
    }

    async getById(id: string) {
        return getFirst(
            await KnexService("products")
                .select([
                    "products.*",

                    'file.id as file.id',
                    'file.name as file.name',
                    'file.size as file.size',
                    'file.ext as file.ext',
                    'file.src as file.src',

                    'style.id as style.id',
                    'style.name as style.name',

                    'cost.amount as cost',

                    // 'categories.id as category.id',
                    // 'categories.name as category.name', 
                    // 'categories.parent_id as category.parent_id',
                    // 'parent_name as category.parent_name',

                    // 'models.id as model.id', 
                    // 'models.product_id as model.product_id',
                    // 'models.length as model.length',
                    // 'models.width as model.width',
                    // 'models.height as model.height',
                    // 'models.polygons_count as model.polygons_count',
                    // 'models.vertices_count as model.vertices_count',
                    // 'models.brand_id as model.brand_id',
                    // 'models.category_id as model.category_id',
                    // 'models.formfactor_id as model.formfactor_id',

                    // 'category.id as model.category.id',
                    // 'category.name as model.category.name', 
                    // 'category.parent_id as model.category.parent_id',
                    // 'parent_name as model.category.parent_name',

                    // 'brand.id as model.brand.id',
                    // 'brand.name as model.brand.name',

                    // 'formfactor.id as model.formfactor.id',
                    // 'formfactor.name as model.formfactor.name',

                    // 'materials as model.materials',

                    KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                    KnexService.raw('jsonb_agg(distinct "model_colors") as colors'),
                    KnexService.raw('jsonb_agg(distinct "models") as model'),
                    KnexService.raw('jsonb_agg(distinct "interiors") as interior')
                ])
                .leftJoin({ style: "styles" }, { "products.style_id": "style.id" })
                .leftJoin({ file: "files" }, { "products.file_id": "file.id" })
                .leftJoin({ cost: "costs" }, { "products.cost_id": "cost.id" })

                .leftJoin(function () {
                    this.select([
                        'interiors.*',
                        'presentation.id as presentation.id',
                        'presentation.name as presentation.name',
                        'presentation.size as presentation.size',
                        'presentation.ext as presentation.ext',
                        'presentation.src as presentation.src',

                        'categories.id as category.id',
                        'categories.name as category.name',
                        'categories.parent_id as category.parent_id',
                        'parent_name as category.parent_name',

                        KnexService.raw('jsonb_agg(distinct "interior_models") as used_models')

                    ])
                        .from("interiors")
                        .as("interiors")
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
                        .leftJoin({ presentation: "files" }, { "interiors.presentation_id": "presentation.id" })
                        .leftJoin(function () {
                            this.select([
                                'interior_models.id',
                                'interior_models.model_id',
                                'interior_models.interior_id',

                                'model.* as model.*',
                                "product.id as product.id",
                                "product.title as product.title",
                                "product.cost_id as product.cost_id",
                                "product.is_free as product.is_free",
                                "product.slug as product.slug",

                                'cost.amount as product.cost.amount',

                                KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                            ])
                                .from('interior_models')
                                .as('interior_models')
                                .leftJoin({ model: "models" }, { 'interior_models.model_id': 'model.id' })

                                .leftJoin({ product: 'products' }, 'product.id', 'model.product_id')
                                .leftJoin({ cost: "costs" }, { "product.cost_id": "cost.id" })
                                .leftOuterJoin(function () {
                                    this.select([
                                        'model_images.id',
                                        'model_images.is_main',
                                        'model_images.image_id',
                                        'model_images.product_id',
                                        'model_images.created_at',
                                        // 'images.id as images.id',
                                        'images.src as image_src'
                                    ])
                                        .from('model_images')
                                        .as('model_images')
                                        .leftJoin("images", { 'model_images.image_id': 'images.id' })
                                        .groupBy('model_images.id', 'images.id')
                                        .orderBy(`model_images.created_at`, 'asc')
                                        .where('model_images.is_main', '=', true)
                                }, { 'product.id': 'model_images.product_id' })
                                .groupBy('interior_models.id', 'model.id', 'product.id', "cost.id")
                        }, { 'interiors.id': 'interior_models.interior_id' })

                        .groupBy(
                            'interiors.id',
                            'presentation.id',
                            'categories.id',
                            'categories.name',
                            'categories.parent_id',
                            'categories.parent_name'
                        )
                }, { "products.id": "interiors.product_id" })
                .leftJoin(function () {
                    this.select([
                        'model_images.id',
                        'model_images.product_id',
                        'model_images.created_at',
                        "image.id as image.id",
                        "image.src as image.src"
                    ])
                        .from('model_images')
                        .as('model_images')
                        .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                        .where('model_images.is_main', '=', false)
                        .groupBy('model_images.id', "image.id")
                }, { 'products.id': 'model_images.product_id' })
                .leftJoin(function () {
                    this.select([
                        'model_colors.id',
                        'model_colors.product_id',
                        'color.id as color.id',
                        'color.name as color.name',
                        'color.hex_value as color.hex_value',
                    ])
                        .from('model_colors')
                        .as('model_colors')
                        .leftJoin({ color: "colors" }, { 'model_colors.color_id': 'color.id' })
                        .groupBy('model_colors.id', 'color.id')
                }, { 'products.id': 'model_colors.product_id' })
                .leftJoin(function () {
                    this.select([
                        'models.product_id',
                        'models.id',
                        'models.length',
                        'models.width',
                        'models.height',
                        'models.polygons_count',
                        'models.vertices_count',
                        'models.brand_id',
                        'models.formfactor_id',
                        'models.category_id',

                        'brand.id as brand.id',
                        'brand.name as brand.name',

                        'formfactor.id as formfactor.id',
                        'formfactor.name as formfactor.name',

                        'categories.id as category.id',
                        'categories.name as category.name',
                        'categories.parent_id as category.parent_id',
                        'parent_name as category.parent_name',

                        KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                        KnexService.raw('jsonb_agg(distinct "interior_models") as used_interiors'),
                    ])
                        .from('models')
                        .as('models')
                        .leftJoin({ formfactor: "formfactors" }, { "models.formfactor_id": "formfactor.id" })
                        .leftJoin({ brand: "brands" }, { "models.brand_id": "brand.id" })
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
                                'model_materials.id',
                                'model_materials.model_id',
                                "material.id as material.id",
                                "material.name as material.name"
                                // KnexService.raw(`jsonb_agg(distinct "materials") as material`)
                            ])
                                .from('model_materials')
                                .leftJoin({ material: "materials" }, { 'model_materials.material_id': 'material.id' })
                                .groupBy('model_materials.id', "material.id")
                                .as('model_materials')
                        }, { 'models.id': 'model_materials.model_id' })
                        .leftJoin(function () {
                            this.select([
                                'interior_models.id',
                                'interior_models.model_id',
                                'interior_models.interior_id',

                                "interior.* as interior.*",
                                "product.id as product.id",
                                "product.title as product.title",
                                "product.cost_id as product.cost_id",
                                "product.is_free as product.is_free",
                                "product.slug as product.slug",

                                'cost.amount as product.cost.amount',

                                KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                            ])
                                .from('interior_models')
                                .as('interior_models')
                                .leftJoin({ interior: "interiors" }, { 'interior_models.interior_id': 'interior.id' })

                                .join({ product: 'products' }, 'product.id', 'interior.product_id')
                                .leftJoin({ cost: "costs" }, { "product.cost_id": "cost.id" })

                                .leftJoin(function () {
                                    this.select([
                                        'model_images.id',
                                        'model_images.is_main',
                                        'model_images.image_id',
                                        'model_images.product_id',
                                        'model_images.created_at',
                                        // 'images.id as images.id',
                                        'images.src as image_src'
                                    ])
                                        .from('model_images')
                                        .as('model_images')
                                        .leftJoin("images", { 'model_images.image_id': 'images.id' })
                                        .groupBy('model_images.id', 'images.id')
                                        .orderBy(`model_images.created_at`, 'asc')
                                        .where('model_images.is_main', '=', true)
                                }, { 'product.id': 'model_images.product_id' })
                                .groupBy('interior_models.id', 'interior.id', 'product.id', "cost.id")
                        }, { 'models.id': 'interior_models.model_id' })
                        .groupBy(
                            'models.id',
                            'formfactor.id',
                            'brand.id',
                            'categories.id',
                            'categories.name',
                            'categories.parent_id',
                            'categories.parent_name'
                        )
                }, { 'products.id': 'models.product_id' })

                .where("products.id", id)
                .groupBy(
                    'products.id',
                    "cost.id",
                    'style.id',
                    'file.id'
                )
        )
    }

    async getBySlug(slug: string) {

        return getFirst(
            await KnexService("products")
                .select([
                    "products.*",

                    'style.id as style.id',
                    'style.name as style.name',

                    'cost.amount as cost',

                    KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                    KnexService.raw('jsonb_agg(distinct "model_colors") as colors'),
                    KnexService.raw('jsonb_agg(distinct "models") as model'),
                    KnexService.raw('jsonb_agg(distinct "interiors") as interior'),
                    KnexService.raw('jsonb_agg(distinct "collections") as collection')
                ])
                .leftJoin({ style: "styles" }, { "products.style_id": "style.id" })
                .leftJoin({ cost: "costs" }, { "products.cost_id": "cost.id" })

                .leftJoin(function () {
                    this.select([
                        'interiors.*',
                        'presentation.id as presentation.id',
                        'presentation.name as presentation.name',
                        'presentation.size as presentation.size',
                        'presentation.ext as presentation.ext',
                        'presentation.src as presentation.src',

                        'categories.id as category.id',
                        'categories.name as category.name',
                        'categories.parent_id as category.parent_id',
                        'parent_name as category.parent_name',

                        KnexService.raw('jsonb_agg(distinct "interior_models") as used_models')

                    ])
                        .from("interiors")
                        .as("interiors")
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
                        .leftJoin({ presentation: "files" }, { "interiors.presentation_id": "presentation.id" })
                        .leftJoin(function () {
                            this.select([
                                'interior_models.id',
                                'interior_models.model_id',
                                'interior_models.interior_id',

                                'model.* as model.*',
                                "product.id as product.id",
                                "product.title as product.title",
                                "product.cost_id as product.cost_id",
                                "product.is_free as product.is_free",
                                "product.slug as product.slug",

                                'cost.amount as product.cost.amount',

                                KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                            ])
                                .from('interior_models')
                                .as('interior_models')
                                .leftJoin({ model: "models" }, { 'interior_models.model_id': 'model.id' })

                                .leftJoin({ product: 'products' }, 'product.id', 'model.product_id')
                                .leftJoin({ cost: "costs" }, { "product.cost_id": "cost.id" })
                                .leftOuterJoin(function () {
                                    this.select([
                                        'model_images.id',
                                        'model_images.is_main',
                                        'model_images.image_id',
                                        'model_images.product_id',
                                        'model_images.created_at',
                                        // 'images.id as images.id',
                                        'images.src as image_src'
                                    ])
                                        .from('model_images')
                                        .as('model_images')
                                        .leftJoin("images", { 'model_images.image_id': 'images.id' })
                                        .groupBy('model_images.id', 'images.id')
                                        .orderBy(`model_images.created_at`, 'asc')
                                        .where('model_images.is_main', '=', true)
                                }, { 'product.id': 'model_images.product_id' })
                                .groupBy('interior_models.id', 'model.id', 'product.id', "cost.id")
                        }, { 'interiors.id': 'interior_models.interior_id' })

                        .groupBy(
                            'interiors.id',
                            'presentation.id',
                            'categories.id',
                            'categories.name',
                            'categories.parent_id',
                            'categories.parent_name'
                        )
                }, { "products.id": "interiors.product_id" })
                .leftJoin(function () {
                    this.select([
                        'model_images.id',
                        'model_images.product_id',
                        'model_images.created_at',
                        "image.id as image.id",
                        "image.src as image.src"
                    ])
                        .from('model_images')
                        .as('model_images')
                        .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                        .where('model_images.is_main', '=', false)
                        .groupBy('model_images.id', "image.id")
                }, { 'products.id': 'model_images.product_id' })
                .leftJoin(function () {
                    this.select([
                        'model_colors.id',
                        'model_colors.product_id',
                        'color.id as color.id',
                        'color.name as color.name',
                        'color.hex_value as color.hex_value',
                    ])
                        .from('model_colors')
                        .as('model_colors')
                        .leftJoin({ color: "colors" }, { 'model_colors.color_id': 'color.id' })
                        .groupBy('model_colors.id', 'color.id')
                }, { 'products.id': 'model_colors.product_id' })
                .leftJoin(function () {
                    this.select([
                        'models.product_id',
                        'models.id',
                        'models.length',
                        'models.width',
                        'models.yamo_id',
                        'models.height',
                        'models.polygons_count',
                        'models.vertices_count',
                        'models.brand_id',
                        'models.formfactor_id',
                        'models.category_id',

                        'brand.id as brand.id',
                        'brand.name as brand.name',

                        'formfactor.id as formfactor.id',
                        'formfactor.name as formfactor.name',

                        'categories.id as category.id',
                        'categories.name as category.name',
                        'categories.parent_id as category.parent_id',
                        'parent_name as category.parent_name',

                        KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                        KnexService.raw('jsonb_agg(distinct "interior_models") as used_interiors'),
                    ])
                        .from('models')
                        .as('models')
                        .leftJoin({ formfactor: "formfactors" }, { "models.formfactor_id": "formfactor.id" })
                        .leftJoin({ brand: "brands" }, { "models.brand_id": "brand.id" })
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
                                'model_materials.id',
                                'model_materials.model_id',
                                "material.id as material.id",
                                "material.name as material.name"
                                // KnexService.raw(`jsonb_agg(distinct "materials") as material`)
                            ])
                                .from('model_materials')
                                .leftJoin({ material: "materials" }, { 'model_materials.material_id': 'material.id' })
                                .groupBy('model_materials.id', "material.id")
                                .as('model_materials')
                        }, { 'models.id': 'model_materials.model_id' })
                        .leftJoin(function () {
                            this.select([
                                'interior_models.id',
                                'interior_models.model_id',
                                'interior_models.interior_id',

                                "interior.* as interior.*",
                                "product.id as product.id",
                                "product.title as product.title",
                                "product.cost_id as product.cost_id",
                                "product.is_free as product.is_free",
                                "product.slug as product.slug",

                                'cost.amount as product.cost.amount',

                                KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                            ])
                                .from('interior_models')
                                .as('interior_models')
                                .leftJoin({ interior: "interiors" }, { 'interior_models.interior_id': 'interior.id' })

                                .join({ product: 'products' }, 'product.id', 'interior.product_id')
                                .leftJoin({ cost: "costs" }, { "product.cost_id": "cost.id" })

                                .leftJoin(function () {
                                    this.select([
                                        'model_images.id',
                                        'model_images.is_main',
                                        'model_images.image_id',
                                        'model_images.product_id',
                                        'model_images.created_at',
                                        // 'images.id as images.id',
                                        'images.src as image_src'
                                    ])
                                        .from('model_images')
                                        .as('model_images')
                                        .leftJoin("images", { 'model_images.image_id': 'images.id' })
                                        .groupBy('model_images.id', 'images.id')
                                        .orderBy(`model_images.created_at`, 'asc')
                                        .where('model_images.is_main', '=', true)
                                }, { 'product.id': 'model_images.product_id' })
                                .groupBy('interior_models.id', 'interior.id', 'product.id', "cost.id")
                        }, { 'models.id': 'interior_models.model_id' })
                        .groupBy(
                            'models.id',
                            'formfactor.id',
                            'brand.id',
                            'categories.id',
                            'categories.name',
                            'categories.parent_id',
                            'categories.parent_name'
                        )
                }, { 'products.id': 'models.product_id' })

                .leftJoin(function () {
                    this.select([
                        'collections.*',
                        KnexService.raw('jsonb_agg(distinct "collection_products") as collection_products'),
                    ])
                        .from("collections")
                        .as("collections")
                        .leftJoin(function () {
                            this.select([
                                'collection_products.id',
                                'collection_products.collection_id',
                                'collection_products.product_id',
                                "products.id as product.id",
                                "products.title as product.title",
                                "products.description as product.description",
                                "products.file_id as product.file_id",
                                "products.cost_id as product.cost_id",
                                "products.style_id as product.style_id",
                                "products.slug as product.slug",
                                "products.views_count as product.views_count",
                                "products.is_deleted as product.is_deleted",
                                "products.created_at as product.created_at",

                                'cost.amount as product.cost.amount',
                                KnexService.raw('jsonb_agg(distinct "model_images") as images'),
                            ])
                                .from('collection_products')
                                .as('collection_products')
                                .join('products', 'products.id', 'collection_products.product_id')
                                .leftJoin({ cost: "costs" }, { "products.cost_id": "cost.id" })
                                .leftJoin(function () {
                                    this.select([
                                        'model_images.id',
                                        'model_images.is_main',
                                        'model_images.image_id',
                                        'model_images.product_id',
                                        'images.src as image_src'
                                    ])
                                        .from('model_images')
                                        .as('model_images')
                                        .leftJoin("images", { 'model_images.image_id': 'images.id' })
                                        .where('model_images.is_main', '=', true)
                                        .groupBy('model_images.id', 'images.id')
                                }, { 'products.id': 'model_images.product_id' })
                                .groupBy('collection_products.id', 'products.id', "cost.id")
                        }, { 'collections.id': 'collection_products.collection_id' })
                        .groupBy('collections.id')
                }, { 'products.id': 'collections.product_id' })

                .where("products.slug", slug)
                .groupBy(
                    'products.id',
                    "cost.id",
                    'style.id'
                )
        )
    }

    async deleteById(id: string) {
        return await KnexService('products')
            .where({ id: id })
            .delete()
    }
}