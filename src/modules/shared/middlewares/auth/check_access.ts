import { CustomRequest } from "../../interface/routes.interface";
import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../../utils/errorResponse";
import RolesService from "../../../auth/roles/roles.service";
import logger from "../../../../lib/logger";


const check_access = (module_name: string) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const {
        user
      } = req

      logger.debug('Checking access permission', { 
        userId: user.profile.id,
        username: user.profile.username,
        module: module_name,
        path: req.path,
        method: req.method 
      });

      const rolesservice = new RolesService()

      let all_modules = await rolesservice.getUserRolesAndModels(user.profile.id)

      const existance = all_modules.find(e => e["access_module_name"] == module_name);

      if (!existance) {
        logger.warn('Access denied - insufficient permissions', { 
          userId: user.profile.id,
          username: user.profile.username,
          module: module_name,
          path: req.path,
          method: req.method,
          userModules: all_modules.map(m => m["access_module_name"]),
          ip: req.ip 
        });
        throw new ErrorResponse(403, "Access denied!")
      }

      logger.info('Access granted', { 
        userId: user.profile.id,
        username: user.profile.username,
        module: module_name,
        path: req.path,
        method: req.method 
      });

      next()

    } catch (error) {
      next(error)
    }
  }
}

export default check_access;