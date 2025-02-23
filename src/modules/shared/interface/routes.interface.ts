import { Router, Request } from 'express';
import { User } from "@supabase/supabase-js";
import { IUser } from '../../users/users.interface';
import L from '../../../i18n/i18n-node';
import { TranslationFunctions } from '../../../i18n/i18n-types';
import { IUserRole } from '../../auth/roles/roles.interface';

export interface IReqUser extends User {
  profile: IUser
  roles: IUserRole[]
}

export interface Routes {
  path?: string;
  router: Router;
}

export interface RequestWithUser extends Request {
  user: IReqUser;
}
export interface CustomRequest extends Request {
  user: IReqUser;
  lang: string;
  t: TranslationFunctions;
  headers: Request['headers'] & {
    'x-user-company-name'?: string;
  }
}