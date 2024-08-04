import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { IComment, ICreateComment, ICreateCommentBody, ICreateCommentLike, IFilterComment, IFilterCommentLike, IUpdateComment } from "./comments.interface";
import CommentsDAO from './comments.dao';
import ModelsDAO from '../models/models.dao';
import InteriorsDAO from '../interiors/interiors.dao';
import { IUser } from '../users/users.interface';
import flat from 'flat';
import NotificationsService from "../notifications/notifications.service";

export default class CommentsService {
  private dao = new CommentsDAO()
  private modelsDao = new ModelsDAO()
  private interiorsDao = new InteriorsDAO()
  private notificationsService = new NotificationsService()

  async create(
    values: ICreateCommentBody,
    user: IUser
  ) {
    let notification_id = null;
    if (values.entity_source == 'models') {
      await this.modelsDao.getByIdMinimal(values.entity_id)
    }
    else if (values.entity_source == 'interiors') {
      const interior = await this.interiorsDao.getByIdMinimal(values.entity_id)
      const notification = await this.notificationsService.create({
        interior_id: values.entity_id,
        action_id: 'new_interior_comment',
        notifier_id: user.id,
        recipient_id: interior.user_id,
      })
      notification_id = notification?.id || null
    }

    const data = await this.dao.create({
      ...values,
      user_id: user.id,
      notification_id
    })

    return data
  }

  async update(
    id: string,
    values: IUpdateComment,
  ) {
    const data = await this.dao.update(id, values)
    return data
  }

  async addLike({ comment_id, user_id }: ICreateCommentLike): Promise<boolean> {
    const comment = await this.dao.getById(comment_id)
    if (!comment) return false;
    const existing = (await this.dao.findLike({ comment_id, user_id })).length > 0;
    if (existing) return false;
    const notification = await this.notificationsService.create({
      interior_id: comment.entity_id,
      action_id: 'new_comment_like',
      notifier_id: user_id,
      recipient_id: comment.user_id,
    })
    await this.dao.createLike({ comment_id, user_id, notification_id: notification?.id });
    return true;
  }
  async removeLike({ comment_id, user_id }: IFilterCommentLike): Promise<void> {
    const like = await this.dao.findLike({ comment_id, user_id })
    if (!like) return;
    if (like?.[0]?.notification_id) await new NotificationsService().deleteById(like?.[0]?.notification_id);
    await this.dao.removeLike({ comment_id, user_id });
  }

  async findAll(filters: IFilterComment, sorts: IDefaultQuery) {
    const data = await this.dao.getAll(filters, sorts);

    data.forEach((c, i) => data[i] = flat.unflatten(c))

    return data
  }

  async delete(where: IFilterComment): Promise<number> {
    return await this.dao.delete(where);
  }
}