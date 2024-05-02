import { IStyle } from '../../styles/interface/styles.interface';
import { IUser } from "../../users/interface/users.interface";

export interface IBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  site_link: string;
  phone: string;
  email: string;
  address: string;
  styles?: any[];
  image_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateBrand {
  name: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  site_link: string;
  image_id?: string;
  slug?: string;
  styles?: string[];
}

export interface IGetBrandsQuery {
  name?: string;
}

export interface IBrandAuth {
  username: string;
  password: string;
}

export interface IBrandAdmin {
  id: string;
  profile_id: string;
  brand_id: string;
  created_at: Date;
  updated_at: Date;
  profiles?: IUser;
  brand?: IBrand;
}
export interface IBrandStyle {
  id: string;
  style_id: string;
  brand_id: string;
  created_at: Date;
  updated_at: Date;
  style?: IStyle;
  brand?: IBrand;
}


export interface ICreateBrandAdmin {
  profile_id: string;
  brand_id: string;
}

export interface ICreateBrandStyle {
  style_id: number;
  brand_id: string;
}

export interface IUpdateBrand {
  name?: string;
  slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  site_link?: string;
  image_id?: string;
  styles?: string[];
} 