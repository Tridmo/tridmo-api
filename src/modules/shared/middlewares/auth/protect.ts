import { RequestWithUser } from "../../interface/routes.interface";
import UsersDAO from "../../../users/dao/users.dao";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { server } from "../../../../config/conf";
import ErrorResponse from "../../utils/errorResponse";
import { IDecodedToken } from "../../../auth/interface/auth.interface";
import supabase from "../../../../database/supabase/supabase";
import { getFirst } from "../../../shared/utils/utils";
import knexInstance from "../../../../database/connection";

const accessToken = server.accessToken

const protect = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try { 
    let authToken = ""
    const usersDao = new UsersDAO();
    const authorization = req.headers.authorization

    
    if (authorization && authorization.startsWith("Bearer ")) authToken = authorization.split(" ")[1];
    else throw new ErrorResponse(401, "Please login in to get access")

    
    const decodedToken = verify(authToken, accessToken.secret) as IDecodedToken;
    if (!decodedToken) throw new ErrorResponse(400, "Unauthorized!")

    const {data: {user}, error} = await supabase.auth.getUser(authToken)

    if (!user) throw new ErrorResponse(401, "User does not exist")
    if (error) throw new ErrorResponse(500, error.message)

    let profile = await usersDao.getByUserId(user.id)

    if (!profile) {
      profile = getFirst(
        await knexInstance('profiles')
        .insert({
            user_id: user.id,
            email: user.email, 
            full_name: 'Trimdo Admin', 
            language_id: 1 
        }).returning("*")
      )
      await knexInstance("user_roles").insert([
          { user_id: profile.id, role_id: 1 }
      ]);
    }

    req.user = { ...user, profile }
    
    next()

  } catch (error) {
    next(error)
  }
}

export default protect


