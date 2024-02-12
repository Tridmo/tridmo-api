export interface IOrder {
    id: string;
    total_cost_amount: number;
    status: number;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateOrder {
    total_cost_amount: number;
    user_id: string;
} 

export interface IUpdateOrder {
    total_cost_amount?: number;
    status?: number;
} 