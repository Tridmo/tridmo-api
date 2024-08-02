import { getFirst } from "../../../shared/utils/utils";
import KnexService from '../../../../database/connection';
import { ICreateInteriorImage } from "../interface/interior_images.interface";

export default class InteriorImagesDAO {
  async create(values: ICreateInteriorImage) {
    return getFirst(
      await KnexService("interior_images")
        .insert(values)
        .returning("*")
    )
  }

  async deleteById(id: string) {
    return await KnexService('interior_images')
      .where({ id: id })
      .delete()
  }

  async getById(id: string) {
    return getFirst(
      await KnexService('interior_images')
        .where({ id: id })
    )
  }

  async getByInterior(interior_id: string) {
    return await KnexService('interior_images')
      .where({ interior_id })
  }

  async getInteriorCover(interior_id: string) {
    return getFirst(
      await KnexService('interior_images')
        .where({
          interior_id,
          is_main: true
        })
    )
  }

  async deleteByInteriorId(id: string) {
    return await KnexService('interior_images')
      .where({ interior_id: id })
      .delete()
  }

  async deleteByImageId(image_id: string) {
    return await KnexService('interior_images')
      .where({ image_id })
      .delete()
  }

  async deleteCoverImageByInteriorId(interior_id: string) {
    return await KnexService('interior_images')
      .where({
        interior_id,
        is_main: true
      })
      .delete()
  }
}