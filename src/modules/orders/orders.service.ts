import { isEmpty } from "class-validator";
import { ICreateOrder, ICreateOrderer, IOrder, IOrderer, IUpdateOrder } from "./interface/orders.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import OrdersDAO from "./dao/orders.dao";
import { getFirst } from "../../modules/shared/utils/utils";
import logger from "../../lib/logger";

export default class OrderService {
  private ordersDao = new OrdersDAO()
  // private orderItemsDao = new OrderItemsDAO()

  async create({ total_cost_amount, orderer_id }: ICreateOrder): Promise<IOrder> {
    logger.info('Creating new order', { 
      total_cost_amount, 
      orderer_id 
    });

    const order = await this.ordersDao.create({ total_cost_amount, orderer_id });
    
    logger.info('Order created successfully', { 
      orderId: order.id,
      total_cost_amount: order.total_cost_amount 
    });

    return order;
  }

  async createOrderer({ phone, full_name }: ICreateOrderer): Promise<IOrderer> {
    logger.info('Creating new orderer', { 
      phone: phone?.substring(0, 3) + '***', // Partially obscure phone
      full_name 
    });

    const orderer = await this.ordersDao.createOrderer({ phone, full_name });
    
    logger.info('Orderer created successfully', { ordererId: orderer.id });

    return orderer;
  }

  async update(id: string, values: IUpdateOrder) {
    logger.info('Updating order', { 
      orderId: id,
      updateFields: Object.keys(values) 
    });

    const foundOrder: IOrder = await this.ordersDao.getById(id);
    if (isEmpty(foundOrder)) {
      logger.warn('Order update failed - order not found', { orderId: id });
      throw new ErrorResponse(400, "Order was not found");
    }

    const data: IOrder = await this.ordersDao.update(id, values);
    
    logger.info('Order updated successfully', { 
      orderId: id,
      updatedFields: Object.keys(values) 
    });

    return data;
  }

  async findOne(id: string) {
    logger.debug('Fetching order by ID', { orderId: id });

    const data = await this.ordersDao.getById(id);
    if (isEmpty(data)) {
      logger.warn('Order not found', { orderId: id });
      throw new ErrorResponse(400, "Order was not found");
    }
    return data;
  }

  async findByUser(id: string) {
    logger.debug('Fetching orders by user ID', { userId: id });

    const data = await this.ordersDao.getByUserId(id);
    
    logger.debug('Orders fetched for user', { 
      userId: id, 
      orderCount: data?.length || 0 
    });

    return data;
  }

  async findOrderer(phone: string) {
    logger.debug('Finding orderer by phone', { 
      phone: phone?.substring(0, 3) + '***' 
    });

    return await this.ordersDao.getOrderer({ phone });
  }

  async findByStatus(status: number) {
    logger.debug('Fetching orders by status', { status });

    const data = await this.ordersDao.getByStatus(status);
    
    logger.debug('Orders fetched by status', { 
      status, 
      orderCount: data?.length || 0 
    });

    return data;
  }

  async findByUserAndStatus(id: string, status: number) {
    logger.debug('Fetching orders by user and status', { userId: id, status });

    const data = await this.ordersDao.getByUserAndStatus(id, status);
    
    logger.debug('Orders fetched by user and status', { 
      userId: id, 
      status, 
      orderCount: data?.length || 0 
    });

    return data;
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