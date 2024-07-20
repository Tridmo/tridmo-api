import { s3Vars } from '../../config/conf';
import { authVariables } from '../auth/variables';
import { ChatUtils } from '../chat/utils';
import { IRequestFile } from '../shared/interface/files.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import { deleteFile, uploadFile } from '../shared/utils/fileUpload';
import UsersDAO from './users.dao';
import { ICreateUser, IUpdateUser, IUser } from './users.interface';
import flat from 'flat';

export default class UsersService {
  private usersDao = new UsersDAO();

  async create({ full_name, email, user_id, birth_date, username, company_name, image_src }: ICreateUser): Promise<IUser> {

    return await this.usersDao.create({
      full_name,
      birth_date,
      username,
      company_name,
      email,
      user_id,
      image_src,
    });
  }

  async update(id: string, values: IUpdateUser, image?: IRequestFile): Promise<IUser> {
    const user = await this.usersDao.getById(id)
    if (!user) throw new ErrorResponse(404, 'User was not found');

    let updatedUser = null;

    if (Object.keys(values).length)
      updatedUser = await this.usersDao.update(id, values);

    if (image) {
      await deleteFile(s3Vars.imagesBucket, user.image_src)
      const uploadedCover = await uploadFile(image, "images/pfps", s3Vars.imagesBucket, user.username/*fileDefaults.model_cover*/)
      updatedUser = await this.usersDao.update(id, {
        image_src: uploadedCover[0].src
      })
      await new ChatUtils().syncUser(updatedUser)
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

  async getAll_admin(filters, sorts): Promise<IUser[]> {
    const data = await this.usersDao.getAll_admin(filters, sorts);

    data.forEach((user, index) => {
      data[index] = flat.unflatten(user)
    });

    return data
  }

  async count(filters): Promise<number> {
    return await this.usersDao.count(filters);
  }

  async getByEmail(email: string): Promise<IUser> {
    const data = this.usersDao.getByEmail(email);
    return flat.unflatten(data)
  }

  async getByUsername(username: string, filters?: any): Promise<IUser> {
    const data = await this.usersDao.getByUsername(username, filters);
    return flat.unflatten(data)
  }
  async getByUsernameForProfile(username: string, filters?: any): Promise<IUser> {
    const data = await this.usersDao.getByUsernameForProfile(username, filters);
    return flat.unflatten(data)
  }
  async getByUsername_admin(username: string, filters?: any): Promise<IUser> {
    const data = await this.usersDao.getByUsername_admin(username, filters);
    return flat.unflatten(data)
  }
  async getByUsername_min(username: string): Promise<IUser> {
    const data = await this.usersDao.getByUsername_min(username);
    return data
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