import { IUpdateModel } from "../../models/interface/models.interface";
import { IDefaultQuery } from "../../shared/interface/query.interface";

export interface IProduct {
    id: string;
    title: string;
    description: string;
    file_id: string;
    cost_id: number;
    style_id: number; 
    slug: string;
    in_cart?: boolean;
    is_bought?: boolean;
    is_free: Boolean;
    views_count: number;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateProduct {
    title: string;
    description: string;
    file_id?: string;
    cost_id: number; 
    style_id: number;
    slug: string;   
    is_free: Boolean;
}


export interface IUpdateProduct extends IUpdateModel {
    title?: string;
    description?: string;
    cost_id?: number;
    style_id?: number;
    slug?: string; 
    length?: number;
    height?: number;
    width?: number;
    polygons_count?: number;
    vertices_count?: number;
    brand_id?: number; 
    is_free: Boolean;
    formfactor_id?: number;
}

export interface IGetProductsQuery extends IDefaultQuery {
    cost_id?: number;
    brands?: string[];
    styles?: string[];
    formfactors?: string[];
    categories?: string[];
    colors?: string[];
}