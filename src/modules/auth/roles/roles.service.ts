import { UpdateRoleDTO } from './roles.dto';
import { ICreateRole, IRole, IUserRole, ICreateUserRole } from './roles.interface';
import { isEmpty } from 'class-validator';
import RolesDao from './roles.dao';
import ErrorResponse from '../modules/../../shared/utils/errorResponse';

export default class RolesService {
  private rolesDao = new RolesDao()
  async findOne(id: number) {
    const foundRole: IRole = await this.rolesDao.getById(id);

    if (!foundRole) {
      throw new ErrorResponse(404, 'Not found!')
    }

    return foundRole
  }

  async getAll() {
    const roles = await this.rolesDao.getAll();

    return roles
  }

  async getByUser(user_id: string) {
    return await this.rolesDao.getUserRoles(user_id);
  }

  async delete(id: string) {
    await this.rolesDao.deleteById(id)
  }

  async createUserRole({ user_id, role_id }: ICreateUserRole) {

    const foundUserRole: IUserRole = await this.rolesDao.getUserRole({ user_id, role_id })

    if (foundUserRole) {
      return 'User already has this role!'
    }
    if (!(await this.rolesDao.getById(role_id))) {
      return 'Role does not exist!'
    }

    const user_role: IUserRole = await this.rolesDao.createUserRole({ user_id, role_id });

    return user_role
  }

  async deleteUserRole(user_id: string, role_id: number) {
    await this.rolesDao.deleteUserRole(user_id, role_id);
  }

  async getUserRolesAndModels(user_id: string) {
    const data = await this.rolesDao.getUserRolesAndModules(user_id)

    return data
  }

  async findByName(name: string) {
    const data = await this.rolesDao.getByName(name);
    if (!data) {
      throw new ErrorResponse(400, "Role was not found");
    }

    return data
  }
}