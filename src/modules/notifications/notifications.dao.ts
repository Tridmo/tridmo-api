import KnexService from '../../database/connection';
import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateNotification, IFilterNotifications, IUpdateNotification } from './notifications.interface';

export default class NotificationsDAO {
  async create(values: ICreateNotification) {
    return getFirst(
      await KnexService('notifications')
        .insert(values)
        .returning("*")
    )
  }

  async update(id: string, values: IUpdateNotification) {
    return getFirst(
      await KnexService('notifications')
        .where({ id: id })
        .update({
          ...values
        })
        .returning("*")
    )
  }
  async updateByReceipent(recipient_id: string, values: IUpdateNotification) {
    return getFirst(
      await KnexService('notifications')
        .where({ recipient_id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async getBy(filters: IFilterNotifications, sorts: IDefaultQuery) {
    const { order, orderBy, limit, offset } = sorts
    return await KnexService('notifications')
      .select([
        'notifications.*',

        'models.id as model.id',
        'models.name as model.name',
        'model_cover as model.cover',

        'interiors.id as interior.id',
        'interiors.name as interior.name',
        'interior_cover as interior.cover',
      ])
      .leftJoin(function () {
        this.select([
          'models.id',
          'name',
          KnexService.raw(`jsonb_agg(distinct "model_images") as model_cover`)
        ])
          .from('models')
          .as('models')
          .leftJoin(function () {
            this.select([
              'model_images.id',
              'model_images.is_main',
              'model_images.image_id',
              'model_images.model_id',
              'images.src as image_src'
            ])
              .from('model_images')
              .as('model_images')
              .where('model_images.is_main', '=', true)
              .leftJoin("images", { 'model_images.image_id': 'images.id' })
              .groupBy('model_images.id', 'images.id')
          }, { 'models.id': 'model_images.model_id' })
          .groupBy('models.id')
      }, { 'models.id': 'notifications.model_id' })
      .leftJoin(function () {
        this.select([
          'interiors.id',
          'name',
          KnexService.raw(`jsonb_agg(distinct "interior_images") as interior_cover`)
        ])
          .from('interiors')
          .as('interiors')
          .leftJoin(function () {
            this.select([
              'interior_images.id',
              'interior_images.is_main',
              'interior_images.image_id',
              'interior_images.interior_id',
              'images.src as image_src'
            ])
              .from('interior_images')
              .as('interior_images')
              .where('interior_images.is_main', '=', true)
              .leftJoin("images", { 'interior_images.image_id': 'images.id' })
              .groupBy('interior_images.id', 'images.id')
          }, { 'interiors.id': 'interior_images.interior_id' })
          .groupBy('interiors.id')
      }, { 'interiors.id': 'notifications.interior_id' })
      .orderBy(`notifications.${orderBy}`, order)
      .limit(limit)
      .offset(offset)
      .groupBy(
        'notifications.id',
        'models.id',
        'models.name',
        'models.model_cover',
        'interiors.id',
        'interiors.name',
        'interiors.interior_cover'
      )
      .modify((q) => {
        if (Object.keys(filters).length) q.where(filters)
      })
  }

  async getById(id: string) {
    return getFirst(
      await KnexService('notifications')
        .select('*')
        .where({ id: id })
    )
  }

  async deleteById(id: string) {
    return await KnexService('notifications')
      .where({ id: id })
      .delete()
  }

  async deleteBy(filters: IFilterNotifications) {
    return await KnexService('notifications')
      .where(filters)
      .delete()
  }
}