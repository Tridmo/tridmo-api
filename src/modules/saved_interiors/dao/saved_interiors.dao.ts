import KnexService from '../../../database/connection';
import { IDefaultQuery } from '../../shared/interface/query.interface';
import { getFirst } from "../../shared/utils/utils";
import { ICreateSavedInterior, IFilterSavedInterior, ISavedInterior } from "../interface/saved_interiors.interface";

export default class SavedInteriorsDAO {
  async create({ interior_id, user_id }: ICreateSavedInterior) {
    return getFirst(
      await KnexService('saved_interiors')
        .insert({
          interior_id,
          user_id
        })
        .returning("*")
    )
  }

  async count(filters?: IFilterSavedInterior): Promise<number> {
    return (
      await KnexService('saved_interiors')
        .count('id')
        .modify(q => {
          if (Object.keys(filters).length) q.where(filters)
        })
    )[0].count
  }


  async getAll(filters?: IFilterSavedInterior, sorts?: IDefaultQuery): Promise<ISavedInterior[]> {

    const { order, orderBy, limit, offset } = sorts;

    if (!!filters.user_id) {
      filters['saved_interiors.user_id'] = filters.user_id
      delete filters.user_id
    }

    return await KnexService('saved_interiors')
      .select([
        'saved_interiors.*',
        'interiors.id as interior.id',
        'interiors.slug as interior.slug',
        'interiors.name as interior.name',
        'interior_cover as interior.cover',
        'author_full_name as interior.author.full_name',
        'author_username as interior.author.username',
        'author_company_name as interior.author.company_name',
        'author_image_src as interior.author.image_src',
      ])
      .leftJoin(function () {
        this.select([
          'interiors.*',
          'author.id as author_id',
          'author.full_name as author_full_name',
          'author.username as author_username',
          'author.company_name as author_company_name',
          'author.image_src as author_image_src',
          KnexService.raw('jsonb_agg(distinct "interior_images") as interior_cover'),
        ])
          .from('interiors')
          .as('interiors')
          .leftJoin({ author: 'profiles' }, { 'author.id': 'interiors.user_id' })
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
          .groupBy('interiors.id', 'author.id', 'interior_images.id')
      }, { 'saved_interiors.interior_id': 'interiors.id' })
      .groupBy(
        'saved_interiors.id',
        'interiors.id',
        'interiors.name',
        'interiors.slug',
        'interior_cover',
        'author_full_name',
        'author_username',
        'author_company_name',
        'author_image_src',
      )
      .modify(q => {
        if (Object.keys(filters).length) q.where(filters)
        if (order && orderBy) q.orderBy(`saved_interiors.${orderBy}`, order)
        else q.orderBy(`saved_interiors.created_at`, 'desc')
        if (limit) q.limit(limit)
        if (offset) q.offset(offset)
      })
  }

  async getAllMin(filters?: IFilterSavedInterior, sorts?: IDefaultQuery): Promise<ISavedInterior[]> {

    const { order, orderBy, limit, offset } = sorts;

    return await KnexService('saved_interiors')
      .select([
        'saved_interiors.*',
      ])
      .modify(q => {
        if (Object.keys(filters).length) q.where(filters)
        if (order && orderBy) q.orderBy(`saved_interiors.${orderBy}`, order)
        else q.orderBy(`saved_interiors.created_at`, 'desc')
        if (limit) q.limit(limit)
        if (offset) q.offset(offset)
      })
  }

  async delete(where: IFilterSavedInterior): Promise<number> {
    return await KnexService('saved_interiors')
      .where(where)
      .delete()
  }
}