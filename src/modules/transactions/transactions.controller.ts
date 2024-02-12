import flat  from 'flat';
import { NextFunction, Request, Response } from "express"; 
import OrderService from "./../../modules/orders/orders.service";
import { ICreateTransaction } from "./interface/transactions.interface";
import TransactionService from "./transactions.service";
import { markAsProcessed } from '../../modules/shared/utils/payment';

export default class TransactionsController {
    private transactionsService = new TransactionService()
    private ordersService = new OrderService()

    public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log(req.body);
            
            const {
                transactionId,
                productId,
                firstName,
                lastName,
                email,
                organization,
                income,
                taxAmount,
                taxRate,
                amountTotal,
                currency,
                eventId,
                transactionType,
                country,
                payload
            } = req.body

            let data; 
            const transaction = await this.transactionsService.getById(transactionId)

            if(!transaction) {
                const order = await this.ordersService.findOne(payload);
                
                data = await this.transactionsService.create({
                    id: transactionId,
                    payment_product_id: productId,
                    customer_first_name: firstName,
                    customer_last_name: lastName,
                    currency: currency,
                    tax_amount: taxAmount,
                    tax_rate: taxRate,
                    event_id: eventId,
                    transaction_type: transactionType,
                    order_id: payload,
                    total_amount: amountTotal,
                    income: income,
                    organization,
                    customer_email: email,
                    country,
                    user_id: order.user_id
                })

                await this.ordersService.update(payload, {
                    status: 2
                });
                
            } else {
                data = await this.transactionsService.update(transactionId, {
                    income: income,
                    tax_amount: taxAmount,
                    tax_rate: taxRate,
                    event_id: eventId,
                    currency: currency,
                    total_amount: amountTotal,
                })


                const markedAsProcessed = await markAsProcessed(data.id)
                console.log(markedAsProcessed);
                
            }

            res.status(200).json({
                success: true, 
            })
        } catch (error) {
            next(error)
        }
    } 

    public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params
            let data = await this.transactionsService.getById(id)
            
            data = flat.unflatten(data)
            
            res.status(200).json({
                success: true,
                data: {
                  transaction: data
                }
            })
        } catch (error) {
            next(error)
        }
    }  
}