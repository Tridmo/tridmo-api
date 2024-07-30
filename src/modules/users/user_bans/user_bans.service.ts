import UserBansDAO from './user_bans.dao';
import { ICreateUserBan, IUserBan } from './user_bans.interface';

export default class UserBanService {
  private userBansDao = new UserBansDAO();

  create(values: ICreateUserBan) {
    return this.userBansDao.create(values);
  }
  async updateByUser(user_id: string, values: ICreateUserBan) {
    return await this.userBansDao.updateByUser(user_id, values);
  }
  getByUserId(id: string): Promise<IUserBan[]> {
    return this.userBansDao.getByUserId(id);
  }
  getPermanentByUser(id: string) {
    return this.userBansDao.getByUserId(id);
  }
  deleteById(id: string) {
    return this.userBansDao.deleteById(id);
  }
  deleteByUserId(id: string) {
    return this.userBansDao.deleteByUserId(id);
  }
}