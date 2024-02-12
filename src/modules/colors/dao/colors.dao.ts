import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateColor } from "../interface/colors.interface";

export default class ColorsDAO {
    async create({name, hex_value}: ICreateColor) {
        return getFirst(
            await KnexService('colors')
            .insert({
                name,
                hex_value
            })
            .returning("*")
        )
    }

    async update(colorId: number, values: ICreateColor) {
        return getFirst(
            await KnexService('colors')
            .where({id: colorId})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async getAll(keyword: string) {        
        return await KnexService('colors')
            .select([
                "id", "name", "hex_value"
            ])
            .whereILike("name", `%${keyword}%`)
    }

    async searchByName(keyword: string) {
        return await KnexService('colors')
            .select([
                "id", "name", "hex_value"
            ])
            .whereILike('name', `%${keyword}%`)
    }

    async getById(colorId: number) {
        return getFirst(
            await KnexService('colors')
            .select([
                "id", "name", "hex_value"
            ])
            .where({id: colorId})
        )
    }

    async getByName(name: string) {
        return getFirst(
            await KnexService('colors')
            .select([
                "id", "name", "hex_value"
            ])
            .where({name: name})
        )
    }

    async getByHex(hexCode: string) {
        return getFirst(
            await KnexService('colors')
            .select([
                "id", "name", "hex_value"
            ])
            .where({hex_value: hexCode})
        )
    }

    async deleteById(colorId: number) {
        return await KnexService('colors')
            .where({id: colorId})
            .delete()
    }
}