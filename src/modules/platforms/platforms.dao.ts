import KnexService from '../../database/connection';
import { getFirst } from "../shared/utils/utils";
import { ICreatePlatform, IFilterPlatforms, IUpdatePlatform } from './platforms.interface';

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

    async getAll(filters: IFilterPlatforms) {
        return await KnexService('platforms')
            .select('*')
            .orderBy('name', 'asc')
            .modify((q) => {
                if (Object.keys(filters).length) q.where(filters)
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