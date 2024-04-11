import KnexService from '../../database/connection';
import { getFirst } from "../shared/utils/utils";
import { ICreatePlatform, IUpdatePlatform } from './platforms.interface';

export default class PlatformsDAO {
    async create({ name, type }: ICreatePlatform) {
        return getFirst(
            await KnexService('platforms')
                .insert({
                    name,
                    type
                })
                .returning("*")
        )
    }

    async update(id: string, values: IUpdatePlatform) {
        return getFirst(
            await KnexService('platforms')
                .where({ id: id })
                .update({
                    ...values
                })
                .returning("*")
        )
    }

    async getAllModelType(keyword?: string) {
        return await KnexService('platforms')
            .select('*')
            .where({ type: 1 })
            .modify((q) => {
                if (keyword) q.whereILike("name", `%${keyword}%`)
            })
    }

    async getAllRenderType(keyword?: string) {
        return await KnexService('platforms')
            .select('*')
            .where({ type: 2 })
            .modify((q) => {
                if (keyword) q.whereILike("name", `%${keyword}%`)
            })
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('platforms')
                .select('*')
                .where({ id: id })
        )
    }

    async getByName(name: string) {
        return getFirst(
            await KnexService('platforms')
                .select('*')
                .where({ name: name })
        )
    }

    async deleteById(id: string) {
        return await KnexService('platforms')
            .where({ id: id })
            .delete()
    }
}