import { Router } from "express";
import { timberOrderStatusHandler } from "./bot/orderStatusUpdates";
import { timberSendOrderToChat } from "./bot/sendNewOrder";
import { Routes } from "../shared/interface/routes.interface";

export class WebhooksRoute implements Routes {
  public router = Router()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/telegram-bot/timber/send-new-order', (req, res) => timberSendOrderToChat(req, res))
    this.router.post('/telegram-bot/timber/update-order-status', (req, res) => timberOrderStatusHandler(req, res))
  }

}
