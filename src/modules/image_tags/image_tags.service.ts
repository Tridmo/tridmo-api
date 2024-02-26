import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import { IImageTag, ICreateImageTag, IUpdateImageTag } from "./interface/image_tags.interface";
import ImageTagsDAO from "./dao/image_tags.dao";

export default class ImageTagsService {
    private imageTagDao = new ImageTagsDAO()

    async create(values: ICreateImageTag): Promise<IImageTag> {
        return await this.imageTagDao.create(values)
    }

    async update(id: string, values: IUpdateImageTag): Promise<IImageTag> {
        const foundImageTag = await this.imageTagDao.getById(id);
        if (isEmpty(foundImageTag)) throw new ErrorResponse(400, "Image tag was not found");

        const data = await this.imageTagDao.update(id, values)

        return data
    }

    async findById(id: string): Promise<IImageTag> {
        const data = await this.imageTagDao.getById(id);
        if (!data) throw new ErrorResponse(400, "Image text was not found");

        return data
    }

    async findByImage(image_id: string): Promise<IImageTag[]> {
        const data = await this.imageTagDao.getByImage(image_id);
        return data
    }

    async deleteById(id: string): Promise<number> {
        return await this.imageTagDao.deleteById(id);
    }

    async deleteByImage(image_id: string): Promise<number> {
        return await this.imageTagDao.deleteById(image_id);
    }
}