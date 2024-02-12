import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import MaterialsDAO from "./dao/materials.dao";
import { IMaterial, ICreateMaterial } from "./interface/materials.interface";

export default class MaterialService {
    private materialsDao = new MaterialsDAO()

    async create({name}: ICreateMaterial) {
        const foundMaterial: IMaterial = await this.materialsDao.getByName(name);        
        if (foundMaterial) {
          throw new ErrorResponse(400, "This material already exists");
        }
        const material: IMaterial = await this.materialsDao.create({ name })
        
        return material
    }

    async update(id: string, values: ICreateMaterial) {
        const foundMaterial: IMaterial = await this.materialsDao.getById(id);
        if (isEmpty(foundMaterial)) {
          throw new ErrorResponse(400, "Material was not found");
        }
        const material: IMaterial = await this.materialsDao.update(id, values)
        
        return material
    }

    async findAll(keyword: string) {
        const materials = await this.materialsDao.getAll(keyword);
        return materials
    }

    async findOne(id: string) {
        const material = await this.materialsDao.getById(id);
        if (isEmpty(material)) {
            throw new ErrorResponse(400, "Material was not found");
        }

        return material
    }

    async delete(id: string) {
        await this.materialsDao.deleteById(id);
    }
}