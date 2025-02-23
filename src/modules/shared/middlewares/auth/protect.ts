import { CustomRequest, RequestWithUser } from "../../interface/routes.interface";
import UsersDAO from "../../../users/users.dao";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { server } from "../../../../config";
import ErrorResponse from "../../utils/errorResponse";
import { IDecodedToken } from "../../../auth/interface/auth.interface";
import supabase from "../../../../database/supabase/supabase";
import UserRoleService from "../../../users/user_roles/user_roles.service";
import UserBanService from "../../../users/user_bans/user_bans.service";

const accessToken = server.accessToken

const protect = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization

    if (
      !authorization ||
      !authorization.startsWith("Bearer ") ||
      !authorization.split(" ")[1]
    ) throw new ErrorResponse(401, req.t.unauthorized());

    const authToken = authorization.split(" ")[1];

    if (!authToken || !authToken.length) throw new ErrorResponse(401, req.t.unauthorized())

    const decodedToken = verify(authToken, accessToken.secret) as IDecodedToken;
    if (!decodedToken) throw new ErrorResponse(401, req.t.unauthorized())

    const { data: { user }, error } = await supabase.auth.getUser(authToken)
    if (!user) throw new ErrorResponse(404, req.t.user_404())

    const profile = await new UsersDAO().getByUserId(user?.id)
    if (!profile) throw new ErrorResponse(403, req.t.access_denied())

    const roles = await new UserRoleService().getByUserId(profile?.id)
    const bans = await new UserBanService().getByUserId(profile.id)

    if (bans.length) {
      bans.forEach(ban => {
        if (ban.permanent == true) throw new ErrorResponse(403, req.t.you_are_banned(), 'banned')
      })
    }

    req.user = { ...user, profile, roles }

    next()


  } catch (error) {
    next(
      new ErrorResponse(
        401,
        error.message,
        error.name == 'TokenExpiredError' ? 'token_expired' : 'unauthorized'
      )
    )
  }
}

export default protect


