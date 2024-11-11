import { isEmpty } from "class-validator";
import { ICreateOrder, ICreateOrderer, IOrder, IOrderer, IUpdateOrder } from "./interface/orders.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import OrdersDAO from "./dao/orders.dao";
import { getFirst } from "../../modules/shared/utils/utils";

export default class OrderService {
  private ordersDao = new OrdersDAO()
  // private orderItemsDao = new OrderItemsDAO()

  async create({ total_cost_amount, orderer_id }: ICreateOrder): Promise<IOrder> {
    return await this.ordersDao.create({ total_cost_amount, orderer_id })
  }

  async createOrderer({ phone, full_name }: ICreateOrderer): Promise<IOrderer> {
    return await this.ordersDao.createOrderer({ phone, full_name })
  }

  async update(id: string, values: IUpdateOrder) {
    const foundOrder: IOrder = await this.ordersDao.getById(id);
    if (isEmpty(foundOrder)) throw new ErrorResponse(400, "Order was not found");
    const data: IOrder = await this.ordersDao.update(id, values)
    return data
  }

  async findOne(id: string) {
    const data = await this.ordersDao.getById(id);
    if (isEmpty(data)) throw new ErrorResponse(400, "Order was not found");
    return data
  }

  async findByUser(id: string) {
    const data = await this.ordersDao.getByUserId(id);
    return data
  }

  async findOrderer(phone: string) {
    return await this.ordersDao.getOrderer({ phone });
  }

  async findByStatus(status: number) {
    const data = await this.ordersDao.getByStatus(status);
    return data
  }

  async findByUserAndStatus(id: string, status: number) {
    const data = await this.ordersDao.getByUserAndStatus(id, status);
    return data
  }

  async findActiveByUser(user_id: string) {
    const data = await this.ordersDao.getActiveByUser(user_id);
    return data
  }

  async delete(id: string) {
    await this.ordersDao.deleteById(id);
  }

  async checkout(user_id) {
    const order = getFirst(await this.findByUserAndStatus(user_id, 1))

    // const customized_product = await createPaymentProduct(PAYMENT.PRODUCT, order);
    // return customized_product

    return order
  }
}