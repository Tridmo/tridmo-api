import { NextFunction, Request, Response } from "express";

import ChatTokenService from "./chat_tokens/chat_tokens.service";
import { CustomRequest } from "../shared/interface/routes.interface";
import { chatApi } from "../../config/conf";

export default class ChatController {
  private tokenService = new ChatTokenService()

  public getToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.tokenService.create(req.user.profile.id)

      res.status(201).json({
        success: true,
        access_token: data?.token,
        expires_in: chatApi.expiresIn,
      })
    } catch (error) {
      next(error)
    }
  }

}