import { IDefaultQuery } from "../shared/interface/query.interface";
import { IImage } from '../shared/interface/files.interface';
import { IModel } from '../models/models.interface';

export interface IInterior {
  user_id: string;
  id: string;
  name: string;
  status: number;
  category_id: number;
  render_platform_id: string;
  style_id: number;
  interaction_id: string;
  slug: string;
  is_saved?: boolean;
  is_liked?: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  cover?: IImage;
  used_models?: IModel[];
  images?: IImage[];
}

export interface ICreateInterior {
  user_id: string;
  status?: number;
  render_platform_id: string;
  style_id?: number;
  category_id: number;
  interaction_id: string;
  slug: string;
  name: string;
  tags?: any[];
}

export interface ICreateInteriorBody {
  render_platform_id: string;
  style_id?: number;
  status?: number;
  category_id: number;
  name: string;
  description: string;
  tags?: any[];
}

export interface IUpdateInterior {
  render_platform_id?: string;
  style_id?: number;
  category_id?: number;
  interaction_id?: string;
  slug?: string;
  name?: string;
  is_deleted?: boolean;
  removed_images?: string[];
}

export interface IGetInteriorsQuery extends IDefaultQuery {
  name?: string;
  status?: number | number[];
  styles?: string[];
  categories?: string[];
  platforms?: string[];
  author?: string;
  is_deleted?: boolean;
  has_models_of_brand?: string;
}

export interface IAddImageResult {
  cover?: IImage,
  images?: IImage[],
}

export interface IInteriorLike {
  id: string;
  interior_id: string;
  notification_id: string | null,
  user_id: string;
  created_at: Date;
}

export interface ICreateInteriorLike {
  interior_id: string,
  notification_id?: string | null,
  user_id: string,
}

export interface IFilterInteriorLike {
  interior_id?: string,
  notification_id?: string,
  user_id?: string,
}

