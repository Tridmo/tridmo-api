import CollectionProductsDao from "./dao/collection_products.dao";
import { ICreateCollectionProduct } from "./interface/collection_products.interface";

export default class CollectionProductsService {
    private collectionProductsDao = new CollectionProductsDao()
    async create({product_id, collection_id}: ICreateCollectionProduct){
        const data = await this.collectionProductsDao.create({
            product_id, 
            collection_id
        })
        return data
    }
    async findByCollectionAndProduct(collection_id: string, product_id: string){
        return await this.collectionProductsDao.findByCollectionAndProduct(collection_id, product_id)
    }
    async delete(id: string){
        await this.collectionProductsDao.deleteById(id)
    } 

    async deleteByCollection(collection_id: string){
        await this.collectionProductsDao.deleteByCollection(collection_id)
    } 

    async deleteByProductAndCollection(product_id: string, collection_id: string){
        await this.collectionProductsDao.deleteByProductAndCollection(product_id, collection_id)
    } 
}