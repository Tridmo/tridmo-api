import KnexService from '../../../../database/connection';
import { getFirst } from "../../../shared/utils/utils";
import { ICreateUserProductView, IGetUserProductViewFilters } from "../interface/user_product_views.interface";

export default class UserProductViewsDAO {
    async create(values: ICreateUserProductView) {
        return getFirst(
            await KnexService('user_product_views')
                .insert({
                    ...values
                })
                .returning("*")
        )
    }
    async deleteByProduct(product_id: string) {
        await KnexService('user_product_views')
            .where({ product_id })
            .delete()
    }

    async getAll(filters: IGetUserProductViewFilters) {
        return await KnexService('user_product_views')
            .select([
                "user_product_views.user_id",
                "user_product_views.remote_ip",
                "user_product_views.device",
                'products.id as product.id',
                'products.title as product.title',
                'products.slug as product.slug',
                'products.cost as product.cost',
                'cover as product.cover',
            ])
            .leftJoin(function () {
                this.select([
                    'products.*',
                    'cost.amount as cost',
                    KnexService.raw('jsonb_agg(distinct "model_images") as cover')
                ])
                    .leftJoin({ cost: "costs" }, { "products.cost_id": "cost.id" })
                    .leftJoin(function () {
                        this.select([
                            'model_images.product_id',
                            "image.src as image.src"
                        ])
                            .from('model_images')
                            .as('model_images')
                            .where({ is_main: true })
                            .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                            .groupBy('model_images.id', "image.id")
                    }, { 'products.id': 'model_images.product_id' })
                    .from('products')
                    .as('products')
                    .groupBy('products.id', 'cost.amount')
            }, { "user_product_views.product_id": "products.id" })
            .where(filters)
    }

    async getByIPDeviceAndProduct({ remote_ip, device, product_id }) {
        return getFirst(
            await KnexService('user_product_views')
                .select([
                    "user_product_views.user_id",
                    "user_product_views.remote_ip",
                    "user_product_views.device"
                ])
                .where({
                    remote_ip,
                    device,
                    product_id
                })
        )
    }

    async getWithLimit(limit: number, filters: IGetUserProductViewFilters) {
        console.log(filters, 'hfhgjkm,');

        return await KnexService('user_product_views')
            .select([
                "user_product_views.user_id",
                "user_product_views.remote_ip",
                "user_product_views.device",
                'products.id as product.id',
                'products.title as product.title',
                'products.slug as product.slug',
                'products.cost as product.cost',
                'products.model_id as product.model_id',
                'products.interior_id as product.interior_id',
                'cover as product.cover',
            ])
            // .distinct('user_product_views.remote_ip')
            .leftJoin(function () {
                this.select([
                    'products.*',
                    'models.id as model_id',
                    'interiors.id as interior_id',
                    'cost.amount as cost',
                    KnexService.raw('jsonb_agg(distinct "model_images") as cover')
                ])
                    .leftJoin("interiors", { "products.id": "interiors.product_id" })
                    .leftJoin("models", { "products.id": "models.product_id" })
                    .leftJoin({ cost: "costs" }, { "products.cost_id": "cost.id" })
                    .leftJoin(function () {
                        this.select([
                            'model_images.product_id',
                            "image.src as image.src"
                        ])
                            .from('model_images')
                            .as('model_images')
                            .where({ is_main: true })
                            .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                            .groupBy('model_images.id', "image.id")
                    }, { 'products.id': 'model_images.product_id' })
                    .from('products')
                    .as('products')
                    .groupBy('products.id', 'cost.amount', 'interiors.id', 'models.id')
            }, { "user_product_views.product_id": "products.id" })
            .where(filters)
            .limit(limit)
    }

    async findOneByFilters(filters: IGetUserProductViewFilters) {
        return getFirst(
            await KnexService('user_product_views')
                .select([
                    "user_product_views.user_id",
                    "user_product_views.remote_ip",
                    "user_product_views.device",
                    'products.id as product.id',
                    'products.title as product.title',
                    'products.slug as product.slug',
                    'products.cost as product.cost',
                    'cover as product.cover',
                ])
                .leftJoin(function () {
                    this.select([
                        'products.*',
                        'cost.amount as cost',
                        KnexService.raw('jsonb_agg(distinct "model_images") as cover')
                    ])
                        .leftJoin({ cost: "costs" }, { "products.cost_id": "cost.id" })
                        .leftJoin(function () {
                            this.select([
                                'model_images.product_id',
                                "image.src as image.src"
                            ])
                                .from('model_images')
                                .as('model_images')
                                .where({ is_main: true })
                                .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                                .groupBy('model_images.id', "image.id")
                        }, { 'products.id': 'model_images.product_id' })
                        .from('products')
                        .as('products')
                        .groupBy('products.id', 'cost.amount')
                }, { "user_product_views.product_id": "products.id" })
                .where(filters)
        )
    }
}