import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateStyle } from "../interface/styles.interface";

export default class StylesDAO {
    async create({name}: ICreateStyle) {
        return getFirst(
            await KnexService('styles')
            .insert({
                name
            })
            .returning("*")
        )
    }

    async update(id: number, values: ICreateStyle) {
        return getFirst(
            await KnexService('styles')
            .where({id: id})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async getAll(keyword: string) {        
        return await KnexService('styles')
            .select([
                "id", "name"
            ])
            .whereILike("name", `%${keyword}%`)
    }

    async searchByName(keyword: string) {
        return await KnexService('styles')
            .select([
                "id", "name"
            ])
            .whereILike('name', `%${keyword}%`)
    }

    async getById(id: number) {
        return getFirst(
            await KnexService('styles')
            .select([
                "id", "name"
            ])
            .where({id: id})
        )
    }

    async getByName(name: string) {
        return getFirst(
            await KnexService('styles')
            .select([
                "id", "name"
            ])
            .where({name: name})
        )
    }

    async deleteById(id: number) {
        return await KnexService('styles')
            .where({id: id})
            .delete()
    }
}