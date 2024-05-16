import { ICreateDownload } from './downloads.interface';
import { IDefaultQuery } from "../shared/interface/query.interface";
import DownloadsDao from "./downloads.dao";

export default class DownloadsService {
  private downloadsDao = new DownloadsDao()

  async create({ user_id, model_id }: ICreateDownload): Promise<any> {
    const product = await this.downloadsDao.create({ user_id, model_id })
    return product
  }

  async deleteByModel(model_id: string) {
    await this.downloadsDao.deleteByModel(model_id)
  }

  // async findByUser(keyword: string, sorts: IDefaultQuery) {
  //     const products = await this.downloadsDao.getAll(keyword, sorts, categories, styles, colors);
  //     return products
  // }

}