import { ICreateDownload, IFilterDownload } from './downloads.interface';
import { IDefaultQuery } from "../shared/interface/query.interface";
import DownloadsDao from "./downloads.dao";
import flat from 'flat'

export default class DownloadsService {
  private downloadsDao = new DownloadsDao()

  async create({ user_id, model_id }: ICreateDownload): Promise<any> {
    const product = await this.downloadsDao.create({ user_id, model_id })
    return product
  }

  async findAll(filters: IFilterDownload): Promise<any[]> {
    const product = await this.downloadsDao.getAll(filters)
    return product
  }
  async findBy(filters: IFilterDownload): Promise<any[]> {
    const product = await this.downloadsDao.getAll(filters)
    return product
  }
  async count(filters: IFilterDownload): Promise<any> {
    return await this.downloadsDao.count(filters)
  }

  async findWithModelBy(filters: IFilterDownload, sorts: IDefaultQuery): Promise<any[]> {
    const data = await this.downloadsDao.getAllWithModel(filters, sorts)
    data.forEach((el, index) => {
      data[index] = flat.unflatten(el)
    });
    return data
  }

  async deleteByModel(model_id: string) {
    await this.downloadsDao.deleteByModel(model_id)
  }

  // async findByUser(keyword: string, sorts: IDefaultQuery) {
  //     const products = await this.downloadsDao.getAll(keyword, sorts, categories, styles, colors);
  //     return products
  // }

}