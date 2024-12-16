import { IImage } from "../../../shared/interface/files.interface";

export type ModelImageType = 'image' | 'info_image' | 'video';

export interface ICreateModelImage {
  model_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
  type?: ModelImageType;
}

export interface IModelImage {
  id: string;
  model_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
  type?: ModelImageType;
  created_at: Date;
  updated_at: Date;
}

export interface IModelImageWithImage extends IImage {
  id: string;
  model_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
  type?: ModelImageType;
  created_at: Date;
  updated_at: Date;
}