import axios from "axios";
import { Request, Response } from "express";
import moment from "moment-timezone";
import path from "path";
import { config } from 'dotenv'
import { OrderItem } from "../types";
import ErrorResponse from "../../shared/utils/errorResponse";
import logger from "../../../lib/logger";
config({ path: path.join('..', '..', '.env') });


export const timberSendOrderToChat = async (req: Request, res: Response) => {
  try {
    logger.info('Webhook: Send order to Telegram chat requested', { 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const token: string = process.env.TIMBER_TELEGRAM_BOT_TOKEN as string;
    const chatId: string = process.env.TIMBER_TELEGRAM_ORDERS_CHAT_ID as string;
    const siteUrl: string = process.env.TIMBER_SITE_URL as string;
    const messageParseMode: 'HTML' | 'MarkdownV2' = 'HTML';
    const api = (method: string): string => `${process.env.TELEGRAM_API_URL}/bot${token}/${method}`;
    const body = req.body;

    if (body && body.order) {
      const order = body.order;

      if (!order) {
        logger.warn('Webhook: Invalid order data received', { 
          body: JSON.stringify(body).substring(0, 200) 
        });
        throw new ErrorResponse(400, "Invalid data");
      }

      logger.info('Webhook: Processing order for Telegram notification', { 
        orderId: order.id,
        customerName: order.customerFullName,
        itemCount: order.items?.length || 0
      });

      const orderItemText = (item: OrderItem, index: number) => `
    ${index + 1}. ${item.name}
         🔢 Количество: ${item.quantity || 1}
         🔗 ${siteUrl}/products/${item.slug}\n
      `;

      const message = `
🛒 Новый заказ!\n
📦 Номер заказа: ${order.id}\n
👤 Заказчик: ${order.customerFullName}
☎ Номер телефона: ${order.customerPhoneNumber}\n
📋 Товары:\n${order.items.map((item, i) => orderItemText(item, i)).join('')}\n
📝 История обновлений:
      `;

      logger.info('Webhook: Sending order notification to Telegram', { 
        orderId: order.id,
        chatId: chatId?.substring(0, 5) + '***'
      });

      await axios.post(api('sendMessage'),
        {
          chat_id: chatId,
          text: message,
          parse_mode: messageParseMode,
          protect_content: true,
          link_preview_options: { is_disabled: true },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  "text": "⏳ В ожидании",
                  "callback_data": `update_order_status?status=pending`
                },
                {
                  "text": "📵 Нет ответа",
                  "callback_data": `update_order_status?status=no_answer`
                },
              ],
              [
                {
                  "text": "❌ Отменено",
                  "callback_data": `update_order_status?status=cancelled`
                },
                {
                  "text": "✅ Подтвержден",
                  "callback_data": `update_order_status?status=confirmed`
                }
              ]
            ]
          }
        }
      );

      logger.info('Webhook: Order notification sent to Telegram successfully', { 
        orderId: order.id 
      });
    } else {
      logger.warn('Webhook: No order data in request body', { 
        body: JSON.stringify(body).substring(0, 200) 
      });
    }

    res.status(200).send("Order has been sent");
  } catch (error) {
    logger.error('Webhook: Error sending order to Telegram', { 
      error: error.message,
      stack: error.stack,
      orderId: req.body?.order?.id,
      ip: req.ip
    });
    throw new ErrorResponse(500, "Server error");
  }
};
