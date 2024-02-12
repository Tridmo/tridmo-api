import { IDefaultQuery } from './../../shared/interface/query.interface';
import { getFirst } from "../../shared/utils/utils";
import { ICreateInterior, IUpdateInterior } from "../interface/interiors.interface";
import KnexService from "../../../database/connection";

export default class InteriorsDAO {

    async create(data: ICreateInterior){
        return getFirst(
            await KnexService('interiors')
                .insert({...data})
                .returning("*")
        )
    }

    async update(id: string, {category_id}: IUpdateInterior){
        return getFirst(
            await KnexService('interiors')
                .update({category_id})
                .where({id})
                .returning("*")
        )
    }

    async count(keyword: string = "",
    filters,
    categories, 
    styles, 
    colors) {
        return await KnexService('interiors')
        // .select([
        //     'interiors.id', 
        //     'interiors.product_id', 
        //     "products.id as products.id",
        //     "products.title as products.title", 
        //     "products.cost_id as products.cost_id",
        //     "products.is_free as products.is_free",
        //     "products.style_id as products.style_id",  
        //     "products.is_deleted as products.is_deleted", 
        // ])
        // .from("interiors")
        // .as("interiors")
        .countDistinct("interiors.id")
        .innerJoin(function () {
            this.select(['product_colors.product_id'])
            .from('product_colors')
            .whereIn("color_id", colors)
            // .groupBy('product_colors.id')
            .as('product_colors')
        }, { 'interiors.product_id': 'product_colors.product_id' })
        .join('products', 'products.id', 'interiors.product_id') 
        // .as('products')
        // .from('products') 
        .whereIn("interiors.category_id", categories)
        .whereIn("products.style_id", styles)
        .whereILike('products.title', `%${keyword}%`) 
        .andWhere(filters) 
        .where({is_deleted: false})
    }

    async getAll(keyword: string = "",
    sorts: IDefaultQuery,categories, styles, colors, filters) { 
        const {limit, offset, order, orderBy} = sorts
        return await KnexService("interiors")
        .select([
            'interiors.*', 
            "interiors.category_id as products.category_id",
            "products.id as products.id",
            "products.title as products.title",
            "products.description as products.description",
            "products.file_id as products.file_id",
            "products.cost_id as products.cost_id",
            "products.is_free as products.is_free",
            "products.style_id as products.style_id", 
            "products.slug as products.slug",
            "products.file_exists as products.file_exists",
            "products.views_count as products.views_count",
            "products.is_deleted as products.is_deleted",
            "products.created_at as products.created_at", 
            
            'file.id as products.file.id',
            'file.name as products.file.name',
            'file.size as products.file.size',
            'file.ext as products.file.ext',

            'presentation.id as presentation.id',
            'presentation.name as presentation.name',
            'presentation.size as presentation.size',
            'presentation.ext as presentation.ext',
            'presentation.src as presentation.src',

            'category.id as products.category.id',
            'category.name as products.category.name',
            'category.description as products.category.description',
            'category.parent_id as products.category.parent_id',
            'category.type as products.category.type',

            'style.id as products.style.id',
            'style.name as products.style.name', 

            'cost.amount as products.cost.amount',

            KnexService.raw('jsonb_agg(distinct "product_images") as images') , 

            KnexService.raw('jsonb_agg(distinct "product_colors") as colors'), 
 
        ])  
        .join('products', 'products.id', 'interiors.product_id')
        .leftJoin({style: "styles"}, {"products.style_id": "style.id"}) 
        .leftJoin({presentation: "files"}, {"interiors.presentation_id": "presentation.id"}) 
        .leftJoin({file: "files"}, {"products.file_id": "file.id"})
        .leftJoin({category: "categories"}, {"interiors.category_id": "category.id"})
        .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"}) 
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
                'color.id as color.id', 
                'color.name as color.name', 
                'color.hex_value as color.hex_value', 
            ])
            .whereIn("color_id", colors)
            .from('product_colors')
            .as('product_colors')
            .leftJoin({color: "colors"}, { 'product_colors.color_id': 'color.id' })
            .groupBy('product_colors.id', 'color.id')
        }, { 'products.id': 'product_colors.product_id' }) 
        .limit(limit)
        .offset(offset)
        .orderBy(`interiors.${orderBy}`, order) 
        .where({is_deleted: false})
        .whereIn("products.style_id", styles)   
        .whereIn("category_id", categories)
        .andWhere(filters)       
        .groupBy('interiors.id', 'products.id',  "cost.id",
        'style.id', 'file.id', 'presentation.id', 'category.id' )
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('interiors')
            .select([
                'interiors.*', 
                "interiors.category_id as products.category_id",
                "products.id as products.id",
                "products.title as products.title",
                "products.description as products.description",
                "products.file_id as products.file_id",
                "products.cost_id as products.cost_id",
                "products.style_id as products.style_id", 
                "products.is_free as products.is_free",
                "products.slug as products.slug",
                "products.views_count as products.views_count",
                "products.is_deleted as products.is_deleted",
                "products.created_at as products.created_at", 

                'presentation.id as presentation.id',
                'presentation.name as presentation.name',
                'presentation.size as presentation.size',
                'presentation.ext as presentation.ext',
                'presentation.src as presentation.src',
                
                'file.id as products.file.id',
                'file.name as products.file.name',
                'file.size as products.file.size',
                'file.ext as products.file.ext',
                'file.src as products.file.src',

                'categories.id as products.categories.id',
                'categories.name as products.categories.name',
                // 'categories.description as products.categories.description',
                'categories.parent_id as products.categories.parent_id',
                'parent_name as products.categories.parent_name',
    
                'style.id as products.style.id',
                'style.name as products.style.name', 
    
                'cost.amount as products.cost.amount',
    
                KnexService.raw('jsonb_agg(distinct "product_images") as images') ,
                KnexService.raw('jsonb_agg(distinct "interior_models") as interior_models') ,
                KnexService.raw('jsonb_agg(distinct "product_colors") as colors'), 
     
            ])  

            .join('products', 'products.id', 'interiors.product_id')
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
            }, {"interiors.category_id": "categories.id"})
            .leftJoin({style: "styles"}, {"products.style_id": "style.id"}) 
            .leftJoin({presentation: "files"}, {"interiors.presentation_id": "presentation.id"}) 
            .leftJoin({file: "files"}, {"products.file_id": "file.id"})
            .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"}) 
           
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
                .orderBy(`product_images.created_at`, 'asc')
                .leftJoin("images", { 'product_images.image_id': 'images.id' })
                .groupBy('product_images.id', 'images.id')
                .orderBy(`product_images.created_at`, 'asc')
            }, {'products.id':'product_images.product_id'})  
            .where('product_images.is_main', '=', false)
            // .select('product_images.*')
            .leftJoin(function () {
                this.select([
                    'interior_models.id',
                    'interior_models.model_id',
                    'interior_models.interior_id',

                    'model.* as model.*',

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

                    'cost.amount as products.cost.amount',
    
                KnexService.raw('jsonb_agg(distinct "product_images") as images') , 
                ])
                .from('interior_models')
                .as('interior_models')
                .leftJoin({model: "models"}, { 'interior_models.model_id': 'model.id' })
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
            }, { 'model.id': 'model_materials.model_id' })
            
            .leftJoin("brands", { 'model.brand_id': 'brands.id'})
            .join('products', 'products.id', 'model.product_id')
            .leftJoin({style: "styles"}, {"products.style_id": "style.id"})
             
            .leftJoin({file: "files"}, {"products.file_id": "file.id"})
            .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"})
            .leftJoin("formfactors", {"model.formfactor_id": "formfactors.id"})
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
            }, {'products.id':'product_images.product_id'}) 
            .where('product_images.is_main', '=', true)
            .groupBy('interior_models.id', 'model.id', 'brands.id','products.id', "cost.id",
            'style.id', 'file.id',  )
            }, { 'interiors.id': 'interior_models.interior_id' })
     
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
            .groupBy('interiors.id' ,  'products.id',  "cost.id",
            'style.id', 'file.id', 'presentation.id', 'categories.id', 
            'categories.name', 
            'categories.parent_id', 
            'categories.parent_name'  )
        
            .where({'interiors.id': id})
        )
    }

    async getBySlug(slug: string) {
        return getFirst(
            await KnexService('interiors')
            .select([
                'interiors.*', 
                "interiors.category_id as products.category_id",
                "products.id as products.id",
                "products.title as products.title",
                "products.description as products.description",
                "products.file_id as products.file_id",
                "products.cost_id as products.cost_id",
                "products.style_id as products.style_id", 
                "products.is_free as products.is_free",
                "products.slug as products.slug",
                "products.views_count as products.views_count",
                "products.is_deleted as products.is_deleted",
                "products.created_at as products.created_at", 

                'presentation.id as presentation.id',
                'presentation.name as presentation.name',
                'presentation.size as presentation.size',
                'presentation.ext as presentation.ext',
                'presentation.src as presentation.src',

                'categories.id as products.categories.id',
                'categories.name as products.categories.name',
                // 'categories.description as products.categories.description',
                'categories.parent_id as products.categories.parent_id',
                'parent_name as products.categories.parent_name',
    
                'style.id as products.style.id',
                'style.name as products.style.name', 
    
                'cost.amount as products.cost.amount',
    
                KnexService.raw('jsonb_agg(distinct "product_images") as images') ,
                KnexService.raw('jsonb_agg(distinct "interior_models") as interior_models') ,
                KnexService.raw('jsonb_agg(distinct "product_colors") as colors'), 
     
            ])  

            .innerJoin(function() {
                this.select("*")
                .from("products")
                .as("products")
                .where({"products.slug": slug})
                }, {'products.id': 'interiors.product_id'})
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
            }, {"interiors.category_id": "categories.id"})
            .leftJoin({style: "styles"}, {"products.style_id": "style.id"}) 
            .leftJoin({presentation: "files"}, {"interiors.presentation_id": "presentation.id"})
            .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"}) 
           
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
                .orderBy(`product_images.created_at`, 'asc')
                .leftJoin("images", { 'product_images.image_id': 'images.id' })
                .groupBy('product_images.id', 'images.id')
                .orderBy(`product_images.created_at`, 'asc')
            }, {'products.id':'product_images.product_id'})  
            .where('product_images.is_main', '=', false)
            // .select('product_images.*')
            .leftJoin(function () {
                this.select([
                    'interior_models.id',
                    'interior_models.model_id',
                    'interior_models.interior_id',

                    'model.* as model.*',

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
                    "products.views_count as products.views_count",
                    "products.is_deleted as products.is_deleted",
                    "products.created_at as products.created_at",
                    KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
    
                    'style.id as products.style.id',
                    'style.name as products.style.name',

                    'cost.amount as products.cost.amount',
    
                KnexService.raw('jsonb_agg(distinct "product_images") as images') , 
                ])
                .from('interior_models')
                .as('interior_models')
                .leftJoin({model: "models"}, { 'interior_models.model_id': 'model.id' })
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
            }, { 'model.id': 'model_materials.model_id' })
            
            .leftJoin("brands", { 'model.brand_id': 'brands.id'})
            .join('products', 'products.id', 'model.product_id')
            .leftJoin({style: "styles"}, {"products.style_id": "style.id"})
             
            .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"})
            .leftJoin("formfactors", {"model.formfactor_id": "formfactors.id"})
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
            }, {'products.id':'product_images.product_id'}) 
            .where('product_images.is_main', '=', true)
            .groupBy('interior_models.id', 'model.id', 'brands.id','products.id', "cost.id",
            'style.id' )
            }, { 'interiors.id': 'interior_models.interior_id' })
     
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
            .groupBy('interiors.id' ,  'products.id',  "cost.id",
            'style.id', 'presentation.id', 'categories.id', 
            'categories.name', 
            'categories.parent_id', 
            'categories.parent_name'  )
        )
    }
    
    async getByProductId(id: string) {
        return getFirst (
            await KnexService('interiors')
            .select('*')
            .where({product_id: id})
        )
    }
    
    async deleteById(id: string) {
        return await KnexService('interiors')
            .where({id: id})
            .delete()
    }
}