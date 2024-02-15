export interface ICreateModelImage {
    model_id: string;
    image_id: string;
    is_main: boolean;
}

export interface IModelImage {
    id: string;
    model_id: string;
    image_id: string;
    is_main: boolean;
    created_at: Date;
    updated_at: Date;
}