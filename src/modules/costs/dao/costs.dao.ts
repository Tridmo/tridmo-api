import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateCost } from "../interface/costs.interface";

export default class CostsDAO {
    async create({amount}: ICreateCost) {
        return getFirst(
            await KnexService('costs')
            .insert({
                amount
            })
            .returning("*")
        )
    }

    async update(id: string, values: ICreateCost) {
        return getFirst(
            await KnexService('costs')
            .where({id: id})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async getAll(filters, sorts) {        
        const {order, orderBy} = sorts
        return await KnexService('costs')
            .select([
                "costs.id",
                "costs.amount",
                KnexService.raw(`count(p.id) as products_count`)
            ])
            .where(filters)
            .leftOuterJoin({p: "products"}, {"costs.id": "p.cost_id"})
            .orderBy(`costs.amount`, order)
            .groupBy("costs.id")
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('costs')
            .where({id: id})
        )
    }
}