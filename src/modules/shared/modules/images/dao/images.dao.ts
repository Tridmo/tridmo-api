import { getFirst } from "../../../utils/utils";
import KnexService from '../../../../../database/connection';
import { ICreateFile, ICreateImage } from "../../../interface/files.interface";

export default class ImagesDAO {
  async create({ src, ext, name, mimetype, size }: ICreateImage) {
    return getFirst(
      await KnexService("images")
        .insert({
          src,
          ext,
          name,
          mimetype,
          size
        })
        .returning("*")
    )
  }

  async getById(id: number) {
    return getFirst(
      await KnexService('images')
        .where({ id: id })
    )
  }

  async deleteById(id: number) {
    return await KnexService('images')
      .where({ id: id })
      .delete()
  }
}