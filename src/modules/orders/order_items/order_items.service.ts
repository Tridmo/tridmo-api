import { isEmpty } from "class-validator";
import ErrorResponse from "../../shared/utils/errorResponse";
import OrderItemsDAO from "./dao/order_items.dao";

import { ICreateOrderItem } from "./interface/order_items.interface";

export default class OrderItemService {
  private orderItemsDao = new OrderItemsDAO()

  async create({ cost_amount, model_id, order_id }: ICreateOrderItem) {
    const data: ICreateOrderItem = await this.orderItemsDao.create({ cost_amount, model_id, order_id })
    return data
  }

  async findOne(id: string) {
    const data = await this.orderItemsDao.getById(id);
    if (isEmpty(data)) {
      throw new ErrorResponse(400, "Order item was not found");
    }

    return data
  }

  async findByOrder(id: string) {
    const data = await this.orderItemsDao.getByOrderId(id);
    return data
  }

  async findPurchasedItemsByUser(user_id: string) {
    const data = await this.orderItemsDao.getPurchasedItems(user_id);
    return data
  }


  async findByModel(model_id: string) {
    const data = await this.orderItemsDao.getByModelId(model_id);
    return data
  }

  async findByModelAndOrder(model_id: string, order_id: string) {
    const data = await this.orderItemsDao.getByModelIdAndOrderId(model_id, order_id);
    return data
  }

  async delete(id: string) {
    await this.orderItemsDao.deleteById(id);
  }
  async deleteByModel(model_id: string) {
    await this.orderItemsDao.deleteByModel(model_id);
  }
}