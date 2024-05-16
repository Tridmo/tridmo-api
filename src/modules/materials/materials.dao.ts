import KnexService from '../../database/connection';
import { getFirst } from "../shared/utils/utils";
import { ICreateMaterial } from "./materials.interface";

export default class MaterialsDAO {
  async create({ name }: ICreateMaterial) {
    return getFirst(
      await KnexService('materials')
        .insert({
          name
        })
        .returning("*")
    )
  }

  async update(materialId: number, values: ICreateMaterial) {
    return getFirst(
      await KnexService('materials')
        .where({ id: materialId })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async getAll(keyword: string = "") {
    return await KnexService('materials')
      .select([
        "id", "name"
      ])
      .whereILike("name", `%${keyword}%`)
  }

  async searchByName(keyword: string) {
    return await KnexService('materials')
      .select([
        "id", "name"
      ])
      .whereILike('name', `%${keyword}%`)
  }

  async getById(materialId: number) {
    return getFirst(
      await KnexService('materials')
        .select([
          "id", "name"
        ])
        .where({ id: materialId })
    )
  }

  async getByName(name: string) {
    return getFirst(
      await KnexService('materials')
        .select([
          "id", "name"
        ])
        .where({ name: name })
    )
  }

  async deleteById(materialId: number) {
    return await KnexService('materials')
      .where({ id: materialId })
      .delete()
  }
}