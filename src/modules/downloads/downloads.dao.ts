import { ICreateDownload } from './downloads.interface'
import KnexService from '../../database/connection';
import { getFirst } from "../shared/utils/utils";

export default class DownloadsDao {
  async create({ user_id, model_id }: ICreateDownload) {
    return getFirst(
      await KnexService("downloads")
        .insert({
          user_id,
          model_id
        })
        .returning("*")
    )
  }

  async deleteByModel(model_id: string) {
    return await KnexService('downloads')
      .where({ model_id })
      .delete()
  }

}