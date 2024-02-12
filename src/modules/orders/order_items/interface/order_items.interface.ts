export interface IOrderItem {
    id: string;
    cost_amount: number;
    product_id: string;
    order_id: string;
    created_at: Date;
}

export interface ICreateOrderItem {
    cost_amount: number;
    product_id: string;
    order_id: string;
}