import InteriorImagesDAO from "./dao/interior_images.dao";
import { ICreateInteriorImage, IInteriorImage } from "./interface/interior_images.interface";

export default class InteriorImageService {
    private modelImagesDao = new InteriorImagesDAO()
    async create({ interior_id, image_id, is_main }: ICreateInteriorImage) {
        const data = await this.modelImagesDao.create({
            interior_id,
            image_id,
            is_main
        })
        return data
    }
    async findOne(id: string) {
        return await this.modelImagesDao.getById(id)
    }
    async findInteriorCover(interior_id: string) {
        return await this.modelImagesDao.getInteriorCover(interior_id)
    }
    async findByInterior(interior_id: string): Promise<IInteriorImage[]> {
        return await this.modelImagesDao.getByInterior(interior_id)
    }
    async delete(id: string) {
        await this.modelImagesDao.deleteById(id)
    }
    async deleteByInterior(id: string) {
        await this.modelImagesDao.deleteByInteriorId(id)
    }
    async deleteByImage(image_id: string) {
        await this.modelImagesDao.deleteByImageId(image_id)
    }

    async deleteCoverImage(interior_id: string) {
        await this.modelImagesDao.deleteCoverImageByInteriorId(interior_id)
    }
}