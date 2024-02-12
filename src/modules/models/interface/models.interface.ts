import { IDefaultQuery } from "../../shared/interface/query.interface";

export interface IModel {
  id: string;
  length: number;
  height: number;
  width: number;
  polygons_count: number;
  vertices_count: number;
  brand_id?: number;
  category_id: number;
  in_cart?: boolean;
  is_bought?: boolean;
  product_id: string;
  formfactor_id: number;
  yamo_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateModel {
  length: number;
  height: number;
  width: number;
  polygons_count: number;
  category_id: number;
  vertices_count: number;
  brand_id: number;
  product_id?: string;
  yamo_id?: string;
  formfactor_id?: number;
  materials?: string[] | any;
  colors?: string[] | any;
}

export interface IUpdateModel {
  length?: number;
  height?: number;
  width?: number;
  yamo_id?: string;
  category_id?: number;
  polygons_count?: number;
  vertices_count?: number;
  brand_id?: number;
  formfactor_id?: number;
}

export interface IGetModelsQuery extends IDefaultQuery {
  cost_id?: number;
  brands?: string[];
  styles?: string[];
  formfactors?: string[];
  categories?: string[];
  colors?: string[];
}