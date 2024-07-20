import { CustomRequest } from "../../interface/routes.interface";
import SessionDAO from "../../../auth/dao/sessions.dao";
import UsersDAO from "../../../users/users.dao";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { server } from "../../../../config/conf";
import { IDecodedToken } from "../../../auth/interface/auth.interface";
import supabase from "../../../../database/supabase/supabase";
import UserRoleService from "../../../users/user_roles/user_roles.service";

const accessToken = server.accessToken

const checkUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {

    let authToken = ""
    const authorization = req.headers.authorization
    if (!authorization) { next(); return }
    else if (!authorization.startsWith("Bearer ")) { next(); return }
    else authToken = authorization.split(" ")[1];

    if (!authToken) { next(); return }

    const decodedToken = verify(authToken, accessToken.secret) as IDecodedToken;

    if (!decodedToken) { next(); return }

    const { data: { user }, error } = await supabase.auth.getUser(authToken)

    if (!user) { next(); return }

    const profile = await new UsersDAO().getByUserId(user?.id)
    const roles = await new UserRoleService().getByUserId(profile?.id)

    req.user = { ...user, profile, roles }

    next()

  } catch (error) {
    next(error)
  }
}

export default checkUser


