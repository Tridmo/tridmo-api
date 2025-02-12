import { IDefaultQuery } from "../shared/interface/query.interface";

export interface ICategory {
  id: string;
  name: string;
  description: string;
  parent_id: number | null;
  type: string;
  image: string;
  section: string;
  created_at: Date;
  children: ICategory[];
}

export interface ICreateCategory {
  name: string;
  description: string;
  type: string;
  image?: string;
  section: string;
  parent_id: number;
}

export interface IUpdateCategory {
  name?: string;
  description?: string;
  type?: string;
  image?: string;
  section?: string;
  parent_id?: number;
}

export interface IGetCategoriesQuery extends IDefaultQuery {
  name?: string;
}

