import { IImage } from "../../../shared/interface/files.interface";

export interface ICreateModelImage {
  model_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
}

export interface IModelImage {
  id: string;
  model_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
  created_at: Date;
  updated_at: Date;
}

export interface IModelImageWithImage extends IImage {
  id: string;
  model_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
  created_at: Date;
  updated_at: Date;
}