export interface ICreateInteriorImage {
    interior_id: string;
    image_id: string;
    is_main: boolean;
}

export interface IInteriorImage {
    id: string;
    interior_id: string;
    image_id: string;
    is_main: boolean;
    created_at: Date;
    updated_at: Date;
}