import KnexService from '../../../database/connection';
import { getFirst } from '../../shared/utils/utils';
import { ICreateUserRole, IUserRole } from './user_roles.interface';

export default class UserRolesDAO {
  async create({
    user_id,
    role_id
  }: ICreateUserRole): Promise<IUserRole> {
    return getFirst(
      await KnexService('user_roles')
        .insert({
          user_id,
          role_id
        })
        .returning('*'),
    );
  }
  async updateByUser(
    user_id,
    values: ICreateUserRole
  ): Promise<IUserRole> {
    return getFirst(
      await KnexService('user_roles')
        .update({
          ...values
        })
        .where({ user_id })
        .returning('*'),
    );
  }

  getByUserId(id: string) {
    return KnexService('user_roles')
      .select([
        "user_roles.*",
        "roles.name as role_name",
      ])
      .innerJoin('roles', { 'roles.id': 'user_roles.role_id' })
      .groupBy('user_roles.id', 'roles.name')
      .where("user_id", id)
  }

  getByUserAndRole(user_id: string, role_id: number) {
    return KnexService('user_roles')
      .select([
        "user_roles.*",
        "roles.name as role_name",
      ])
      .innerJoin('roles', { 'roles.id': 'user_roles.role_id' })
      .groupBy('user_roles.id', 'roles.name')
      .where({ user_id, role_id })
      .first()
  }

  deleteById(id: number) {
    return KnexService('user_roles')
      .where('id', id)
      .delete()
  }

  deleteByUserId(id: string) {
    return KnexService('user_roles')
      .where('user_id', id)
      .delete()
  }
}
