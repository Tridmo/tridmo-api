import { IDefaultQuery } from '../../shared/interface/query.interface';
import { getFirst } from "../../shared/utils/utils";
import { ICreateCollection, IUpdateCollection } from "../interface/collections.interface";
import KnexService from "../../../database/connection";

export default class CollectionsDAO {

    async create(data: ICreateCollection){
        return getFirst(
            await KnexService('collections')
                .insert({...data})
                .returning("*")
        )
    }

    async update(id: string, data: IUpdateCollection){
        return getFirst(
            await KnexService('collections')
                .update({...data})
                .where({id})
                .returning("*")
        )
    }

    async count() {
        return await KnexService('collections') 
        .count("collections.id") 
    }

    async getAll(keyword: string = "",
    sorts: IDefaultQuery, styles, colors) {
        const {limit, offset, order, orderBy} = sorts
        return await KnexService("collections")
        .select([
            'collections.*', 
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

            'cost.amount as products.cost.amount',

            KnexService.raw('jsonb_agg(distinct "product_images") as images')
        ])  
        .join('products', 'products.id', 'collections.product_id')
        .leftJoin({file: "files"}, {"products.file_id": "file.id"})
        .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"}) 
        .leftJoin( function () {
            this.select([
                'product_images.id',
                'product_images.is_main',
                'product_images.image_id',
                'product_images.product_id', 
                'images.src as image_src'
            ])
            .from('product_images')
            .as('product_images')
            .leftJoin("images", { 'product_images.image_id': 'images.id' })
            .where('product_images.is_main', '=', true)
            .groupBy('product_images.id', 'images.id')
        }, {'products.id':'product_images.product_id'})
        .limit(limit)
        .offset(offset)
        .orderBy(`collections.${orderBy}`, order)
        .groupBy('collections.id', 'products.id',  "cost.id", 'file.id')
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('collections')
            .select([
                'collections.*', 
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
                
                'file.id as products.file.id',
                'file.name as products.file.name',
                'file.size as products.file.size',
                'file.ext as products.file.ext',
                'file.src as products.file.src',
    
                'style.id as products.style.id',
                'style.name as products.style.name', 
    
                'cost.amount as products.cost.amount',

                'categories.id as products.categories.id',
                'categories.name as products.categories.name',
                'categories.parent_id as products.categories.parent_id',
                'parent_name as products.categories.parent_name',
    
                KnexService.raw('jsonb_agg(distinct "product_images") as images') ,
                KnexService.raw('jsonb_agg(distinct "collection_products") as collection_products') ,
                KnexService.raw('jsonb_agg(distinct "product_colors") as colors'), 
     
            ])  
            .join('products', 'products.id', 'collections.product_id')
            .leftJoin({style: "styles"}, {"products.style_id": "style.id"}) 
            .leftJoin({file: "files"}, {"products.file_id": "file.id"})
            .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"}) 
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
            }, {"collections.category_id": "categories.id"})
            .leftJoin( function () {
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
            .where('product_images.is_main', '=', false)
            // .select('product_images.*')
            .leftJoin(function () {
                    this.select([
                        'collection_products.id',
                        'collection_products.collection_id',
                        'collection_products.product_id',

                        // 'model.* as model.*',

                        
                        // 'brands.id as brand.id',
                        // 'brands.name as brand.name', 
                        "products.id as products.id",
                        "products.title as products.title",
                        "products.description as products.description",
                        "products.file_id as products.file_id",
                        "products.cost_id as products.cost_id",
                        "products.style_id as products.style_id", 
                        "products.slug as products.slug",
                        "products.views_count as products.views_count",
                        "products.is_deleted as products.is_deleted",
                        "products.created_at as products.created_at",
                        // KnexService.raw('jsonb_agg(distinct "model_materials") as materials'),
                    
                        
                        'file.id as products.file.id',
                        'file.name as products.file.name',
                        'file.size as products.file.size',
                        'file.ext as products.file.ext',
        
                        'style.id as products.style.id',
                        'style.name as products.style.name',

                        'cost.amount as products.cost.amount',
        
                        KnexService.raw('jsonb_agg(distinct "product_images") as images') , 
                    ])
                    .from('collection_products')
                    .as('collection_products')
                    // .leftJoin({model: "models"}, { 'collection_products.collection_id': 'model.id' })
                //     .leftJoin(function () {
                //         this.select([
                //             'model_materials.model_id',
                //             "materials.id as material.id",
                //             "materials.name as material.name"
                //         ])
                //         .from('model_materials')
                //         .as('model_materials')
                //         .leftJoin("materials", { 'model_materials.material_id': 'materials.id' })
                //         .groupBy('model_materials.id', "materials.id")
                // }, { 'model.id': 'model_materials.model_id' })
                
                // .leftJoin("brands", { 'model.brand_id': 'brands.id'})
                .join('products', 'products.id', 'collection_products.product_id')
                .leftJoin({style: "styles"}, {"products.style_id": "style.id"})
                
                .leftJoin({file: "files"}, {"products.file_id": "file.id"})
                .leftJoin({cost: "costs"}, {"products.cost_id": "cost.id"})
                // .leftJoin("formfactors", {"model.formfactor_id": "formfactors.id"})
                .leftJoin( function () {
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
                .where('product_images.is_main', '=', false)
                .groupBy('collection_products.id','products.id', "cost.id",
                'style.id', 'file.id' )
            }, { 'collections.id': 'collection_products.collection_id' })
     
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
            .groupBy('collections.id' ,  'products.id',  "cost.id",
            'style.id', 'file.id', 'categories.id', 
            'categories.name', 
            'categories.parent_id', 
            'categories.parent_name' ) 
            .where({'collections.id': id})
        )
    }
    
    async getByProductId(id: string) {
        return getFirst (
            await KnexService('collections')
            .select('*')
            .where({product_id: id})
        )
    }
    
    async deleteByProduct(product_id: string) {
        return await KnexService('collections')
            .where({product_id})
            .delete()
    }
    
    async deleteById(id: string) {
        return await KnexService('collections')
            .where({id: id})
            .delete()
    }
}