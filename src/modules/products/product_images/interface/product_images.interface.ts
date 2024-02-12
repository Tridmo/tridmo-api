export interface ICreateProductImage {
    product_id: string;
    image_id: number;
    is_main: boolean;
}

export interface IProductImage {
    id: string;
    product_id: string;
    image_id: number;
    is_main: boolean;
    created_at: Date;
    updated_at: Date;
}