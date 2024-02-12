import InteriorModelsDAO from "./dao/interior_models.dao";
import { ICreateInteriorModel } from "./interface/interior_models.interface";

export default class InteriorModelsService {
    private InteriorModelsDAO = new InteriorModelsDAO()
    async create({model_id, interior_id}: ICreateInteriorModel){
        const data = await this.InteriorModelsDAO.create({
            model_id, 
            interior_id
        })
        return data
    }
    async findByInteriorAndModel(model_id: string, interior_id: string){
        return await this.InteriorModelsDAO.getByInteriorAndModel(model_id, interior_id)
    }
    async delete(id: number){
        await this.InteriorModelsDAO.deleteById(id)
    }
    async deleteByModel(modelId: string){
        await this.InteriorModelsDAO.deleteByModelId(modelId)
    }
    async deleteByInterior(interior_id: string){
        await this.InteriorModelsDAO.deleteByInterior(interior_id)
    }
    async deleteByInteriorAndModel(model_id: string, interior_id: string){
        await this.InteriorModelsDAO.deleteByInteriorAndModel(model_id, interior_id)
    }
}