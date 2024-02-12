import { IDefaultQuery } from "../shared/interface/query.interface";
import ProductsDAO from "./dao/products.dao";
import { ICreateProduct, IGetProductsQuery, IProduct } from "./interface/products.interface";

export default class ProductService {
    private productsDao = new ProductsDAO()

    async create({title, description, slug, file_id, cost_id, style_id, is_free}: ICreateProduct): Promise<IProduct>{
        const product  = await this.productsDao.create({title, description, slug, cost_id, style_id, file_id, is_free})
        return product
    }

    async update(id: string, values): Promise<IProduct> {
        const product: IProduct = await this.productsDao.update(id, values)
        return product
    }

    async updateByFile(file_id: string, values): Promise<void> {
        await this.productsDao.updateByFile(file_id, values)
    }

    async findAll(keyword: string, filters, sorts: IDefaultQuery, categories, styles, colors) {
        const products = await this.productsDao.getAll(keyword, filters, sorts, categories, styles, colors);
        return products
    }
    async searchBySlug(keyword: string): Promise<IProduct[]> {
        const products = await this.productsDao.searchBySlug(keyword);
        return products
    }

    async countByCriteria(keyword, filters, categories, styles, colors) {
        const data = await this.productsDao.countByCriteria(keyword, filters, categories, styles, colors);        
        return data[0] ? data[0].count : 0
    }

    async findOne(id): Promise<IProduct> {
        const product = await this.productsDao.getById(id);
        return product
    }

    async findBySlug(slug): Promise<IProduct> {
        const product = await this.productsDao.getBySlug(slug);
        return product
    }

    async delete(id) {
        await this.productsDao.deleteById(id);
    }
}