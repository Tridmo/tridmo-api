import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import MaterialsDAO from "./materials.dao";
import { IMaterial, ICreateMaterial } from "./materials.interface";

export default class MaterialService {
  private materialsDao = new MaterialsDAO()

  async create({ name }: ICreateMaterial) {
    const foundMaterial: IMaterial = await this.materialsDao.getByName(name);
    if (foundMaterial) {
      throw new ErrorResponse(400, "Material already exists");
    }
    const material: IMaterial = await this.materialsDao.create({ name })

    return material
  }

  async update(id: number, values: ICreateMaterial) {
    const foundMaterial: IMaterial = await this.materialsDao.getById(id);
    if (isEmpty(foundMaterial)) {
      throw new ErrorResponse(404, "Material was not found");
    }
    const material: IMaterial = await this.materialsDao.update(id, values)

    return material
  }

  async findAll(keyword: string) {
    const materials = await this.materialsDao.getAll(keyword);
    return materials
  }

  async findOne(id: number): Promise<IMaterial> {
    const material = await this.materialsDao.getById(id);
    if (!material) {
      throw new ErrorResponse(404, "Material was not found");
    }

    return material
  }

  async delete(id: number) {
    await this.materialsDao.deleteById(id);
  }
}