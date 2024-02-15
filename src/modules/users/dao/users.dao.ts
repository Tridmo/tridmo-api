import { Knex } from 'knex';
import { isEmpty } from 'lodash';
import KnexService from '../../../database/connection';
import { getFirst } from '../../shared/utils/utils';
import { ICreateUser, IUpdateUser, IUser } from '../interface/users.interface';

export default class UsersDAO {
  async create({
    user_id,
    full_name,
    email,
    username,
    birth_date
  }: ICreateUser): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .insert({
          user_id,
          full_name,
          email,
          username,
          birth_date
        })
        .returning('*'),
    );
  }

  async update(id: string, values: IUpdateUser): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .update({
          ...values
        })
        .where({ id: id })
        .returning('*'),
    );
  }

  getAll(key: string, keyword: string, filters, sorts) {
    const { limit, offset, order, orderBy } = sorts
    return KnexService('profiles')
      .select([
        "auth.users.*",
        "profiles.full_name as full_name",
        "role_id as role.id",
        "name as role.name"
      ])
      .innerJoin('profiles', { "auth.users.id": "profiles.user_id" })
      .innerJoin(function () {
        this.select(["user_roles.id", "user_roles.user_id", "role_id", "name"])
          .from("user_roles")
          .as("user_roles")
          .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
          .whereNot("role_id", 1)
          .groupBy("user_roles.id", "role.id")
      }, { "profiles.id": "user_roles.user_id" })
      .limit(limit)
      .offset(offset)
      .orderBy(`users.${orderBy}`, order)
      .whereILike(`users.${key}`, `%${keyword}%`)
      .andWhere(filters)
      .groupBy("auth.users.id", "user_roles.id", "profiles.id", "role_id", "name")
  }

  getById(id: string): Promise<IUser> {
    return KnexService('profiles')
      .where({ id })
      .first();
  }

  getByUserId(user_id: string): Promise<IUser> {
    return KnexService('profiles')
      .where({ user_id })
      .first();
  }

  getByEmail(email: string): Promise<IUser> {
    return KnexService('profiles')
      .where({ email })
      .first();
  }

  getByUsername(username: string): Promise<IUser> {
    return KnexService('profiles')
      .where({ username })
      .first();
  }

  getVerifiedByEmail(email: string) {
    return KnexService('profiles')
      .select('*')
      .where({ email })
      .innerJoin(function () {
        this.select('id')
          .from('auth.users')
          .as('users')
          .whereNotNull('users.email_confirmed_at')
      }, { 'users.id ': 'profiles.user_id' })
      .first()
  }

  getUnverifiedByEmail(email: string) {
    return KnexService('profiles')
      .select('*')
      .where({ email })
      .innerJoin(function () {
        this.select('id')
          .from('auth.users')
          .as('users')
          .whereNull('users.email_confirmed_at')
      }, { 'users.id ': 'profiles.user_id' })
      .first()
  }

  verify(id: string) {
    return KnexService('auth.users')
      .update({ email_confirmed_at: true })
      .where({ id })
  }

  deleteById(id: string) {
    return KnexService('auth.users')
      .where({ id })
      .delete()
  }
}
