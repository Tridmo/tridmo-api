import { getFirst } from "../../../utils/utils";
import KnexService from '../../../../../database/connection';
import { ICreateFile, IFile, IUpdateFile } from "../../../interface/files.interface";

export default class FilesDAO {
  async create({ src, key, ext, name, mimetype, size }: ICreateFile) {
    return getFirst(
      await KnexService("files")
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
  async update(id, values: IUpdateFile) {
    return getFirst(
      await KnexService("files")
        .update({
          ...values
        })
        .where({id})
        .returning("*")
    )
  }

  async getById(id: string) {
    return getFirst(
      await KnexService('files')
        .where({ id: id })
    )
  }

  async getAll(): Promise<IFile[]> {
     return await KnexService('files')
        .select('id','key','src')
  }

  async deleteById(id: string) {
    return await KnexService('files')
      .where({ id: id })
      .delete()
  }
}