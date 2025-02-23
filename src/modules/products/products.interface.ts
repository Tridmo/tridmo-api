import { IImage } from "../shared/interface/files.interface";
import { IDefaultQuery } from "../shared/interface/query.interface";

export interface IProduct {
  id: string;
  category_id: number;
  name: string;
  description: string;
  brand: string;
  has_delivery: boolean;
  slug: string;
  price: string;
  discount_percent: number;
  discount_until: Date;
  length: number;
  height: number;
  width: number;
  colors: string[];
  materials: string[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  images?: any;
}

export interface ICreateProduct {
  category_id: number;
  name: string;
  description: string;
  brand?: string;
  has_delivery?: boolean;
  slug: string;
  price: string;
  discount_percent?: number;
  discount_until?: Date;
  length: number;
  height: number;
  width: number;
  colors: string[];
  materials: string[];
}

export interface ICreateProductFromModel {
  has_delivery?: boolean;
  name?: string;
  description?: string;
  price: string;
  discount_percent?: number;
  discount_until?: Date;
}

export interface IUpdateProduct {
  category_id?: number;
  name?: string;
  description?: string;
  brand?: string;
  has_delivery?: boolean;
  slug?: string;
  price?: string;
  cover?: string;
  discount_percent?: number;
  discount_until?: Date;
  length?: number;
  height?: number;
  width?: number;
  colors?: string[];
  materials?: string[];
  is_deleted?: boolean;
  updated_at?: Date;
  removed_images?: string[];
}

export interface IGetProductsQuery extends IDefaultQuery {
  name?: string;
  categories?: string[];
  colors?: string[];
  materials?: string[];
  exclude_products?: string[];
  is_deleted?: boolean;
  has_delivery?: boolean;
  min_price?: string;
  max_price?: string;
  has_discount?: number;
}