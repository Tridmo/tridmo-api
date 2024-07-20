import UserRolesDAO from './user_roles.dao';
import { ICreateUserRole, IUserRole } from './user_roles.interface';

export default class UserRoleService {
  private userRolesDao = new UserRolesDAO();

  create({ user_id, role_id }: ICreateUserRole) {
    return this.userRolesDao.create({
      user_id,
      role_id
    });
  }
  async updateByUser(user_id: string, { role_id }: ICreateUserRole) {
    return await this.userRolesDao.updateByUser(user_id, { role_id });
  }

  getByUserId(id: string) {
    return this.userRolesDao.getByUserId(id);
  }
  getByUserAndRole({ user_id, role_id }: { user_id: string; role_id: number }): Promise<IUserRole> {
    return this.userRolesDao.getByUserAndRole(user_id, role_id);
  }

  deleteById(id: number) {
    return this.userRolesDao.deleteById(id);
  }

  deleteByUserId(id: string) {
    return this.userRolesDao.deleteByUserId(id);
  }
}