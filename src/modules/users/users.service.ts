import UsersDAO from './dao/users.dao';
import { ICreateUser, IUpdateUser, IUser } from './interface/users.interface';

export default class UsersService {
  private usersDao = new UsersDAO();

  create({ full_name, email, user_id, birth_date, username }: ICreateUser) {

    return this.usersDao.create({
      full_name,
      birth_date,
      username,
      email,
      user_id,
    });
  }

  update(id: string, values: IUpdateUser) {
    return this.usersDao.update(id, values);
  }

  getAll(key: string, keyword: string, filters, sorts) {
    return this.usersDao.getAll(key, keyword, filters, sorts);
  }

  getByEmail(email: string): Promise<IUser> {
    return this.usersDao.getByEmail(email);
  }

  getByUsername(username: string): Promise<IUser> {
    return this.usersDao.getByUsername(username);
  }

  getVerifiedByEmail(email: string): Promise<IUser> {
    return this.usersDao.getVerifiedByEmail(email);
  }

  getUnverifiedByEmail(email: string): Promise<IUser> {
    return this.usersDao.getUnverifiedByEmail(email);
  }

  getById(id: string): Promise<IUser> {
    return this.usersDao.getById(id);
  }
  verify(id: string) {
    return this.usersDao.verify(id);
  }
  deleteByUserId(user_id: string) {
    return this.usersDao.deleteById(user_id);
  }
}