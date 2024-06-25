
export interface ICreateDownload {
  model_id: string;
  user_id: string;
}

export interface IFilterDownload {
  id?: string;
  model_id?: string;
  user_id?: string;
  brand_id?: string;
}
