import { NextFunction, Request, Response } from "express";

import { CustomRequest } from "../shared/interface/routes.interface";

export default class FrontendController {

  public uploadDesignersImages = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      res.status(200).json({})
    } catch (error) {
      next(error)
    }
  }

  public uploadBrandsImages = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      res.status(200).json({})
    } catch (error) {
      next(error)
    }
  }

}