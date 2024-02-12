import KnexService from '../../../../database/connection';
import { getFirst } from "../../../shared/utils/utils";
import { ICreateOrderItem } from "../interface/order_items.interface";

export default class OrderItemsDAO {
    async create({cost_amount, product_id, order_id}: ICreateOrderItem) {
        return getFirst(
            await KnexService('order_items')
            .insert({
                cost_amount,
                product_id,
                order_id
            })
            .returning("*")
        )
    }

    async getByOrderId(order_id: string) {        
        return await KnexService('order_items')
            .select("*")
            .where({order_id})
    }

    async getByProductId(product_id: string) {        
        return await KnexService('order_items')
            .select("*")
            .where({product_id})
    }

    async getByProductIdAndOrderId(product_id: string, order_id: string) {        
        return getFirst(
            await KnexService('order_items')
                .select("*")
                .where({product_id, order_id})
        )
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('order_items')
            .where({id: id})
        )
    }

    async deleteById(id: string) {
        return await KnexService('order_items')
            .where({id: id})
            .delete()
    }


    async deleteByProduct(product_id: string) {
        return await KnexService('order_items')
            .where({product_id})
            .delete()
    }

    async getPurchasedItems(user_id: string) {  
        return await KnexService('order_items')
            .select([
                    "order_items.id",
                    "order_items.product_id", 
                    "order_items.order_id", 
                    'transaction_order_id as transaction_order_id',
                    'transaction_id as transaction_id'
            ]) 
            .innerJoin(function () {
                this.select([
                    'orders.id',
                    'orders.user_id',
                    'orders.status',
                    'transaction.id as transaction_id',
                    'transaction.order_id as transaction_order_id',
                ])
                .from('orders')
                .where({
                    'orders.user_id': user_id,
                    'orders.status': 2
                })
                .innerJoin({transaction: "transactions"}, { 'transaction.order_id': 'orders.id' })
                .groupBy('orders.id', "transaction.id")
                .as('orders')
            }, { 'orders.id': 'order_items.order_id' })
            .groupBy("order_items.id", 'transaction_order_id', 'transaction_id')
    }
}