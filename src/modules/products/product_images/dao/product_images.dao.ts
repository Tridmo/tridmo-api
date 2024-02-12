import { getFirst } from "../../../shared/utils/utils";
import KnexService from '../../../../database/connection';
import { ICreateProductImage } from "../interface/product_images.interface";

export default class ProductImagesDAO {
    async create({product_id, image_id, is_main}: ICreateProductImage){
        return getFirst(
            await KnexService("product_images")
                .insert({
                    product_id,
                    image_id,
                    is_main
                })
                .returning("*")
        )
    }

    async deleteById(id: string) {
        return await KnexService('product_images')
            .where({id: id})
            .delete()
    }

    async getById(id: string) {
        return getFirst(
            await KnexService('product_images')
            .where({id: id})
        )
    }

    async getByProduct(product_id: string) {
        return await KnexService('product_images')
            .where({product_id})
    }

    async getProductCover(product_id: string) {
        return getFirst(
            await KnexService('product_images')
            .where({
                product_id,
                is_main: true
            })
        )
    }

    async deleteByProductId(id: string) {
        return await KnexService('product_images')
            .where({product_id: id})
            .delete()
    }

    async deleteByImageId(id: number) {
        return await KnexService('product_images')
            .where({image_id: id})
            .delete()
    }

    async deleteCoverImageByProductId( product_id: string) {
        return await KnexService('product_images')
            .where({ 
                product_id,
                is_main: true
            })
            .delete()
    }
}