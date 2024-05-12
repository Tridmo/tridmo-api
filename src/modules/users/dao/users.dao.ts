import { Knex } from 'knex';
import { filter, isEmpty } from 'lodash';
import KnexService from '../../../database/connection';
import { getFirst } from '../../shared/utils/utils';
import { ICreateUser, IUpdateUser, IUser } from '../interface/users.interface';
import { authVariables } from '../../auth/variables';

export default class UsersDAO {
  async create({
    user_id,
    full_name,
    email,
    username,
    company_name,
    birth_date
  }: ICreateUser): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .insert({
          user_id,
          full_name,
          email,
          username,
          company_name,
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

  async getAll(filters, sorts) {
    const { limit, offset, order, orderBy } = sorts
    const { full_name, role_id, ...otherFilters } = filters;

    const isDesigner = role_id && role_id == authVariables.roles.designer

    return await KnexService('profiles')
      .select([
        "profiles.*",
        "user_roles.role_id as role.id",
        "role_name as role.name",
        ...(isDesigner ? [KnexService.raw(`count("interiors"."id") as designs_count`)] : []),
      ])
      .innerJoin(function () {
        this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id", "role.name as role_name"])
          .from("user_roles")
          .as("user_roles")
          .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
          .whereNot("role_id", 1)
          .groupBy("user_roles.id", "role.id")
      }, { "profiles.id": "user_roles.user_id" })
      .limit(limit)
      .offset(offset)
      .groupBy("profiles.id", "user_roles.id", "user_roles.role_id", "role_name")
      .modify((q) => {
        if (full_name) q.whereILike(`full_name`, `%${full_name}%`)
        if (Object.entries(otherFilters).length) q.andWhere(otherFilters)
        if (role_id) {
          if (isDesigner) {
            q.leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
              .andWhere('user_roles.role_id', role_id)
            q.orderBy(`designs_count`, order)
          } else {
            q.orderBy(`profiles.${orderBy}`, order)
          }
        }
        else {
          q.orderBy(`profiles.${orderBy}`, order)
        }
      })
  }

  async count(filters) {
    const { full_name, role_id, ...otherFilters } = filters;

    return (
      await KnexService('profiles')
        .count('profiles.id')
        .innerJoin('user_roles', 'profiles.id', 'user_roles.user_id')
        .groupBy("profiles.id", "user_roles.id")
        .modify((q) => {
          if (role_id) q.where('user_roles.role_id', role_id)
          if (full_name) q.whereILike(`full_name`, `%${full_name}%`)
          if (Object.entries(otherFilters).length) q.andWhere(otherFilters)
        })
    )[0].count
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

  async getByUsername(username: string): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .select([
          "profiles.*",
          KnexService.raw(`count("interiors"."id") as designs_count`),
        ])
        .leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
        .where({ username })
        .groupBy('profiles.id')
    )
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
