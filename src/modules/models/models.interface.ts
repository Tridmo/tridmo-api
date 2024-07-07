import { IInterior } from '../interiors/interiors.interface';
import { IFile, IFilePublic, IImage } from "../shared/interface/files.interface";
import { IDefaultQuery } from "../shared/interface/query.interface";

export interface IModel {
  id: string;
  brand_id: string;
  category_id: number;
  model_platform_id?: string;
  render_platform_id?: string;
  interaction_id: string;
  file_id: string;
  style_id: number;
  name: string;
  top: boolean;
  description: string;
  slug?: string;
  furniture_cost: number;
  availability: number;
  length: number;
  height: number;
  width: number;
  is_saved?: boolean;
  images?: any;
  file?: IFile | IFilePublic;
  used_interiors?: IInterior[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateModel {
  brand_id: string;
  category_id: number;
  model_platform_id: string;
  render_platform_id: string;
  interaction_id: string;
  file_id: string;
  style_id: number;
  name: string;
  top?: boolean;
  description: string;
  slug?: string;
  furniture_cost: number;
  availability: number;
  length: number;
  height: number;
  width: number;
}

export interface ICreateModelBody {
  brand_id: string;
  category_id: number;
  model_platform_id: string;
  render_platform_id: string;
  style_id: number;
  name: string;
  top?: boolean;
  description: string;
  furniture_cost: number;
  availability: number;
  length: number;
  height: number;
  width: number;
  materials: number[];
  colors: number[];
}


export interface IUpdateModel {
  brand_id?: string;
  category_id?: number;
  model_platform_id?: string;
  render_platform_id?: string;
  interaction_id?: string;
  file_id?: string;
  style_id?: number;
  name?: string;
  top?: boolean;
  description?: string;
  slug?: string;
  furniture_cost?: number;
  availability?: number;
  length?: number;
  height?: number;
  width?: number;
  colors?: string[];
  materials?: string[];
  removed_images?: string[];
}

export interface IGetModelsQuery extends IDefaultQuery {
  name?: string;
  top?: boolean;
  orderBy?: string;
  availability?: number;
  brand_id?: string;
  model_platforms?: string[];
  render_platforms?: string[];
  brands?: string[];
  styles?: string[];
  categories?: string[];
  colors?: string[];
  is_deleted?: boolean;
}

export interface IGetCountsQuery {
  all?: boolean;
  top?: boolean;
  available?: boolean;
  not_available?: boolean;
  deleted?: boolean;
}
export interface ICounts {
  count?: number;
  all?: number;
  top?: number;
  available?: number;
  not_available?: number;
  deleted?: number;
}

export interface IAddImageResult {
  cover?: IImage,
  images?: IImage[],
}