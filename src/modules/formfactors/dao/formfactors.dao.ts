import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateFormfactor } from "../interface/formfactors.interface";

export default class FormfactorsDAO {
    async create({name}: ICreateFormfactor) {
        return getFirst(
            await KnexService('formfactors')
            .insert({
                name
            })
            .returning("*")
        )
    }

    async update(id: string, values: ICreateFormfactor) {
        return getFirst(
            await KnexService('formfactors')
            .where({id: id})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async getAll(keyword: string = "") {        
        return await KnexService('formfactors')
            .select([
                "id", "name"
            ])
            .whereILike("name", `%${keyword}%`)
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('formfactors')
            .select([
                "id", "name"
            ])
            .where({id: id})
        )
    }

    async getByName(name: string) {
        return getFirst(
            await KnexService('formfactors')
            .select([
                "id", "name"
            ])
            .where({name: name})
        )
    }

    async deleteById(id: string) {
        return await KnexService('formfactors')
            .where({id: id})
            .delete()
    }
}