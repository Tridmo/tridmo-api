import { IDefaultQuery } from '../shared/interface/query.interface';
import CollectionProductsService from './collection_products/collection_products.service';
import CollectionsDAO from "./dao/collections.dao";
import { ICreateCollection, ICollection, IUpdateCollection } from "./interface/collections.interface";

export default class CollectionsService {
    private collectionsDao = new CollectionsDAO()
    private collectionProductsService = new CollectionProductsService()

    async create(data: ICreateCollection): Promise<any>{
        const collection  = await this.collectionsDao.create({...data})
        return collection
    }
    
    async update(id: string, data: IUpdateCollection): Promise<any>{
        const collection  = await this.collectionsDao.update(id, data)
        return collection
    }

    async findAll(keyword: string, sorts: IDefaultQuery, styles, colors) {
        const collections = await this.collectionsDao.getAll(keyword, sorts, styles, colors);
        return collections
    }

    async count() {
        const data = await this.collectionsDao.count();
        return data[0] ? data[0].count : 0
    }

    async findOne(id): Promise<ICollection> {
        const collection = await this.collectionsDao.getById(id);
        return collection
    }

    async findByProduct(product_id): Promise<ICollection> {
        const collection = await this.collectionsDao.getByProductId(product_id);
        return collection
    }

    async deleteByProduct(product_id: string) {
        await this.collectionsDao.deleteByProduct(product_id);
    }

    async delete(id: string) {
        await this.collectionProductsService.deleteByCollection(id)
        await this.collectionsDao.deleteById(id);
    }
  
}