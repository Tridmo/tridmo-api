import axios from "axios";
import { Request, Response } from "express";
import moment from "moment-timezone";
import path from "path";
import { config } from 'dotenv'
import logger from "../../../lib/logger";
config({ path: path.join('..', '..', '.env') });


export const timberOrderStatusHandler = async (req: Request, res: Response) => {
  try {
    logger.info('Webhook: Order status update requested', { 
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const TELEGRAM_BOT_TOKEN = process.env.TIMBER_TELEGRAM_BOT_TOKEN;
    const body = req.body;

    if (body.callback_query) {
      const chatId = body.callback_query.message.chat.id;
      const messageId = body.callback_query.message.message_id;
      const userName = body.callback_query.from.first_name || "Неизвестный";
      const userUsername = body.callback_query.from.username;
      const originalMessage = body.callback_query.message.text;
      const originalReplyMarkup = body.callback_query.message.reply_markup;

      const [action, params] = body.callback_query.data.split("?");
      const searchParams = new URLSearchParams(params);

      if (action === "update_order_status") {
        const status = searchParams.get("status");

        logger.info('Webhook: Processing order status update', { 
          status, 
          operatorName: userName,
          operatorUsername: userUsername,
          chatId: chatId?.toString()?.substring(0, 5) + '***'
        });

        const statusText =
          status == "confirmed"
            ? "✅ Заказ подтвержден"
            : status == "cancelled"
              ? "❌ Заказ отменен"
              : status == "no_answer"
                ? "📵 Нет ответа от заказчика"
                : "⏳ В ожидании";

        const updatedText =
          originalMessage +
          `\n\n${moment(new Date().getTime())
            .tz("Asia/Tashkent")
            .format("DD-MM-YYYY HH:mm")}\n ${statusText}\n📞 Оператор: ${userName}${userUsername ? ` | @${userUsername}` : ""
          }`;

        logger.info('Webhook: Updating order message in Telegram', { 
          messageId, 
          newStatus: status 
        });

        await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
          {
            chat_id: chatId,
            message_id: messageId,
            text: updatedText,
            parse_mode: "HTML",
            reply_markup: originalReplyMarkup,
          }
        );

        await axios.post(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
          {
            callback_query_id: body.callback_query.id,
            text: "✅ Заказ обновлен!",
            show_alert: false,
          }
        );

        logger.info('Webhook: Order status updated successfully', { 
          status, 
          messageId, 
          operatorName: userName 
        });

        return res.status(200).send("Message updated");
      }
    }

    logger.warn('Webhook: No callback query found in request', { 
      body: JSON.stringify(body).substring(0, 200) 
    });

    res.status(400).send("No callback query");
  } catch (error) {
    logger.error('Webhook: Error updating order status', { 
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).send("Server error");
  }
};
