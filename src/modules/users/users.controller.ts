import flat from 'flat';
import { NextFunction, Request, Response } from 'express';
import UsersService from './users.service';
import { IGetUsersQuery, IUpdateUser, IUser } from './interface/users.interface';
import { RequestWithUser } from '../shared/interface/routes.interface';
import { isEmpty } from 'class-validator';
import { defaults } from '../shared/defaults/defaults';
import extractQuery from '../shared/utils/extractQuery';
import RoleService from '../auth/roles/roles.service';
import { ISearchQuery } from '../shared/interface/query.interface';
import { ICreateUserRole } from './user_roles/interface/user_roles.interface';
import UserRoleService from './user_roles/user_roles.service';
import supabase from '../../database/supabase/supabase';
import buildPagination from '../shared/utils/paginationBuilder';
import { authVariables } from '../auth/variables';

class UsersController {
  public usersService = new UsersService();
  public rolesService = new RoleService();
  public uRolesService = new UserRoleService();

  public getAll = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req
      const filters = extractQuery(query).filters
      const sorts = extractQuery(query).sorts

      const data = await this.usersService.getAll(filters, sorts)

      res.status(200).json({
        success: true,
        data: {
          users: data
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public getDesigners = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req
      const filters: IGetUsersQuery = extractQuery(query).filters
      const sorts = extractQuery(query).sorts

      filters.role_id = authVariables.roles.designer

      const data = await this.usersService.getAll(filters, sorts)
      const count = await this.usersService.count(filters)

      res.status(200).json({
        success: true,
        data: {
          designers: data,
          pagination: buildPagination(count, sorts)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public profile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user } = req

      const profile = await this.usersService.getByUsername(user.profile.username)

      const userData = {
        user_id: profile.id,
        created_at: user.created_at,
        full_name: profile.full_name,
        email: user.email,
        designs_count: profile.designs_count,
        username: profile.username,
        image_src: profile.image_src,
        birth_date: profile.birth_date,
        address: profile.address,
        phone: profile.phone,
        telegram: profile.telegram,
        portfolio_link: profile.portfolio_link,
        is_verified: Boolean(user.confirmed_at)
      }

      res.status(200).json({
        success: true,
        data: {
          user: userData,
        },
      });
    } catch (error) {
      next(error);
    }
  };


  public profileByUsername = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params

      const profile = await this.usersService.getByUsername(username)

      const userData = {
        user_id: profile.id,
        created_at: profile.created_at,
        full_name: profile.full_name,
        designs_count: profile.designs_count,
        username: profile.username,
        image_src: profile.image_src,
        birth_date: profile.birth_date,
        address: profile.address,
        phone: profile.phone,
        telegram: profile.telegram,
        portfolio_link: profile.portfolio_link,
      }

      res.status(200).json({
        success: true,
        data: {
          user: userData,
        },
      });
    } catch (error) {
      next(error);
    }
  };


  public checkUsername = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {

      const exists = await this.usersService.getByUsername(req.params.username)

      res.status(200).json({
        success: true,
        data: {
          exists: Boolean(exists),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: IUpdateUser = req.body
      const { user } = req
      const data = await this.usersService.update(user.profile.id, userData)

      res.status(200).json({ success: true, data: data, message: 'Changes saved successfully' });
    } catch (error) {
      next(error)
    }
  }

  public updateUserRole = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role_id }: ICreateUserRole = req.body
      const { id } = req.params

      const data = await this.uRolesService.updateByUser(id, { role_id })

      res.status(200).json({ success: true, data: data, message: 'Changes saved successfully' });
    } catch (error) {
      next(error)
    }
  }

  public deleteUserRole = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role_id } = req.body
      const { id } = req.params
      await this.rolesService.createUserRole({ user_id: id, role_id })

      res.status(200).json({ success: true, message: 'Changes saved successfully' });
    } catch (error) {
      next(error)
    }
  }

}

export default UsersController;