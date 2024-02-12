import { NextFunction, Request, Response } from "express";

import ProductService from "../products/products.service";
import OrderService from "./orders.service";
import OrderItemService from "./order_items/order_items.service";

import { ICreateOrderItem, IOrderItem } from "./order_items/interface/order_items.interface";
import { getFirst } from "../shared/utils/utils";
import { isEmpty } from "class-validator";
import flat from "flat";
import { RequestWithUser } from "../shared/interface/routes.interface";
import { IOrder } from "./interface/orders.interface";
import ErrorResponse from "../shared/utils/errorResponse";
 
export default class OrdersController {
    private ordersService = new OrderService()
    private orderItemsService = new OrderItemService()
    private productsService = new ProductService()

    public addItem = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user
            const user_id = user?.profile.id
            const itemData: ICreateOrderItem = req.body
            const product_id = itemData.product_id

            let activeOrder = getFirst(await this.ordersService.findByUserAndStatus(user_id, 1))

            const product = await this.productsService.findOne(product_id)
            if(!product) {
                throw new ErrorResponse(400, 'Product not found')
            } 

            const purchased_items = await this.orderItemsService.findPurchasedItemsByUser(user_id) 
    
            const purchasedModel = purchased_items.find((purchased_product)=>purchased_product['product_id'] == product_id) 
            
            if(purchasedModel) {
                throw new ErrorResponse(400, 'Already purchased')
            }
            
            const cost_amount = product["cost"]
            let total_cost_amount
            
            if (!activeOrder) {
                total_cost_amount = cost_amount
                activeOrder = await this.ordersService.create({total_cost_amount, user_id})
            }else{
                const foundItem = await this.orderItemsService.findByProductAndOrder(product_id, activeOrder.id)
                if(foundItem) throw new ErrorResponse(400, "Product already added")

                total_cost_amount = Number(activeOrder.total_cost_amount) + Number(cost_amount)
                await this.ordersService.update(activeOrder?.id, { total_cost_amount })
            }
            
            let order_id = activeOrder?.id

            const data = await this.orderItemsService.create({ cost_amount, product_id, order_id })

            res.status(200).json({
                success: true,
                data
            })
        } catch (error) {
            next(error)
        }
    }

    public removeItem = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { item_id } = req.params

            const item: IOrderItem = await this.orderItemsService.findOne(item_id)

            if(!item) throw new ErrorResponse(400, "Item not found")

            const order: IOrder = await this.ordersService.findOne(item.order_id)
            const product = await this.productsService.findOne(item.product_id)

            let total_cost_amount = Number(order.total_cost_amount) - Number(product["cost"])
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

    public getPurchases = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {id: user_id} = req.user.profile
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

    public getCurrent = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {id: user_id} = req.user.profile
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

    public checkout = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const {id: user_id} = req.user.profile
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