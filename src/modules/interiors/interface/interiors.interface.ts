import { IDefaultQuery } from "../../shared/interface/query.interface";
import { IImageTagBody } from "../../image_tags/interface/image_tags.interface";
import { IImage } from '../../shared/interface/files.interface';
import { IModel } from '../../models/interface/models.interface';

export interface IInterior {
    user_id: string;
    id: string;
    name: string;
    category_id: number;
    render_platform_id: string;
    style_id: number;
    interaction_id: string;
    slug: string;
    is_saved?: boolean;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
    cover?: IImage;
    used_models?: IModel[];
    images?: IImage[];
}

export interface ICreateInterior {
    user_id: string;
    render_platform_id: string;
    style_id: number;
    category_id: number;
    interaction_id: string;
    slug: string;
    name: string;
    tags?: IImageTagBody[];
}

export interface ICreateInteriorBody {
    render_platform_id: string;
    style_id: number;
    category_id: number;
    name: string;
    description: string;
    tags?: IImageTagBody[];
}

export interface IUpdateInterior {
    render_platform_id?: string;
    style_id?: number;
    category_id?: number;
    interaction_id?: string;
    slug?: string;
    name?: string;
    is_deleted?: boolean;
}

export interface IGetInteriorsQuery extends IDefaultQuery {
    name?: string;
    styles?: string[];
    categories?: string[];
    platforms?: string[];
    author?: string;
    is_deleted?: boolean;
}

export interface IAddImageResult {
    cover?: IImage,
    images?: IImage[],
}