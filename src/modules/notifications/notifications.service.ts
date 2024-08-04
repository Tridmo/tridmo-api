import CommentsDAO from '../comments/comments.dao';
import { IDefaultQuery } from '../shared/interface/query.interface';
import NotificationsDAO from './notifications.dao';
import { ICreateNotification, IFilterNotifications, INotification, IUpdateNotification, NotificationAction } from './notifications.interface';
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

    const result = await Promise.all(
      data.map(async (el) => {
        let e = flat.unflatten(el);

        // Destructure model and interior from the unflattened object
        const { model, interior, ...other } = e;

        // Check if the interior or model object is present and valid
        if (interior && !interior.id) {
          e = {
            product: { entity: 'models', ...model },
            ...other
          };
        } else if (model && !model.id) {
          e = {
            product: { entity: 'interiors', ...interior },
            ...other
          };
        }

        // Handle specific action_id cases
        if (e?.action_id == 'new_interior_comment') {
          const comment = await new CommentsDAO().getByNotificationId(e?.id);
          if (comment) e.message = comment.text;
        } else if (e?.action_id == 'new_comment_like') {
          const likes = await new CommentsDAO().findLike({ notification_id: e?.id });
          if (likes?.[0]) {
            const comment = await new CommentsDAO().getById(likes?.[0].comment_id);
            if (comment) e.message = comment.text;
          }
        }

        return e
      })
    )

    return result
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