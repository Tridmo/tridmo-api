import flat from 'flat';
import { NextFunction, Request, Response } from 'express';
import UsersService from './users.service';
import { IUpdateUser, IUser } from './interface/users.interface';
import { RequestWithUser } from '../shared/interface/routes.interface';
import OrderService from '../orders/orders.service';
import { isEmpty } from 'class-validator';
import { defaults } from '../shared/defaults/defaults';
import extractQuery from '../shared/utils/extractQuery';
import RoleService from '../auth/roles/roles.service';
import { ISearchQuery } from '../shared/interface/query.interface';
import { ICreateUserRole } from './user_roles/interface/user_roles.interface';
import UserRoleService from './user_roles/user_roles.service';
import supabase from '../../database/supabase/supabase';

class UsersController {
  public usersService = new UsersService();
  public ordersService = new OrderService();
  public rolesService = new RoleService();
  public uRolesService = new UserRoleService();

  public getAll = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req
      let { key, keyword }: ISearchQuery = query
      const filters = extractQuery(query).filters
      const sorts = extractQuery(query).sorts

      key = key ? key : "full_name"
      keyword = keyword ? keyword : ""

      if (filters["role"] && !isEmpty(filters["role"])) {
        const role = await this.rolesService.findByName(filters["role"])
        filters["role_id"] = role.id
        delete filters["role"]
      }

      const data = await this.usersService.getAll(key, keyword, filters, sorts)

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user } = req
      const { profile } = user

      const userData = {
        user_id: profile.id,
        created_at: user.created_at,
        full_name: profile.full_name,
        email: user.email,
        username: profile.username,
        birth_date: profile.birth_date,
        is_verified: Boolean(user.confirmed_at)
      }

      res.status(200).json({ success: true, data: userData, message: 'Current user' });
    } catch (error) {
      next(error);
    }
  };

  public profile = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user } = req
      const { profile } = user

      const userData = {
        user_id: profile.id,
        created_at: user.created_at,
        full_name: profile.full_name,
        email: user.email,
        username: profile.username,
        birth_date: profile.birth_date,
        is_verified: Boolean(user.confirmed_at)
      }

      let orders = await this.ordersService.findByUser(profile.user_id)

      orders = flat.unflatten(orders)

      res.status(200).json({
        success: true,
        data: {
          user: userData,
          purchased_products: orders
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