import { IDefaultQuery } from './../../../modules/shared/interface/query.interface';
import { getFirst } from "../../shared/utils/utils";
import { ICreateModel, IGetModelsQuery, IUpdateModel } from "../interface/models.interface";
import KnexService from "../../../database/connection";

export default class ModelsDAO {

    async create(data: ICreateModel){
        return getFirst(
            await KnexService('models')
                .insert({...data})
                .returning("*")
        )
    }

    async update(modelId: string, values: IUpdateModel) {
        return getFirst(
            await KnexService('models')
            .where({id: modelId})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async updateByBrand(brand_id: number, values) {
        return getFirst(
            await KnexService('models')
            .where({brand_id})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async count(keyword: string = "",
    filters,
    categories, 
    styles, 
    colors) {  
        return await KnexService('models')
        // .select([
        //     'models.*',  
        //     "products.id as products.id",
        //     "products.title as products.title", 
        //     "products.cost_id as products.cost_id",
        //     "products.style_id as products.style_id",
        //     "products.is_free as products.is_free",
        //     // "products.category_id as products.category_id", 
        //     "products.is_deleted as products.is_deleted",
             
        // ])
        // .from("models")
        // .as("models")
        .countDistinct("models.id")
        .innerJoin(function () {
            this.select(['product_colors.product_id'])
            .from('product_colors')
            .whereIn("color_id", colors)
            .groupBy('product_colors.id')
            .as('product_colors')
        }, { 'models.product_id': 'product_colors.product_id' })
        .join('products', 'products.id', 'models.product_id') 
        // .as('products')
        // .from('products')
        .whereIn("models.category_id", categories)
        .whereIn("products.style_id", styles)
        .whereILike('products.title', `%${keyword}%`)  
        .andWhere(filters) 
        .where({is_deleted: false})
    }

    async getAll(keyword: string = "", 
    filters: IGetModelsQuery, 
    sorts: IDefaultQuery,
    categories, 
    styles, 
    colors) {
        const {limit, offset, order, orderBy} = sorts 
        
        return await KnexService("models")
        .select([
            'models.*',
            "models.category_id as products.category_id",
            'brands.id as brand.id',
            'brands.name as brand.name', 
            "products.id as products.id",
            "products.title as products.title",
            "products.description as products.description",
            "products.file_id as products.file_id",
            "products.cost_id as products.cost_id",
            "products.style_id as products.style_id",
            "products.is_free as products.is_free",
            "products.slug as products.slug",
            "products.file_exists as products.file_exists",
            "products.views_count as products.views_count",
            "products.is_deleted as products.is_deleted",
            "products.created_at as products.created_at",
            KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
            
            'file.id as products.file.id',
            'file.name as products.file.name',
            'file.size as products.file.size',
            'file.ext as products.file.ext',

            'style.id as products.style.id',
            'style.name as products.style.name',

            'category.id as products.category.id',
            'category.name as products.category.name',
            'category.type as products.category.type',
            'category.description as products.category.description',
            'category.parent_id as products.category.parent_id',
            'category.type as products.category.type',

            'cost.amount as products.cost.amount',

            KnexService.raw('jsonb_agg(distinct "product_images") as images') ,
            // KnexService.raw('jsonb_agg(distinct "product_colors") as colors'), 
 
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
        
        .leftJoin("brands", { 'models.brand_id': 'brands.id'})
        .join('products', 'products.id', 'models.product_id')
        .leftJoin({style: "styles"}, {"products.style_id": "style.id"})
        .leftJoin({category: "categories"}, {"models.category_id": "category.id"})
        .leftJoin({file: "files"}, {"products.file_id": "file.id"})
        .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"})
        .leftJoin("formfactors", {"models.formfactor_id": "formfactors.id"})
        .innerJoin( function () {
            this.select([
                'product_images.id',
                'product_images.is_main',
                'product_images.image_id',
                'product_images.product_id', 
                // 'images.id as images.id',
                'images.src as image_src'
            ])
            .from('product_images')
            .as('product_images')
            .leftJoin("images", { 'product_images.image_id': 'images.id' })
            .groupBy('product_images.id', 'images.id')
        }, {'products.id':'product_images.product_id'}) 
        .where('product_images.is_main', '=', true) 
        .innerJoin(function () {
            this.select([
                'product_colors.id',
                'product_colors.product_id',
                'product_colors.color_id',
                'color.id as color.id', 
                'color.name as color.name', 
                'color.hex_value as color.hex_value', 
            ])
            .whereIn("color_id", colors)
            .from('product_colors')
            .as('product_colors')
            .innerJoin({color: "colors"}, { 'product_colors.color_id': 'color.id' })
            .groupBy('product_colors.id', 'color.id')
        }, { 'products.id': 'product_colors.product_id' })
        .limit(limit)
        .offset(offset)
        .whereIn("category_id", categories)
        .whereIn("products.style_id", styles)
        .where({is_deleted: false})
        .andWhere(filters)
        .orderBy(`models.${orderBy}`, order)
        .groupBy('models.id', 'brands.id', 'formfactors.id', 'products.id',  "cost.id",
        'style.id', 'file.id', 'category.id')
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('models')
            .select([
                'models.*',
                "models.category_id as products.category_id",
                'brands.id as brand.id',
                'brands.name as brand.name', 
                "products.id as products.id",
                "products.title as products.title",
                "products.description as products.description",
                "products.file_id as products.file_id",
                "products.cost_id as products.cost_id",
                "products.style_id as products.style_id",
                // "products.category_id as products.category_id",
                "products.slug as products.slug",
                "products.is_free as products.is_free",
                "products.views_count as products.views_count",
                "products.is_deleted as products.is_deleted",
                "products.created_at as products.created_at",
                KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                
                'file.id as products.file.id',
                'file.name as products.file.name',
                'file.size as products.file.size',
                'file.ext as products.file.ext',
                'file.src as products.file.src',
    
                'style.id as products.style.id',
                'style.name as products.style.name',
    
                'categories.id as products.categories.id',
                'categories.name as products.categories.name',
                // 'categories.description as products.categories.description',
                'categories.parent_id as products.categories.parent_id',
                'parent_name as products.categories.parent_name',
    
                'cost.amount as products.cost.amount',
    
                KnexService.raw('jsonb_agg(distinct "product_images") as images') ,
                KnexService.raw('jsonb_agg(distinct "interior_models") as interior_models') ,
                KnexService.raw('jsonb_agg(distinct "product_colors") as colors'), 
     
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
            
            .leftJoin("brands", { 'models.brand_id': 'brands.id'})
            .join('products', 'products.id', 'models.product_id')
            .leftJoin({style: "styles"}, {"products.style_id": "style.id"})
            // .leftJoin({category: "categories"}, {"products.category_id": "category.id"})
            .leftJoin(function(){
                this.select([
                    "categories.id",
                    "categories.name",
                    "categories.parent_id",
                    "parent.name as parent_name"
                ])
                .leftJoin({parent: "categories"}, {"categories.parent_id": "parent.id"})
                .from("categories")
                .as("categories")
                .groupBy("categories.id", "parent.id")
            }, {"models.category_id": "categories.id"})
            .leftJoin({file: "files"}, {"products.file_id": "file.id"})
            .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"})
            .leftJoin("formfactors", {"models.formfactor_id": "formfactors.id"})
            ///
            .leftJoin(function () {
                this.select([
                    'interior_models.id',
                    'interior_models.model_id',
                    'interior_models.interior_id',

                    "product.id as product.id",
                    "product.title as product.title",
                    "product.cost_id as product.cost_id",
                    "product.is_free as product.is_free",

                    'cost.amount as product.cost.amount',
    
                    KnexService.raw('jsonb_agg(distinct "product_images") as images') , 
                ])
                .from('interior_models')
                .as('interior_models')
                .leftJoin({interior: "interiors"}, { 'interior_models.interior_id': 'interior.id' })
  
            .join({product: 'products'}, 'product.id', 'interior.product_id')
            .leftJoin({cost: "costs"}, {"product.cost_id": "cost.id"})

            .leftJoin( function () {
                this.select([
                    'product_images.id',
                    'product_images.is_main',
                    'product_images.image_id',
                    'product_images.product_id', 
                    'product_images.created_at', 
                    // 'images.id as images.id',
                    'images.src as image_src'
                ])
                .from('product_images')
                .as('product_images')
                .leftJoin("images", { 'product_images.image_id': 'images.id' })
                .groupBy('product_images.id', 'images.id')
                .orderBy(`product_images.created_at`, 'asc')
            }, {'product.id':'product_images.product_id'}) 
            .where('product_images.is_main', '=', true)
            .groupBy('interior_models.id', 'interior.id', 'product.id', "cost.id")
            }, { 'models.id': 'interior_models.model_id' })
            ///
            .innerJoin( function () {
                this.select([
                    'product_images.id',
                    'product_images.is_main',
                    'product_images.image_id',
                    'product_images.product_id', 
                    'product_images.created_at', 

                    // 'images.id as images.id',
                    'images.src as image_src'
                ])
                .from('product_images')
                .as('product_images')
                .leftJoin("images", { 'product_images.image_id': 'images.id' })
                .groupBy('product_images.id', 'images.id')
                .orderBy(`product_images.created_at`, 'asc')
            }, {'products.id':'product_images.product_id'}) 
            .where('product_images.is_main', '=', false)
            // .select('product_images.*')
     
            .leftJoin(function () {
                this.select([
                    'product_colors.id',
                    'product_colors.product_id',
                    'color.id as color.id', 
                    'color.name as color.name', 
                    'color.hex_value as color.hex_value', 
                ])
                .from('product_colors')
                .as('product_colors')
                .leftJoin({color: "colors"}, { 'product_colors.color_id': 'color.id' })
                .groupBy('product_colors.id', 'color.id')
            }, { 'products.id': 'product_colors.product_id' })
            .groupBy('models.id', 'brands.id', 'formfactors.id', 'products.id',  "cost.id",
            'style.id', 'file.id', 'categories.id', 
            'categories.name', 
            'categories.parent_id', 
            'categories.parent_name')
           
            .where({'models.id': id})
        )
    }

    async getBySlug(slug: string) {
        return getFirst(
            await KnexService('models')
            .select([
                'models.*',
                "models.category_id as products.category_id",
                'brands.id as brand.id',
                'brands.name as brand.name', 
                "products.id as products.id",
                "products.title as products.title",
                "products.description as products.description",
                "products.file_id as products.file_id",
                "products.cost_id as products.cost_id",
                "products.style_id as products.style_id",
                // "products.category_id as products.category_id",
                "products.slug as products.slug",
                "products.is_free as products.is_free",
                "products.views_count as products.views_count",
                "products.is_deleted as products.is_deleted",
                "products.created_at as products.created_at",
                KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                
                'file.id as products.file.id',
                'file.name as products.file.name',
                'file.size as products.file.size',
                'file.ext as products.file.ext',
                'file.src as products.file.src',
    
                'style.id as products.style.id',
                'style.name as products.style.name',
    
                'categories.id as products.categories.id',
                'categories.name as products.categories.name',
                // 'categories.description as products.categories.description',
                'categories.parent_id as products.categories.parent_id',
                'parent_name as products.categories.parent_name',
    
                'cost.amount as products.cost.amount',
    
                KnexService.raw('jsonb_agg(distinct "product_images") as images') ,
                KnexService.raw('jsonb_agg(distinct "interior_models") as interior_models') ,
                KnexService.raw('jsonb_agg(distinct "product_colors") as colors'), 
     
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
            
            .leftJoin("brands", { 'models.brand_id': 'brands.id'})
            .leftJoin({style: "styles"}, {"products.style_id": "style.id"})
            .innerJoin(function() {
                this.select("*")
                .from("products")
                .as("products")
                .where({"products.slug": slug})
                }, {'products.id': 'models.product_id'})
            // .leftJoin({category: "categories"}, {"products.category_id": "category.id"})
            .leftJoin(function(){
                this.select([
                    "categories.id",
                    "categories.name",
                    "categories.parent_id",
                    "parent.name as parent_name"
                ])
                .leftJoin({parent: "categories"}, {"categories.parent_id": "parent.id"})
                .from("categories")
                .as("categories")
                .groupBy("categories.id", "parent.id")
            }, {"models.category_id": "categories.id"})
            .leftJoin({file: "files"}, {"products.file_id": "file.id"})
            .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"})
            .leftJoin("formfactors", {"models.formfactor_id": "formfactors.id"})
            ///
            .leftJoin(function () {
                this.select([
                    'interior_models.id',
                    'interior_models.model_id',
                    'interior_models.interior_id',

                    "product.id as product.id",
                    "product.title as product.title",
                    "product.cost_id as product.cost_id",
                    "product.is_free as product.is_free",

                    'cost.amount as product.cost.amount',
    
                    KnexService.raw('jsonb_agg(distinct "product_images") as images') , 
                ])
                .from('interior_models')
                .as('interior_models')
                .leftJoin({interior: "interiors"}, { 'interior_models.interior_id': 'interior.id' })
  
            .join({product: 'products'}, 'product.id', 'interior.product_id')
            .leftJoin({cost: "costs"}, {"product.cost_id": "cost.id"})

            .leftJoin( function () {
                this.select([
                    'product_images.id',
                    'product_images.is_main',
                    'product_images.image_id',
                    'product_images.product_id', 
                    'product_images.created_at', 
                    // 'images.id as images.id',
                    'images.src as image_src'
                ])
                .from('product_images')
                .as('product_images')
                .leftJoin("images", { 'product_images.image_id': 'images.id' })
                .groupBy('product_images.id', 'images.id')
                .orderBy(`product_images.created_at`, 'asc')
            }, {'product.id':'product_images.product_id'}) 
            .where('product_images.is_main', '=', true)
            .groupBy('interior_models.id', 'interior.id', 'product.id', "cost.id")
            }, { 'models.id': 'interior_models.model_id' })
            ///
            .innerJoin( function () {
                this.select([
                    'product_images.id',
                    'product_images.is_main',
                    'product_images.image_id',
                    'product_images.product_id', 
                    'product_images.created_at', 

                    // 'images.id as images.id',
                    'images.src as image_src'
                ])
                .from('product_images')
                .as('product_images')
                .leftJoin("images", { 'product_images.image_id': 'images.id' })
                .groupBy('product_images.id', 'images.id')
                .orderBy(`product_images.created_at`, 'asc')
            }, {'products.id':'product_images.product_id'}) 
            .where('product_images.is_main', '=', false)
            // .select('product_images.*')
     
            .leftJoin(function () {
                this.select([
                    'product_colors.id',
                    'product_colors.product_id',
                    'color.id as color.id', 
                    'color.name as color.name', 
                    'color.hex_value as color.hex_value', 
                ])
                .from('product_colors')
                .as('product_colors')
                .leftJoin({color: "colors"}, { 'product_colors.color_id': 'color.id' })
                .groupBy('product_colors.id', 'color.id')
            }, { 'products.id': 'product_colors.product_id' })
            .groupBy('models.id', 'brands.id', 'formfactors.id', 'products.id',  "cost.id",
            'style.id', 'file.id', 'categories.id', 
            'categories.name', 
            'categories.parent_id', 
            'categories.parent_name')
        )
    }
    
    async getByProductId(id: string) {
        return getFirst (
            await KnexService('models')
            .select('*')
            .where({product_id: id})
        )
    }

    async getByFilters(filters) {
        return getFirst( 
         await KnexService('models')
            .select([
              "models.*",
              "products.id as products.id",
              "products.title as products.title",
              "products.description as products.description",
              "products.file_id as products.file_id",
              "products.cost_id as products.cost_id",
              "products.style_id as products.style_id",
              "products.slug as products.slug",
              "products.is_free as products.is_free",
              "images as products.images"
            ])
            .innerJoin(function() {
              this.select(
                "products.*",
                KnexService.raw(`jsonb_agg(distinct "product_images") as images`)
                )
              .from("products")
              .as("products")
              .leftJoin( function () {
                this.select([
                    'product_images.id',
                    'product_images.is_main',
                    'product_images.image_id',
                    'product_images.product_id', 
                    'product_images.created_at', 
                    'images.src as image_src'
                ])
                .from('product_images')
                .as('product_images')
                .leftJoin("images", { 'product_images.image_id': 'images.id' })
                .groupBy('product_images.id', 'images.id')
                .where({'is_main': true})
              }, {'products.id':'product_images.product_id'}) 
              .groupBy('products.id')
            }, {'products.id': 'models.product_id'})
            .where(filters)
         )
    }

    async getByProductTitle(title: string) {

      return await KnexService('models')
        .select([
          "models.*",
          "products.id as products.id",
          "products.title as products.title",
          "products.description as products.description",
          "products.file_id as products.file_id",
          "products.cost_id as products.cost_id",
          "products.style_id as products.style_id",
          "products.slug as products.slug",
          "products.is_free as products.is_free",
          "images as products.images",
        ])
        .innerJoin(function() {
          this.select(
            "products.*",
            KnexService.raw(`jsonb_agg(distinct "product_images") as images`)
            )
          .from("products")
          .as("products")
          .leftJoin( function () {
            this.select([
                'product_images.id',
                'product_images.is_main',
                'product_images.image_id',
                'product_images.product_id', 
                'product_images.created_at', 
                'images.src as image_src'
            ])
            .from('product_images')
            .as('product_images')
            .leftJoin("images", { 'product_images.image_id': 'images.id' })
            .groupBy('product_images.id', 'images.id')
            .where({'is_main': true})
          }, {'products.id':'product_images.product_id'}) 
          .groupBy('products.id')
          .whereILike('products.title', `%${title}%`)
        }, {'products.id': 'models.product_id'})
    }
    
    async deleteById(modelId: string) {
        return await KnexService('models')
            .where({id: modelId})
            .delete()
    }
 
}