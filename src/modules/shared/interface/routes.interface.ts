import { Router, Request } from 'express';
import {User} from "@supabase/supabase-js";
import { IUser } from '../../users/interface/users.interface';

interface IReqUser extends User {
  profile: IUser
}

export interface Routes {
  path?: string;
  router: Router;
}

export interface RequestWithUser extends Request {
  user: IReqUser;
}