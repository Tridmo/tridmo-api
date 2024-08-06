export interface IInteriorView {
  id: string;
  interior_id: string;
  user_id: string;
  ip_address: string;
  client_agent: string;
  created_at: Date;
}

export interface ICreateInteriorView {
  ip_address?: string;
  client_agent?: string
  interior_id: string;
  user_id?: string;
}