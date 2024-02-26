import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateImageTag, IImageTag, IUpdateImageTag } from "../interface/image_tags.interface";

export default class ImageTagsDAO {
    async create(values: ICreateImageTag): Promise<IImageTag> {
        return getFirst(
            await KnexService('image_tags')
                .insert({
                    ...values
                })
                .returning("*")
        )
    }

    async update(id: string, values: IUpdateImageTag): Promise<IImageTag> {
        return getFirst(
            await KnexService('image_tags')
                .where({ id: id })
                .update({
                    ...values
                })
                .returning("*")
        )
    }

    async getById(id: string): Promise<IImageTag> {
        return getFirst(
            await KnexService('image_tags')
                .select('*')
                .where({ id })
        )
    }

    async getByImage(image_id: string): Promise<IImageTag[]> {
        return await KnexService('image_tags')
            .select('*')
            .where({ image_id })
    }

    async deleteById(id: string): Promise<number> {
        return await KnexService('image_tags')
            .where({ id })
            .delete()
    }

    async deleteByImage(image_id: string): Promise<number> {
        return await KnexService('image_tags')
            .where({ image_id })
            .delete()
    }
}