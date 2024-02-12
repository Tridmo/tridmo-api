import { IDefaultQuery } from "../../shared/interface/query.interface";

export interface ICollection {
    id: string;
    product_id: string; 
    created_at: Date;
    updated_at: Date;
    in_cart?: Boolean;
    is_bought?: Boolean;
}

export interface ICreateCollection {
    product_id: string;
    category_id: number;
}
export interface IUpdateCollection {
    category_id: number;
}