import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { IUpdateInteraction } from "../interface/interactions.interface";

export default class InteractionsDAO {
    async create() {
        return getFirst(
            await KnexService('interactions')
                .insert({})
                .returning('*')
        )
    }

    async update(id: string, values: IUpdateInteraction) {
        return getFirst(
            await KnexService('interactions')
                .where({ id: id })
                .update({
                    ...values
                })
                .returning("*")
        )
    }


    async getById(id: string) {
        return getFirst(
            await KnexService('interactions')
                .select('*')
                .where({ id: id })
        )
    }

    async deleteById(id: string) {
        return await KnexService('interactions')
            .where({ id: id })
            .delete()
    }
}