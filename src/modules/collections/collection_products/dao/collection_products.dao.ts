import { getFirst } from "../../../shared/utils/utils";
import KnexService from '../../../../database/connection';
import { ICreateCollectionProduct } from "../interface/collection_products.interface";

export default class CollectionProductsDao {
    async create({product_id, collection_id}: ICreateCollectionProduct){
        return getFirst(
            await KnexService("collection_products")
                .insert({
                    product_id,
                    collection_id
                })
                .returning("*")
        )
    }

    async deleteById(id: string) {
        return await KnexService('collection_products')
            .where({id: id})
            .delete()
    }

    

    async deleteByProductAndCollection(product_id: string, collection_id: string) {
        return await KnexService('collection_products')
            .where({
                product_id,
                collection_id
            })
            .delete()
    }

    async deleteByCollection(collection_id: string) {
        return await KnexService('collection_products')
            .where({
                collection_id
            })
            .delete()
    }

    async findByCollectionAndProduct(product_id: string, collection_id: string) {
        return getFirst(
            await KnexService('collection_products')
            .select("*")
            .where({
                product_id,
                collection_id
            })
        )
    }
}