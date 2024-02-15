import { IImage } from "../../shared/interface/files.interface";
import { IDefaultQuery } from "../../shared/interface/query.interface";

export interface IModel {
  id: string;
  brand_id: number;
  category_id: number;
  model_platform_id: string;
  render_platform_id: string;
  interaction_id: string;
  file_id: string;
  style_id: number;
  name: string;
  description: string;
  slug?: string;
  furniture_cost: number;
  availability: number;
  length: number;
  height: number;
  width: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateModel {
  brand_id: number;
  category_id: number;
  model_platform_id: string;
  render_platform_id: string;
  interaction_id: string;
  file_id: string;
  style_id: number;
  name: string;
  description: string;
  slug?: string;
  furniture_cost: number;
  availability: number;
  length: number;
  height: number;
  width: number;
  materials?: number[];
  colors?: number[];
}

export interface IUpdateModel {
  brand_id?: number;
  category_id?: number;
  model_platform_id?: string;
  render_platform_id?: string;
  interaction_id?: string;
  file_id?: string;
  style_id?: number;
  name?: string;
  description?: string;
  slug?: string;
  furniture_cost?: number;
  availability?: number;
  length?: number;
  height?: number;
  width?: number;
}

export interface IGetModelsQuery extends IDefaultQuery {
  name?: string;
  availability?: string[];
  model_platforms?: string[];
  render_platforms?: string[];
  brands?: string[];
  styles?: string[];
  categories?: string[];
  colors?: string[];
}

export interface IAddImageResult {
  cover?: IImage,
  images?: IImage[],
}