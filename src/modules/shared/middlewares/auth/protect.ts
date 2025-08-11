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
import logger from "../../../../lib/logger";

const accessToken = server.accessToken

const protect = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization

    if (
      !authorization ||
      !authorization.startsWith("Bearer ") ||
      !authorization.split(" ")[1]
    ) {
      logger.warn('Unauthorized access attempt - missing or invalid auth header', { 
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      throw new ErrorResponse(401, req.t.unauthorized());
    }

    const authToken = authorization.split(" ")[1];

    if (!authToken || !authToken.length) {
      logger.warn('Unauthorized access attempt - empty token', { 
        ip: req.ip,
        path: req.path 
      });
      throw new ErrorResponse(401, req.t.unauthorized())
    }

    const decodedToken = verify(authToken, accessToken.secret) as IDecodedToken;
    if (!decodedToken) {
      logger.warn('Unauthorized access attempt - invalid token', { 
        ip: req.ip,
        path: req.path 
      });
      throw new ErrorResponse(401, req.t.unauthorized())
    }

    const { data: { user }, error } = await supabase.auth.getUser(authToken)
    if (!user) {
      logger.warn('Unauthorized access attempt - user not found in auth system', { 
        tokenUserId: decodedToken.user_id,
        ip: req.ip,
        path: req.path 
      });
      throw new ErrorResponse(404, req.t.user_404())
    }

    const profile = await new UsersDAO().getByUserId(user?.id)
    if (!profile) {
      logger.warn('Unauthorized access attempt - user profile not found', { 
        userId: user.id,
        ip: req.ip,
        path: req.path 
      });
      throw new ErrorResponse(403, req.t.access_denied())
    }

    const roles = await new UserRoleService().getByUserId(profile?.id)
    const bans = await new UserBanService().getByUserId(profile.id)

    if (bans.length) {
      bans.forEach(ban => {
        if (ban.permanent == true) {
          logger.warn('Banned user attempted access', { 
            userId: profile.id,
            banId: ban.id,
            ip: req.ip,
            path: req.path 
          });
          throw new ErrorResponse(403, req.t.you_are_banned(), 'banned')
        }
      })
    }

    // Log successful authentication
    logger.info('User authenticated successfully', { 
      userId: profile.id,
      roles: roles.map(r => r.role_name),
      path: req.path,
      method: req.method
    });

    req.user = { ...user, profile, roles }

    next()


  } catch (error) {
    if (error instanceof ErrorResponse) {
      // Re-throw our custom errors (already logged above)
      next(error);
    } else {
      // Log unexpected errors
      logger.error('Unexpected error in auth middleware', { 
        error: error.message,
        ip: req.ip,
        path: req.path 
      });
      
      next(
        new ErrorResponse(
          401,
          error.message,
          error.name == 'TokenExpiredError' ? 'token_expired' : 'unauthorized'
        )
      )
    }
  }
}

export default protect


