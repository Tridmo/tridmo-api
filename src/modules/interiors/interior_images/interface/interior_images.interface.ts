import { IImage } from "../../../shared/interface/files.interface";

export interface ICreateInteriorImage {
  interior_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
}

export interface IInteriorImage {
  id: string;
  interior_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
  created_at: Date;
  updated_at: Date;
}

export interface IInteriorImageWithImage extends IImage {
  id: string;
  interior_id: string;
  image_id: string;
  is_main: boolean;
  index: number;
  created_at: Date;
  updated_at: Date;
}