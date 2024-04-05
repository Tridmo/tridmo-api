import MaterialService from '../../materials/materials.service';
import ModelMaterialsDAO from "./dao/model_materials.dao";
import { ICreateModelMaterial } from "./interface/model_materials.interface";

export default class ModelMaterialService {
    private modelMaterialsDao = new ModelMaterialsDAO()
    private materialService = new MaterialService()

    async create({ model_id, material_id }: ICreateModelMaterial) {

        await this.materialService.findOne(material_id)

        const data = await this.modelMaterialsDao.create({
            model_id,
            material_id
        })
        return data
    }
    async findByModelAndMaterial(model_id: string, material_id: number) {
        return await this.modelMaterialsDao.getByModelAndMaterial(model_id, material_id)
    }
    async delete(id: string) {
        await this.modelMaterialsDao.deleteById(id)
    }
    async deleteByModel(modelId: string) {
        await this.modelMaterialsDao.deleteByModelId(modelId)
    }
    async deleteByMaterialAndModel(model_id: string, material_id: number): Promise<number> {
        return await this.modelMaterialsDao.deleteByMaterialAndModel(model_id, material_id)
    }
}