import { ICreateUserRole } from './roles.interface';
import KnexService from '../../../database/connection';
import { getFirst } from '../../shared/utils/utils';

export default class RolesDao {

  async getAll() {
    return await KnexService('roles')
      .select([
        'roles.id',
        'roles.name',
        'roles.description',
        KnexService.raw('jsonb_agg(distinct "role_access_modules") as role_access_modules')
      ])
      .leftJoin(function () {
        this.select([
          'role_access_modules.id',
          'role_access_modules.role_id',
          'role_access_modules.access_module_id',
          'access_modules.name'
        ])
          .from('role_access_modules')
          .as('role_access_modules')
          .groupBy('role_access_modules.id')
          .groupBy('access_modules.id')
          .innerJoin('access_modules', 'role_access_modules.access_module_id', 'access_modules.id')
      }, { 'roles.id': 'role_access_modules.role_id' })
      .groupBy('roles.id')

  }

  async getById(roleId: number) {
    return getFirst(
      await KnexService('roles')
        .where({ id: roleId })
    )
  }
  async getUserRoles(user_id: string) {
    return getFirst(
      await KnexService('user_roles')
        .where({ user_id })
    )
  }

  async deleteById(roleId: string) {
    return await KnexService('roles')
      .where({
        id: roleId
      })
      .delete()
  }


  async getUserRole({ role_id, user_id }: ICreateUserRole) {
    return getFirst(
      await KnexService('user_roles')
        .where({
          role_id,
          user_id
        })
    )
  }

  async createUserRole({ user_id, role_id }: ICreateUserRole) {
    return getFirst(
      await KnexService('user_roles')
        .insert({
          user_id,
          role_id
        })
        .returning('*')
    )
  }

  async deleteUserRole(user_id: string, role_id: number) {
    await KnexService('user_roles')
      .where({
        user_id,
        role_id
      })
      .delete()
  }

  async deleteUserRoles(user_id: string) {
    await KnexService('user_roles')
      .where({
        user_id
      })
      .delete()
  }

  async getUserRolesAndModules(user_id) {
    return await KnexService("user_roles")
      .select([
        // 'user_roles.id',     
        'access_module_name as access_module_name',
      ])
      .innerJoin(function () {
        this.select([
          'roles.id',
          'access_module_name as access_module_name',
        ])
          .innerJoin(function () {
            this.select([
              'role_access_modules.id',
              'role_access_modules.role_id',
              'role_access_modules.access_module_id',
              'access_modules.name as access_module_name'
            ])
              .from('role_access_modules')
              .as('role_access_modules')
              .groupBy('role_access_modules.id')
              .groupBy('access_modules.id')
              .innerJoin('access_modules', 'role_access_modules.access_module_id', 'access_modules.id')
          }, { 'roles.id': 'role_access_modules.role_id' })
          .as('roles')
          .from('roles')
          .groupBy('access_module_name')
          .groupBy('roles.id')
      }, { 'user_roles.role_id': 'roles.id' })
      .groupBy('user_roles.id')
      .groupBy('access_module_name')
      .groupBy('roles.id')
      .where({ "user_roles.user_id": user_id })
  }

  async getByName(name: string) {
    return getFirst(
      await KnexService('roles')
        .where("name", name)
    )
  }

}
