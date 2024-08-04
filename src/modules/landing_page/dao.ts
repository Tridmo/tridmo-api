import KnexService from '../../database/connection';
import { getFirst } from "../shared/utils/utils";
import { ICreateRole, IUpdateRole } from "./roles.interface";

export default class RolesDAO {
  async create({ id, name, description }: ICreateRole) {
    return getFirst(
      await KnexService('roles')
        .insert({
          id,
          name,
          description
        })
        .returning("*")
    )
  }

  async update(id: number, values: IUpdateRole) {
    return getFirst(
      await KnexService('roles')
        .where({ id: id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async getAll() {
    return await KnexService('roles')
      .select("*")
  }

  async getById(id: number) {
    return getFirst(
      await KnexService('roles')
        .where({ id: id })
    )
  }

  async getByName(name: string) {
    return getFirst(
      await KnexService('roles')
        .where("name", name)
    )
  }
}