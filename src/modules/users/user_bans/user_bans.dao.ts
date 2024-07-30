import { Knex } from 'knex';
import { isEmpty } from 'lodash';
import KnexService from '../../../database/connection';
import { getFirst } from '../../shared/utils/utils';
import { ICreateUserBan, IUpdateUserBan, IUserBan } from './user_bans.interface'

export default class UserBansDAO {
  async create(values: ICreateUserBan): Promise<IUserBan> {
    return getFirst(
      await KnexService('user_bans')
        .insert(values)
        .returning('*'),
    );
  }
  async update(
    id,
    values: IUpdateUserBan
  ): Promise<IUserBan> {
    return getFirst(
      await KnexService('user_bans')
        .update(values)
        .where({ id })
        .returning('*'),
    );
  }
  async updateByUser(
    user_id,
    values: IUpdateUserBan
  ): Promise<IUserBan> {
    return getFirst(
      await KnexService('user_bans')
        .update(values)
        .where({ user_id })
        .returning('*'),
    );
  }

  getByUserId(id: string) {
    return KnexService('user_bans')
      .select('*')
      .where("user_id", id)
  }
  getPermanentByUser(id: string) {
    return KnexService('user_bans')
      .select('*')
      .where({ user_id: id, permanent: true })
  }

  deleteById(id: string) {
    return KnexService('user_bans')
      .where('id', id)
      .delete()
  }

  deleteByUserId(id: string) {
    return KnexService('user_bans')
      .where('user_id', id)
      .delete()
  }
}
