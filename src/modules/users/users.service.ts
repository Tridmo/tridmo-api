import { s3Vars } from '../../config/conf';
import { authVariables } from '../auth/variables';
import { IRequestFile } from '../shared/interface/files.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import { uploadFile } from '../shared/utils/fileUpload';
import UsersDAO from './users.dao';
import { ICreateUser, IUpdateUser, IUser } from './users.interface';
import flat from 'flat';

export default class UsersService {
  private usersDao = new UsersDAO();

  async create({ full_name, email, user_id, birth_date, username, company_name }: ICreateUser): Promise<IUser> {

    return await this.usersDao.create({
      full_name,
      birth_date,
      username,
      company_name,
      email,
      user_id,
    });
  }

  async update(id: string, values: IUpdateUser, image?: IRequestFile): Promise<IUser> {
    const user = this.usersDao.getById(id)
    if (!user) throw new ErrorResponse(404, 'User was not found');

    let updatedUser = null;

    if (Object.keys(values).length)
      updatedUser = await this.usersDao.update(id, values);

    if (image) {
      const uploadedCover = await uploadFile(image, "images/pfps", s3Vars.imagesBucket, /*fileDefaults.model_cover*/)
      updatedUser = await this.usersDao.update(id, {
        image_src: uploadedCover[0].src
      })
    }

    return updatedUser || user;
  }

  async getAll(filters, sorts): Promise<IUser> {
    const data = await this.usersDao.getAll(filters, sorts);

    data.forEach((user, index) => {
      data[index] = flat.unflatten(user)
    });

    return data
  }

  async count(filters): Promise<number> {
    return await this.usersDao.count(filters);
  }

  async getByEmail(email: string): Promise<IUser> {
    return this.usersDao.getByEmail(email);
  }

  async getByUsername(username: string): Promise<IUser> {
    return await this.usersDao.getByUsername(username);
  }

  async getVerifiedByEmail(email: string): Promise<IUser> {
    return await this.usersDao.getVerifiedByEmail(email);
  }

  async getUnverifiedByEmail(email: string): Promise<IUser> {
    return await this.usersDao.getUnverifiedByEmail(email);
  }

  async getById(id: string): Promise<IUser> {
    return await this.usersDao.getById(id);
  }
  async verify(id: string) {
    return await this.usersDao.verify(id);
  }
  async deleteByUserId(user_id: string) {
    return await this.usersDao.deleteById(user_id);
  }
}