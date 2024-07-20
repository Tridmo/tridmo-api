import flat from 'flat';
import { NextFunction, Request, Response } from 'express';
import UsersService from './users.service';
import { IGetUsersQuery, IUpdateUser, IUser } from './users.interface';
import { CustomRequest } from '../shared/interface/routes.interface';
import { isEmpty } from 'class-validator';
import { defaults } from '../shared/defaults/defaults';
import extractQuery from '../shared/utils/extractQuery';
import RoleService from '../auth/roles/roles.service';
import { ISearchQuery } from '../shared/interface/query.interface';
import { ICreateUserRole } from './user_roles/user_roles.interface';
import UserRoleService from './user_roles/user_roles.service';
import supabase from '../../database/supabase/supabase';
import buildPagination from '../shared/utils/paginationBuilder';
import { authVariables } from '../auth/variables';
import { reqT } from '../shared/utils/language';
import { UploadedFile } from 'express-fileupload';
import DownloadsService from '../downloads/downloads.service';
import ErrorResponse from '../shared/utils/errorResponse';
import BrandService from '../brands/brands.service';
import InteriorsDAO from '../interiors/interiors.dao';
import InteriorModelsDAO from '../interior_models/interior_models.dao';
import DownloadsDao from '../downloads/downloads.dao';

class UsersController {
  public usersService = new UsersService();
  public rolesService = new RoleService();
  public uRolesService = new UserRoleService();

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
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

  public getAll_admin = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req
      const filters = extractQuery(query).filters
      const sorts = extractQuery(query).sorts

      const data = await this.usersService.getAll_admin(filters, sorts)
      const count = await this.usersService.count(filters)

      res.status(200).json({
        success: true,
        data: {
          users: data,
          pagination: buildPagination(count, sorts)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public getDesigners = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
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

  public profile = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user } = req

      const profile = await this.usersService.getByUsernameForProfile(user.profile.username)
      console.log(profile);

      if (!profile) throw new ErrorResponse(404, req.t.user_404())

      const isBrandAdmin = profile.role.id == authVariables.roles.brand
      if (isBrandAdmin) {
        var brand = await new BrandService().findByAdmin(profile.id)
      }

      const userData = {
        ...(isBrandAdmin ? { is_brand: true, brand } : {}),
        user_id: profile.id,
        created_at: user.created_at,
        full_name: profile.full_name,
        email: user.email,
        designs_count: profile.designs_count,
        username: profile.username,
        company_name: profile.company_name,
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


  public profileByUsername = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params

      const profile = await this.usersService.getByUsername(username)
      if (!profile) throw new ErrorResponse(404, req.t.user_404())

      const userData = {
        user_id: profile.id,
        created_at: profile.created_at,
        full_name: profile.full_name,
        designs_count: profile.designs_count,
        username: profile.username,
        company_name: profile.company_name,
        image_src: profile.image_src,
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

  public profileByUsername_admin = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params

      const profile = await this.usersService.getByUsername_admin(username, req.query);
      if (!profile) throw new ErrorResponse(404, req.t.user_404())

      const isBrandAdmin = profile.role.id == authVariables.roles.brand
      if (isBrandAdmin) {
        var brand = await new BrandService().findByAdmin(profile.id)
      }

      const designs_count = await new InteriorsDAO().count({ author: profile?.id })
      const tags_count = await new InteriorModelsDAO().count({ user_id: profile?.id, brand_id: req.query.downloads_from_brand as string })
      const downloads_count = await new DownloadsDao().count({ user_id: profile?.id, brand_id: req.query.downloads_from_brand as string })

      console.log(
        designs_count,
        tags_count,
        downloads_count,
      );

      const userData = {
        ...(isBrandAdmin ? { is_brand: true, brand } : {}),
        user_id: profile.id,
        created_at: profile.created_at,
        full_name: profile.full_name,
        designs_count: designs_count,
        tags_count: tags_count,
        downloads_count: downloads_count,
        username: profile.username,
        email: profile.email,
        company_name: profile.company_name,
        image_src: profile.image_src,
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


  public getUserDownloads = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filters, sorts } = extractQuery(req.query)

      const downloadService = new DownloadsService()

      const profile = await this.usersService.getByUsername_min(req.params.username);
      if (!profile) throw new ErrorResponse(404, req.t.user_404())

      const downloads = await downloadService.findWithModelBy({ ...filters, user_id: profile.id }, sorts)
      const count = await downloadService.count({ user_id: profile.id })

      res.status(200).json({
        success: true,
        data: {
          count,
          downloads,
          pagination: buildPagination(count, sorts)
        },
      });
    } catch (error) {
      next(error);
    }
  };


  public checkUsername = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
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

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: IUpdateUser = req.body
      const { user } = req
      const data = await this.usersService.update(
        user.profile.id,
        userData,
        req.files && req.files[defaults.reqImageName] ? req.files[defaults.reqImageName] as UploadedFile : null,

      )

      res.status(200).json({ success: true, data: data, message: reqT('saved_successfully') });
    } catch (error) {
      next(error)
    }
  }

  public updateUserRole = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role_id }: ICreateUserRole = req.body
      const { id } = req.params

      const data = await this.uRolesService.updateByUser(id, { role_id })

      res.status(200).json({ success: true, data: data, message: reqT('saved_successfully') });
    } catch (error) {
      next(error)
    }
  }

  public deleteUserRole = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { role_id } = req.body
      const { id } = req.params
      await this.rolesService.createUserRole({ user_id: id, role_id })

      res.status(200).json({ success: true, message: reqT('saved_successfully') });
    } catch (error) {
      next(error)
    }
  }

}

export default UsersController;