export interface IBrand {
    id: string;
    name: string;
    description: string;
    site_link: string;
    image_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateBrand {
    name: string;
    description: string;
    site_link: string;
    image_id?: string;
}

export interface IUpdateBrand {
    name?: string;
    description?: string;
    site_link?: string;
} 