import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateBrand } from "../interface/brands.interface";

export default class BrandsDAO {
    async create({ name, site_link, description, image_id }: ICreateBrand) {
        return getFirst(
            await KnexService('brands')
                .insert({
                    name,
                    site_link,
                    description,
                    image_id
                })
                .returning("*")
        )
    }

    async update(brandId: number, values: ICreateBrand) {
        return getFirst(
            await KnexService('brands')
                .update({
                    ...values
                })
                .where({ id: brandId })
                .returning("*")
        )
    }

    async getAll(keyword: string = "", filters, sorts) {
        const { limit, offset, order } = sorts
        return await KnexService('brands')
            .select([
                "brands.id",
                "brands.name",
                "brands.site_link",
                "brands.desctiption",
                "brands.image_id"
            ])
            .limit(limit)
            .offset(offset)
            .orderBy(`brands.name`, order)
            .whereILike('brands.name', `%${keyword}%`)
            .andWhere(filters)
            .groupBy("brands.id")
    }

    async count() {
        return await KnexService('brands')
            .count("brands.id")
    }

    async getById(brandId: number) {
        return getFirst(
            await KnexService('brands')
                .select([
                    "brands.id",
                    "brands.name",
                    "brands.site_link",
                    "brands.desctiption",
                    "brands.image_id"
                ])
                .where("brands.id", brandId)
                .groupBy("brands.id")
        )
    }

    async getByName(name: string) {
        return getFirst(
            await KnexService('brands')
                .where({ name: name })
        )
    }

    async deleteById(brandId: number) {
        return await KnexService('brands')
            .where({ id: brandId })
            .delete()
    }
}