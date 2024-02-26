import { IImageTagBody } from "../../image_tags/interface/image_tags.interface";

export interface IInterior {
    id: string;
    category_id: number;
    render_platform_id: string;
    style_id: number;
    interaction_id: string;
    slug: string;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateInterior {
    category_id: number;
    render_platform_id: string;
    style_id: number;
    interaction_id: string;
    slug: string;
    name: string;
    is_deleted: boolean;
    tags?: IImageTagBody[];
}

export interface IUpdateInterior {
    category_id?: number;
    render_platform_id?: string;
    style_id?: number;
    interaction_id?: string;
    slug?: string;
    name?: string;
    is_deleted?: boolean;
}