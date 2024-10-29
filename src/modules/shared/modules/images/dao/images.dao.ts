import { getFirst } from "../../../utils/utils";
import KnexService from '../../../../../database/connection';
import { ICreateFile, ICreateImage, IFilterImage, IUpdateFile } from "../../../interface/files.interface";

export default class ImagesDAO {
  async create({ src, key, ext, name, mimetype, size }: ICreateImage) {
    return getFirst(
      await KnexService("images")
        .insert({
          src,
          key,
          ext,
          name,
          mimetype,
          size
        })
        .returning("*")
    )
  }
  async update(id: string, values: IUpdateFile) {
    return await KnexService("images")
      .update(values)
      .returning("*")
      .where({ id })
  }

  async getById(id: string) {
    return getFirst(
      await KnexService('images')
        .where({ id: id })
    )
  }

  async deleteById(id: string) {
    return await KnexService('images')
      .where({ id: id })
      .delete()
  }
}