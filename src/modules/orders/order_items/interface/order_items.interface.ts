export interface IOrderItem {
  id: string;
  cost_amount: number;
  model_id: string;
  order_id: string;
  created_at: Date;
}

export interface ICreateOrderItem {
  cost_amount?: number;
  model_id: string;
  order_id: string;
}