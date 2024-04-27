import { IDefaultQuery } from '../shared/interface/query.interface';
import NotificationsDAO from './notifications.dao';
import { ICreateNotification, IFilterNotifications, INotification, IUpdateNotification } from './notifications.interface';


export default class NotificationsService {
  private dao = new NotificationsDAO();

  async create(values: ICreateNotification): Promise<INotification> {
    return await this.dao.create(values)
  }
  async update(id: string, values: IUpdateNotification): Promise<INotification[]> {
    return await this.dao.update(id, values)
  }
  async updateByReceipent(recipient_id: string, values: IUpdateNotification): Promise<INotification> {
    return await this.dao.updateByReceipent(recipient_id, values)
  }
  async updateMany(ids: string, values: IUpdateNotification): Promise<INotification[]> {
    const arr = []
    for await (const id of ids) {
      arr.push(await this.dao.update(id, values))
    }
    return arr
  }
  async findBy(filters: IFilterNotifications, sorts: IDefaultQuery): Promise<INotification[]> {
    return await this.dao.getBy(filters, sorts)
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