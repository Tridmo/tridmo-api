import { getFirst } from "../../../shared/utils/utils";
import KnexService from '../../../../database/connection';
import { ICreateModelImage } from "../interface/model_images.interface";

export default class ModelImagesDAO {
  async create({ model_id, image_id, is_main, index }: ICreateModelImage) {
    return getFirst(
      await KnexService("model_images")
        .insert({
          model_id,
          image_id,
          is_main,
          index
        })
        .returning("*")
    )
  }

  async deleteById(id: string) {
    return await KnexService('model_images')
      .where({ id: id })
      .delete()
  }

  async getById(id: string) {
    return getFirst(
      await KnexService('model_images')
        .where({ id: id })
    )
  }

  async getByModel(model_id: string) {
    return await KnexService('model_images')
      .where({ model_id })
  }

  async getNonCoverByModel(model_id: string) {
    return await KnexService('model_images')
      .where({ model_id, is_main: false })
  }

  async getModelCover(model_id: string) {
    return getFirst(
      await KnexService('model_images')
        .where({
          model_id,
          is_main: true
        })
    )
  }

  async deleteByModelId(id: string) {
    return await KnexService('model_images')
      .where({ model_id: id })
      .delete()
  }

  async deleteByImageId(image_id: string) {
    return await KnexService('model_images')
      .where({ image_id })
      .delete()
  }

  async deleteCoverImageByModelId(model_id: string) {
    return await KnexService('model_images')
      .where({
        model_id,
        is_main: true
      })
      .delete()
  }
}