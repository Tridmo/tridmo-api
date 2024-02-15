import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { IBrand, IBrandAdmin, ICreateBrand, ICreateBrandAdmin, IUpdateBrand } from "../interface/brands.interface";

export default class BrandsDAO {
    async create({ name, site_link, description, image_id }: ICreateBrand): Promise<IBrand> {
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

    async createBrandAdmin({ brand_id, profile_id }: ICreateBrandAdmin): Promise<IBrandAdmin> {
        return getFirst(
            await KnexService('brand_admins')
                .insert({
                    brand_id,
                    profile_id
                })
                .returning("*")
        )
    }

    async getBrandAdminsByBrand(brand_id: string): Promise<IBrandAdmin[]> {
        return await KnexService('brand_admins')
            .select([
                '*'
            ])
            .where({ brand_id })
            .leftJoin('profiles', { 'brand_admins.profile_id': 'profiles.id' })
    }

    async update(brandId: string, values: IUpdateBrand): Promise<IBrand> {
        return getFirst(
            await KnexService('brands')
                .update({
                    ...values
                })
                .where({ id: brandId })
                .returning("*")
        )
    }

    async getAll(keyword: string = "", filters, sorts): Promise<IBrand[]> {
        const { limit, offset, order } = sorts
        return await KnexService('brands')
            .select([
                "brands.id",
                "brands.name",
                "brands.site_link",
                "brands.description",
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

    async getById(brandId: string): Promise<IBrand> {
        return getFirst(
            await KnexService('brands')
                .select([
                    "brands.id",
                    "brands.name",
                    "brands.site_link",
                    "brands.description",
                    "brands.image_id"
                ])
                .where("brands.id", brandId)
                .groupBy("brands.id")
        )
    }

    async getByName(name: string): Promise<IBrand> {
        return getFirst(
            await KnexService('brands')
                .where({ name: name })
        )
    }

    async deleteById(brandId: string) {
        return await KnexService('brands')
            .where({ id: brandId })
            .delete()
    }
}