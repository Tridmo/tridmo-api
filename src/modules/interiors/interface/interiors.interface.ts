import { IDefaultQuery } from "../../shared/interface/query.interface";

export interface IInterior {
    id: string;
    product_id: string;
    in_cart?: Boolean;
    presentation_id?: string;
    category_id: number;
    is_bought?: Boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateInterior {
    product_id: string;
    presentation_id?: string;
    category_id: number; 
}

export interface IUpdateInterior {
    category_id?: number; 
}