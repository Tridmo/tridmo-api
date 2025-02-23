import { s3Vars } from '../../config';
import { authVariables } from '../auth/variables';
import { ChatUtils } from '../chat/utils';
import { IRequestFile } from '../shared/interface/files.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import { deleteFile, uploadFile } from '../shared/utils/fileUpload';
import UsersDAO from './users.dao';
import { ICreateUser, IUpdateUser, IUser } from './users.interface';
import flat from 'flat';
import { usersVariables } from './variables';
import { reqT } from '../shared/utils/language';
import supabase from '../../database/supabase/supabase';
import { fileDefaults } from '../shared/defaults/defaults';
import { User } from '@supabase/supabase-js';

export default class UsersService {
  private usersDao = new UsersDAO();

  async create({ full_name, email, user_id, username, company_name, image_src }: ICreateUser): Promise<IUser> {

    return await this.usersDao.create({
      full_name,
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
      const uploadedCover = await uploadFile({ files: image, folder: "images/pfps", bucketName: s3Vars.imagesBucket, fileName: user.username, dimensions: fileDefaults.avatar })
      updatedUser = await this.usersDao.update(id, {
        image_src: uploadedCover[0].src
      })
      await new ChatUtils().syncUser(updatedUser)
    }

    return updatedUser || user;
  }

  async updateUserPassword_admin(user_id: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.admin.updateUserById(user_id, { password });
    if (error) {
      console.error(error);
      throw new ErrorResponse(error.status, error.message)
    }
    return data.user
  }

  async getAll(filters, sorts): Promise<IUser> {
    const data = await this.usersDao.getAll(filters, sorts);

    data.forEach((user, index) => {
      const x = flat.unflatten(user)
      if (x.designs_count == undefined || x.designs_count == null || isNaN(x.designs_count)) x.designs_count = 0;
      if (x.tags_count == undefined || x.tags_count == null || isNaN(x.tags_count)) x.tags_count = 0;
      // x.rating = (Number(x.designs_count) * usersVariables.scoreForDesign) + (Number(x.tags_count) * usersVariables.scoreForTag);
      data[index] = x;
    });

    return data
  }

  async getAll_admin(filters, sorts): Promise<IUser[]> {
    const data = await this.usersDao.getAll_admin(filters, sorts);

    data.forEach((user, index) => {
      let x = flat.unflatten(user)
      if (x?.bans) {
        if (x?.bans?.length && x?.bans?.[0] == null) {
          x.bans = [];
          x.is_banned = false;
        }
        else if (x?.bans?.length) x.is_banned = true;
      }

      data[index] = x
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
    const data = flat.unflatten(
      await this.usersDao.getByUsername_admin(username, filters)
    )

    if (data?.bans) {
      if (data?.bans?.length && data?.bans?.[0] == null) {
        data.bans = [];
        data.is_banned = false;
      }
      else if (data?.bans?.length) data.is_banned = true;
    }

    return data
  }
  async getByUsername_min(username: string): Promise<IUser> {
    const data = await this.usersDao.getByUsername_min(username);
    return data
  }
  async getByEmail_min(email: string): Promise<IUser> {
    const data = await this.usersDao.getByEmail_min(email);
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

  async deleteAccount_admin(user_id: string) {
    const user = await this.usersDao.getById(user_id)
    if (!user) throw new ErrorResponse(404, reqT('user_404'))
    await new ChatUtils().deleteUser(user.id)
    await deleteFile(s3Vars.imagesBucket, user.image_src)
    await supabase.auth.admin.deleteUser(user.user_id)
  }
}