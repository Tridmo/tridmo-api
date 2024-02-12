import { IDefaultQuery } from './../../modules/shared/interface/query.interface';
import InteriorsDAO from "./dao/interiors.dao";
import { ICreateInterior, IInterior, IUpdateInterior } from "./interface/interiors.interface";

export default class InteriorService {
    private interiorsDao = new InteriorsDAO()

    async create(data: ICreateInterior): Promise<IInterior>{
        const interior  = await this.interiorsDao.create({...data})
        return interior
    }

    async update(id: string, {category_id}: IUpdateInterior): Promise<IInterior>{
        const interior  = await this.interiorsDao.update(id, {category_id})
        return interior
    }

    async findAll(keyword: string, sorts: IDefaultQuery,categories, styles, colors, filters) {
        const interiors = await this.interiorsDao.getAll(keyword, sorts, categories, styles, colors, filters);
        return interiors
    }

    async count(keyword,filters,  categories, styles, colors) {
        const data = await this.interiorsDao.count(keyword, filters, categories, styles, colors);
        console.log(data);
        
        return data[0] ? data[0].count : 0
    }

    async findOne(id): Promise<IInterior> {
        const interior = await this.interiorsDao.getById(id);
        return interior
    }

    async findBySlug(slug): Promise<IInterior> {
        const interior = await this.interiorsDao.getBySlug(slug);
        return interior
    }

    async findByProduct(product_id): Promise<IInterior> {
        const interior = await this.interiorsDao.getByProductId(product_id);
        return interior
    }

    async delete(id) {
        await this.interiorsDao.deleteById(id);
    } 
}