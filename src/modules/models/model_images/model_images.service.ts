import ModelImagesDAO from "./dao/model_images.dao";
import { ICreateModelImage, IModelImage } from "./interface/model_images.interface";

export default class ModelImageService {
  private modelImagesDao = new ModelImagesDAO()
  async create({ model_id, image_id, is_main, index }: ICreateModelImage) {
    const data = await this.modelImagesDao.create({
      model_id,
      image_id,
      is_main,
      index,
    })
    return data
  }
  async findOne(id: string) {
    return await this.modelImagesDao.getById(id)
  }
  async findModelCover(model_id: string): Promise<IModelImage> {
    return await this.modelImagesDao.getModelCover(model_id)
  }
  async findModelSimpleImages(model_id: string): Promise<IModelImage[]> {
    return await this.modelImagesDao.getNonCoverByModel(model_id)
  }
  async findByModel(model_id: string): Promise<IModelImage[]> {
    return await this.modelImagesDao.getByModel(model_id)
  }
  async delete(id: string) {
    await this.modelImagesDao.deleteById(id)
  }
  async deleteByModel(id: string) {
    await this.modelImagesDao.deleteByModelId(id)
  }
  async deleteByImage(image_id: string) {
    await this.modelImagesDao.deleteByImageId(image_id)
  }

  async deleteCoverImage(model_id: string) {
    await this.modelImagesDao.deleteCoverImageByModelId(model_id)
  }
}