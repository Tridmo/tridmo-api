import { IDefaultQuery } from "../../shared/interface/query.interface";

export interface ICategory {
    id: string;
    name: string;
    description: string;
    parent_id: number | null;
    type: string;
    created_at: Date;
}

export interface ICreateCategory {
    name: string;
    description: string;
    type: string;
    parent_id: number;
} 

export interface IGetCategoriesQuery extends IDefaultQuery {
    name?: string;
} 

