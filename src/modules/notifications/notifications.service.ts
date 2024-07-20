import { IDefaultQuery } from '../shared/interface/query.interface';
import NotificationsDAO from './notifications.dao';
import { ICreateNotification, IFilterNotifications, INotification, IUpdateNotification } from './notifications.interface';
import flat from 'flat';

export default class NotificationsService {
  private dao = new NotificationsDAO();

  async create(values: ICreateNotification): Promise<INotification> {
    return await this.dao.create(values)
  }
  async updateById(id: string, values: IUpdateNotification): Promise<INotification[]> {
    return await this.dao.updateById(id, values)
  }
  async update(filters: IFilterNotifications, values: IUpdateNotification): Promise<INotification[]> {
    return await this.dao.update(filters, values)
  }
  async updateByReceipent(filters: IFilterNotifications & { recipient_id: string }, values: IUpdateNotification): Promise<INotification[]> {
    return await this.dao.updateByReceipent(filters, values)
  }
  async updateMany(filters: IFilterNotifications[], values: IUpdateNotification): Promise<INotification[]> {
    const arr = []
    for await (const e of filters) {
      arr.push(await this.dao.update(e, values))
    }
    return arr
  }
  async findBy(filters: IFilterNotifications, sorts: IDefaultQuery): Promise<INotification[]> {

    const data = await this.dao.getBy(filters, sorts)

    data.forEach((el, i) => {
      let e = flat.unflatten(el)
      const { model, interior, ...other } = e
      if (!interior?.id) {
        e = {
          product: { entity: 'models', ...model },
          ...other
        }
      }
      else if (!model?.id) {
        e = {
          product: { entity: 'interiors', ...interior },
          ...other
        }
      }
      data[i] = e;
    })

    return data
  }
  async count(filters: IFilterNotifications) {
    return await this.dao.count(filters)
  }
  async findOne(id: string): Promise<INotification> {
    return await this.dao.getById(id)
  }
  async deleteById(id: string): Promise<number> {
    return await this.dao.deleteById(id)
  }
  async deleteBy(filters: IFilterNotifications): Promise<number> {
    return await this.dao.deleteBy(filters)
  }
}