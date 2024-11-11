import { NextFunction, Request, Response } from "express";

import ModelService from "../models/models.service";
import OrderService from "./orders.service";
import OrderItemService from "./order_items/order_items.service";

import { ICreateOrderItem, IOrderItem } from "./order_items/interface/order_items.interface";
import { getFirst } from "../shared/utils/utils";
import { isEmpty } from "class-validator";
import flat from "flat";
import { CustomRequest } from "../shared/interface/routes.interface";
import { ICreateOrderer, IOrder } from "./interface/orders.interface";
import ErrorResponse from "../shared/utils/errorResponse";

export default class OrdersController {
  private ordersService = new OrderService()
  private orderItemsService = new OrderItemService()
  private modelsService = new ModelService()

  public addItem = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, full_name, ...itemData }: ICreateOrderItem & ICreateOrderer = req.body
      const model_id = itemData.model_id

      const model = await this.modelsService.findOne(model_id)
      if (!model) throw new ErrorResponse(400, 'Product not found');

      let orderer = await this.ordersService.findOrderer(req.body.phone)

      if (!orderer) {
        orderer = await this.ordersService.createOrderer({ phone, full_name })
        if (!orderer) throw new ErrorResponse(500, req.t.sth_went_wrong());
      }

      const orderer_id = orderer.id

      let activeOrder = getFirst(await this.ordersService.findByUserAndStatus(orderer_id, 1))

      const purchased_items = await this.orderItemsService.findPurchasedItemsByUser(orderer_id)

      const purchasedModel = purchased_items.find((purchased_product) => purchased_product['model_id'] == model_id)

      if (purchasedModel) {
        res.status(200).json({
          success: true,
          data: purchasedModel
        })
        return;
      }

      const cost_amount = model.furniture_cost
      let total_cost_amount

      if (!activeOrder) {
        total_cost_amount = cost_amount
        activeOrder = await this.ordersService.create({ total_cost_amount, orderer_id })
      } else {
        const foundItem = await this.orderItemsService.findByModelAndOrder(model_id, activeOrder.id)
        if (foundItem) throw new ErrorResponse(400, "Product already added")

        total_cost_amount = Number(activeOrder.total_cost_amount) + Number(cost_amount)
        await this.ordersService.update(activeOrder?.id, { total_cost_amount })
      }

      const data = await this.orderItemsService.create({ cost_amount: Number(cost_amount), model_id, order_id: activeOrder?.id })

      res.status(201).json({
        success: true,
        message: "Item added"
      })
    } catch (error) {
      next(error)
    }
  }

  public removeItem = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { item_id } = req.params

      const item: IOrderItem = await this.orderItemsService.findOne(item_id)

      if (!item) throw new ErrorResponse(400, "Item not found")

      const order: IOrder = await this.ordersService.findOne(item.order_id)
      const model = await this.modelsService.findOne(item.model_id)

      let total_cost_amount = Number(order.total_cost_amount) - Number(model.furniture_cost)
      await this.ordersService.update(order.id, { total_cost_amount })

      await this.orderItemsService.delete(item.id)

      res.status(200).json({
        success: true,
        message: "Item removed"
      })
    } catch (error) {
      next(error)
    }
  }

  public getByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = await this.ordersService.findByUser(id)

      const result = []
      for (const item of data) {
        result.push(flat.unflatten(item))
      }

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  public getPurchases = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: user_id } = req.user.profile
      const data = await this.ordersService.findByUser(user_id)

      const result = []
      for (const item of data) {
        result.push(flat.unflatten(item))
      }

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  public getCurrent = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: user_id } = req.user.profile
      const data = getFirst(await this.ordersService.findByUserAndStatus(user_id, 1))

      res.status(200).json({
        success: true,
        data: flat.unflatten(data)
      })
    } catch (error) {
      next(error)
    }
  }

  public getByUserAndStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, status } = req.params
      const data = await this.ordersService.findByUserAndStatus(id, Number(status))

      const result = []
      for (const item of data) {
        result.push(flat.unflatten(item))
      }

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = await this.ordersService.findOne(id)

      res.status(200).json({
        success: true,
        data: flat.unflatten(data)
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      await this.ordersService.delete(id)

      res.status(200).json({
        success: true,
        message: "Order deleted successfully"
      })
    } catch (error) {
      next(error)
    }
  }

  public checkout = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: user_id } = req.user.profile
      const data = await this.ordersService.checkout(user_id)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

}