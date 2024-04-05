import { RequestWithUser } from "../../interface/routes.interface";
import SessionDAO from "../../../auth/dao/sessions.dao";
import UsersDAO from "../../../users/dao/users.dao";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { server } from "../../../../config/conf";
import ErrorResponse from "../../utils/errorResponse";
import { IDecodedToken } from "../../../auth/interface/auth.interface";
import knexInstance from "../../../../database/connection";
import { getFirst } from "../../../shared/utils/utils";
import supabase from "../../../../database/supabase/supabase";

const accessToken = server.accessToken

const checkUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {

    const usersDao = new UsersDAO();
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

    const profile = await usersDao.getByUserId(user.id)

    req.user = { ...user, profile }

    next()

  } catch (error) {
    next(error)
  }
}

export default checkUser


