import { Knex } from 'knex';
import { filter, isEmpty } from 'lodash';
import KnexService from '../../database/connection';
import { getFirst } from '../shared/utils/utils';
import { ICreateUser, IUpdateUser, IUser } from './users.interface';
import { authVariables } from '../auth/variables';

export default class UsersDAO {
  async create({
    user_id,
    full_name,
    email,
    username,
    company_name,
    birth_date,
    image_src
  }: ICreateUser): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .insert({
          user_id,
          full_name,
          email,
          username,
          company_name,
          birth_date,
          image_src
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
    const { limit, offset, order, orderBy } = sorts;
    const { full_name, role_id, ...otherFilters } = filters;

    const isDesigner = role_id && role_id == authVariables.roles.designer;

    return await KnexService('profiles')
      .select([
        "profiles.id",
        "profiles.image_src",
        "profiles.full_name",
        "profiles.username",
        "profiles.company_name",
        ...(isDesigner ? [
          KnexService.raw(`count("interiors"."id") as designs_count`),
          KnexService.raw(`sum("tags_count".count) as tags_count`),
        ] : []),
      ])
      .innerJoin(function () {
        this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id", "role.name as role_name"])
          .from("user_roles")
          .as("user_roles")
          .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
          .whereNot("role_id", 1)
          .groupBy("user_roles.id", "role.id");
      }, { "profiles.id": "user_roles.user_id" })
      .modify((q) => {
        if (isDesigner) {
          q.leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
          q.leftJoin(function () {
            this.select('interior_id', KnexService.raw('count(id) as count'))
              .from('interior_models')
              .groupBy('interior_id')
              .as('tags_count')
          }, { 'interiors.id': 'tags_count.interior_id' })
        }
      })
      .limit(limit)
      .offset(offset)
      .groupBy("profiles.id", "user_roles.id", "user_roles.role_id", "role_name")
      .modify((q) => {
        if (full_name) {
          q.whereILike(`full_name`, `%${full_name}%`)
            .orWhereILike(`username`, `%${full_name}%`)
        }
        if (Object.entries(otherFilters).length) q.andWhere(otherFilters);
        if (role_id) {
          q.andWhere('user_roles.role_id', role_id);
        }
        q.orderBy(
          orderBy !== 'designs_count' && orderBy !== 'tags_count'
            ? `profiles.${orderBy}`
            : orderBy,
          order
        );
      });
  }

  async getAll_admin(filters, sorts) {
    const { limit, offset, order, orderBy } = sorts;
    const { key, keyword, role_id, ...otherFilters } = filters;

    const isDesigner = role_id && role_id == authVariables.roles.designer;

    return await KnexService('profiles')
      .select([
        "profiles.*",
        "user_roles.role_id as role.id",
        "role_name as role.name",
        ...(isDesigner ? [
          KnexService.raw(`count("interiors"."id") as designs_count`),
          KnexService.raw(`sum("tags_count".count) as tags_count`),
          KnexService.raw(`"downloads_count".count as downloads_count`),
        ] : []),
      ])
      .innerJoin(function () {
        this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id", "role.name as role_name"])
          .from("user_roles")
          .as("user_roles")
          .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
          .whereNot("role_id", 1)
          .groupBy("user_roles.id", "role.id");
      }, { "profiles.id": "user_roles.user_id" })
      .modify((q) => {
        if (isDesigner) {
          q.leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
          q.leftJoin(function () {
            this.select('user_id', KnexService.raw('count(distinct id) as count'))
              .from('downloads')
              .groupBy('user_id')
              .as('downloads_count')
          }, { 'profiles.id': 'downloads_count.user_id' })
          q.leftJoin(function () {
            this.select('interior_id', KnexService.raw('count(distinct id) as count'))
              .from('interior_models')
              .groupBy('interior_id')
              .as('tags_count')
          }, { 'interiors.id': 'tags_count.interior_id' })
        }
      })
      .limit(limit)
      .offset(offset)
      .groupBy("profiles.id", "user_roles.id", "user_roles.role_id", "role_name", 'downloads_count.count')
      .modify((q) => {
        if (Object.entries(otherFilters).length) q.andWhere(otherFilters);
        if (key) {
          q.whereILike(`full_name`, `%${key}%`)
            .orWhereILike(`username`, `%${key}%`)
            .orWhereILike(`email`, `%${key}%`)
            .orWhereILike(`company_name`, `%${key}%`);
        }
        if (role_id) {
          q.andWhere('user_roles.role_id', role_id);
        }
        q.orderBy(
          orderBy !== 'designs_count' && orderBy !== 'tags_count'
            ? `profiles.${orderBy}`
            : orderBy,
          order
        );
      });
  }


  async count(filters) {
    const { full_name, key, keyword, role_id, ...otherFilters } = filters;

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

  async getByUserIdAndRole(user_id: string, role: number): Promise<IUser> {
    return await KnexService('profiles')
      .select('profiles.*')
      .innerJoin(function () {
        this.select('user_roles.*')
          .from('user_roles')
          .as('user_roles')
          .where('user_roles.role_id', '=', role)
      }, { 'user_roles.user_id': 'profiles.id' })
      .where({ 'profiles.user_id': user_id })
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
          KnexService.raw(`sum("tags_count".count) as tags_count`),
          KnexService.raw(`"downloads_count".count as downloads_count`),
        ])
        .leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
        .leftJoin(function () {
          this.select('user_id', KnexService.raw('count(distinct id) as count'))
            .from('downloads')
            .groupBy('user_id')
            .as('downloads_count')
        }, { 'profiles.id': 'downloads_count.user_id' })
        .leftJoin(function () {
          this.select('interior_id', KnexService.raw('count(distinct id) as count'))
            .from('interior_models')
            .groupBy('interior_id')
            .as('tags_count')
        }, { 'interiors.id': 'tags_count.interior_id' })
        .groupBy('profiles.id', 'downloads_count.count')
        .where({ username })
    )
  }

  async getByUsername_min(username: string): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .select([
          "profiles.*"
        ])
        .where({ username })
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
