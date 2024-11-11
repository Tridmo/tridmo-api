export interface IOrder {
  id: string;
  orderer_id: string;
  total_cost_amount: number;
  status: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateOrder {
  total_cost_amount?: number;
  orderer_id: string;
}

export interface IUpdateOrder {
  total_cost_amount?: number;
  status?: number;
}

export interface IOrderer {
  id: string;
  phone: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateOrderer {
  phone: string;
  full_name: string;
}