import KnexService from "../../../database/connection";
import { getFirst } from "../../shared/utils/utils";
import { ICreateTransaction, ITransaction } from "../interface/transactions.interface";

export default class TransactionsDAO {
    async create({
        id,
        user_id,
        order_id,
        payment_product_id,
        customer_first_name,
        customer_last_name,
        customer_email,
        organization,
        income,
        tax_amount,
        tax_rate,
        total_amount,
        currency,
        country,
        event_id,
        transaction_type
    }: ICreateTransaction): Promise<ITransaction>{
        return getFirst(
            await KnexService("transactions")
            .insert({
                id,
                user_id,
                order_id,
                payment_product_id,
                customer_first_name,
                customer_last_name,
                customer_email,
                organization,
                income,
                tax_amount,
                tax_rate,
                total_amount,
                currency,
                country,
                event_id,
                transaction_type
            })
            .returning('*')
        )
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('transactions')
            .select(
              'transactions.id',
              'transactions.user_id',
              'transactions.total_amount',
              'transactions.order_id',
              'transactions.currency' ,
              KnexService.raw(`
                json_build_object(
                  'id', orders.id,
                  'total_cost_amount', orders.total_cost_amount,
                  'created_at', orders.created_at,
                  'items', items
                ) as order
              `)
            ).innerJoin(function () {
                this.select([ 
                    "orders.id",
                    "orders.total_cost_amount",
                    "orders.created_at",
                    KnexService.raw(`jsonb_agg(distinct "order_items") as items`)
                ])
                .from('orders')
                .as('orders')
                .leftJoin(function () {
                    this.select([
                        'order_items.id', 
                        'order_items.order_id',
                        'order_items.cost_amount',
                        // KnexService.raw(`cast (order_items.cost_amount as decimal(10,2))`),
                        'products.id as product.id',   
                        'products.title as product.title',
                        'products.description as product.description',
                        'style_name as product.style.name',
                        'category_name as product.category.name', 
                        'file_src as product.file.src', 
                        'cover as product.cover'
                    ])
                    .from('order_items')
                    .as('order_items')
                    .leftJoin(function(){
                        this.select([
                            'products.id', 
                            'model.category_id', 
                            'products.title', 
                            'products.description',
                            'style.name as style_name', 
                            'categories.name as category_name',
                            'file.src as file_src',
                            KnexService.raw('jsonb_agg(distinct "product_images") as cover'),
                        ])
                        .leftJoin({style: "styles"}, {"products.style_id": "style.id"}) 
                        .leftJoin({model: "models"}, {"products.id": "model.product_id"}) 

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
                        }, {"model.category_id": "categories.id"})
                        .leftJoin({file: "files"}, {"products.file_id": "file.id"}) 
                        .leftJoin(function () {
                            this.select([
                                'product_images.product_id',
                                "image.src as image.src"
                            ])
                            .from('product_images')
                            .where({is_main: true})
                            .leftJoin({image: "images"}, { 'product_images.image_id': 'image.id' })
                            .groupBy('product_images.id', "image.id")
                            .as('product_images')
                        }, { 'products.id': 'product_images.product_id' })
                        .from('products')
                        .as('products')
                        .groupBy("products.id", 'style.name', 'categories.name', 'file.src', 'model.category_id')
                    }, { 'order_items.product_id': 'products.id' })
                    .groupBy('order_items.id', 'products.id', 'products.title', 'products.cover', 'products.style_name', 'products.category_name', 'products.description', 'products.file_src')
                    }, { 'orders.id': 'order_items.order_id' })  
                .groupBy("orders.id")
            }, { 'orders.id': 'transactions.order_id' })
            .groupBy('transactions.id', 'orders.id', "orders.total_cost_amount",
            "orders.created_at",
            "orders.items")
            .where({'transactions.id': id})
        )
    }  
    
    async update(id: string, values) {
        return getFirst(
            await KnexService('transactions')
            .where({id: id})
            .update({
                ...values
            })
            .returning("*")
        )
    }
}