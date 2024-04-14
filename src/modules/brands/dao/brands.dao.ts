import { isUUID } from 'class-validator';
import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { IBrand, IBrandAdmin, IBrandStyle, ICreateBrand, ICreateBrandAdmin, ICreateBrandStyle, IUpdateBrand } from "../interface/brands.interface";

export default class BrandsDAO {
    async create(values: ICreateBrand): Promise<IBrand> {
        return getFirst(
            await KnexService('brands')
                .insert(values)
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


    async createBrandStyle({ brand_id, style_id }: ICreateBrandStyle): Promise<IBrandStyle> {
        return getFirst(
            await KnexService('brand_styles')
                .insert({
                    brand_id,
                    style_id
                })
                .returning("*")
        )
    }

    async getBrandStyleByNameAndBrand({ brand_id, style_id }: ICreateBrandStyle): Promise<IBrandStyle> {
        return getFirst(
            await KnexService('brand_styles')
                .select('*')
                .where({
                    brand_id,
                    style_id
                })
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

    async getAll(filters, sorts): Promise<IBrand[]> {

        const { limit, offset, order, orderBy } = sorts
        const { name, ...otherFilters } = filters

        return await KnexService('brands')
            .select([
                "brands.id",
                "brands.name",
                "brands.slug",
                "brands.site_link",
                "brands.description",
                "images.key as image_src",
                KnexService.raw(`count(distinct "models"."id") as models_count`),
                KnexService.raw(`jsonb_agg(distinct brand_styles) as styles`)
            ])
            .leftJoin('images', { 'brands.image_id': 'images.id' })
            .leftJoin('models', { 'models.brand_id': 'brands.id' })
            .leftJoin(function () {
                this.distinct([
                    'brand_id',
                    'styles.id',
                    'styles.name'
                ])
                    .from('brand_styles')
                    .as('brand_styles')
                    .leftJoin('styles', { 'brand_styles.style_id': 'styles.id' })
                    .groupBy('brand_styles.id', 'styles.id')
            }, { 'brand_styles.brand_id': 'brands.id' })
            .limit(limit)
            .offset(offset)
            .orderBy(orderBy == 'models_count' ? 'models_count' : `brands.${orderBy}`, order)
            .groupBy("brands.id", "images.key")
            .modify((q) => {
                if (name) q.whereILike('brands.name', `%${name}%`)
                if (Object.entries(otherFilters)) q.andWhere(otherFilters)
            })
    }

    async count(filters) {
        const { name, ...otherFilters } = filters

        return (
            await KnexService('brands')
                .count("brands.id")
                .modify((q) => {
                    if (name) q.whereILike('brands.name', `%${name}%`)
                    if (Object.entries(otherFilters)) q.andWhere(otherFilters)
                })
        )[0].count
    }

    async getBySlugOrId(identifier: string): Promise<IBrand> {
        return getFirst(
            await KnexService('brands')
                .select([
                    "brands.id",
                    "brands.name",
                    "brands.slug",
                    "brands.site_link",
                    "brands.address",
                    "brands.email",
                    "brands.phone",
                    "brands.description",
                    "images.key as image_src",

                    KnexService.raw(`jsonb_agg(distinct brand_styles) as styles`)
                ])
                .leftJoin('images', { 'brands.image_id': 'images.id' })
                .leftJoin(function () {
                    this.distinct([
                        'brand_id',
                        'styles.id',
                        'styles.name'
                    ])
                        .from('brand_styles')
                        .as('brand_styles')
                        .leftJoin('styles', { 'brand_styles.style_id': 'styles.id' })
                        .groupBy('brand_styles.id', 'styles.id')
                }, { 'brand_styles.brand_id': 'brands.id' })
                .groupBy("brands.id", "images.key")
                .where({
                    [`brands.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier
                })
        )
    }

    async getById(id: string): Promise<IBrand> {
        return getFirst(
            await KnexService('brands')
                .where({ id })
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