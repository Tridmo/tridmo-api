import { IBrand } from '../brands/brands.interface';
import { IColor } from '../colors/colors.interface';
import { IInterior } from '../interiors/interiors.interface';
import { IMaterial } from '../materials/materials.interface';
import { IFile, IFilePublic, IImage } from "../shared/interface/files.interface";
import { IDefaultQuery } from "../shared/interface/query.interface";

export interface IModel {
  id: string;
  product_id: string;
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
  furniture_cost: string;
  availability: number;
  length: number;
  height: number;
  width: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  is_saved?: boolean;
  cover: string;
  images?: {
    id: string;
    is_main: string;
    index: number;
    image_id: string;
    model_id: string;
    image_src: string;
  }[];
  file?: IFile | IFilePublic;
  used_interiors?: IInterior[];
  brand: IBrand;
  colors: {
    model_id: string;
    color: IColor;
  }[];
  materials: {
    model_id: string;
    material: IMaterial;
  }[];
}

export interface ICreateModel {
  product_id?: string;
  brand_id: string;
  category_id: number;
  model_platform_id: string;
  render_platform_id: string;
  interaction_id: string;
  file_id: string;
  style_id: number;
  name: string;
  top?: boolean;
  for_sale?: boolean;
  description: string;
  slug?: string;
  furniture_cost: string;
  availability: number;
  length: number;
  height: number;
  width: number;
}

export interface ICreateModelBody {
  product_id?: string;
  brand_id: string;
  category_id: number;
  model_platform_id: string;
  render_platform_id: string;
  style_id: number;
  name: string;
  top?: boolean;
  for_sale?: boolean;
  description: string;
  furniture_cost: string;
  availability: number;
  length: number;
  height: number;
  width: number;
  materials: number[];
  colors: number[];
}


export interface IUpdateModel {
  product_id?: string;
  brand_id?: string;
  category_id?: number;
  model_platform_id?: string;
  render_platform_id?: string;
  interaction_id?: string;
  file_id?: string;
  style_id?: number;
  name?: string;
  top?: boolean;
  for_sale?: boolean;
  description?: string;
  slug?: string;
  furniture_cost?: string;
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
  for_sale?: boolean;
  orderBy?: string;
  availability?: number;
  brand_id?: string;
  model_platforms?: string[];
  render_platforms?: string[];
  brands?: string[];
  styles?: string[];
  categories?: string[];
  colors?: string[];
  exclude_models?: string[];
  in?: string[];
  is_deleted?: boolean;
}

export interface IGetCartModelsQuery extends IDefaultQuery {
  in?: string[];
}

export interface IGetCountsQuery {
  all?: boolean;
  top?: boolean;
  for_sale?: boolean;
  available?: boolean;
  not_available?: boolean;
  deleted?: boolean;
}
export interface ICounts {
  count?: number;
  all?: number;
  top?: number;
  for_sale?: boolean;
  available?: number;
  not_available?: number;
  deleted?: number;
}

export interface IAddImageResult {
  cover?: IImage,
  images?: IImage[],
}