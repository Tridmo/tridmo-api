export interface IInteriorModel {
  id: string;
  model_id: string;
  interior_id: string;
  interior_image_id: string;
  text?: string;
  x: number;
  y: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateInteriorModel {
  model_id: string;
  interior_id: string;
  interior_image_id: string;
  text?: string;
  x: number;
  y: number;
}

export interface IInteriorModelBody {
  model_id: string;
  interior_id: string;
  interior_image_id: string;
  text?: string;
  x: number;
  y: number;
}

export interface IUpdateInteriorModel {
  text?: string;
  x?: number;
  y?: number;
}

export interface IFilterInteriorModel {
  id?: string;
  model_id?: string;
  interior_id?: string;
  interior_image_id?: string;
}