import ErrorResponse from '../shared/utils/errorResponse';
import { IDefaultQuery } from './../shared/interface/query.interface';
import ModelsDAO from "./dao/models.dao";
import { ICreateModel, IGetModelsQuery, IModel, IUpdateModel } from "./interface/models.interface";

export default class ModelService {
    private modelsDao = new ModelsDAO()

    async create(data: ICreateModel): Promise<IModel>{
        const model  = await this.modelsDao.create({...data})
        return model
    }

    async update(id: string, values: IUpdateModel): Promise<IModel> {
        const model: IModel = await this.modelsDao.update(id, values)
        return model
    }

    async updateByBrand(brand_id: number, values): Promise<IModel> {
        return await this.modelsDao.updateByBrand(brand_id, values)
    }

    async findAll(keyword: string, filters: IGetModelsQuery, sorts: IDefaultQuery, categories, styles, colors) {
        const models = await this.modelsDao.getAll(keyword, filters, sorts, categories, styles, colors);
        return models
    }

    async count(keyword,filters: IGetModelsQuery,  categories, styles, colors) {
        const data = await this.modelsDao.count(keyword, filters, categories, styles, colors);
        return data[0] ? data[0].count : 0
    }

    async findOne(id): Promise<IModel> {
        const model = await this.modelsDao.getById(id);
        return model
    }

    async findBySlug(slug): Promise<IModel> {
        const model = await this.modelsDao.getBySlug(slug);
        return model
    }

    async findByProduct(product_id): Promise<IModel> {
        const model = await this.modelsDao.getByProductId(product_id);
        return model
    }

    async findByFilters(filters){
      if (Object.keys(filters).length == 0) throw new ErrorResponse(400, "Filters required!")
        const model = filters.title
        ? await this.modelsDao.getByProductTitle(filters.title) 
        : await this.modelsDao.getByFilters(filters);
        
        return model
    }

    async delete(id) {
        await this.modelsDao.deleteById(id);
    }
}