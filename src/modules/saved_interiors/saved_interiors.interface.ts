export interface ISavedInterior {
    id: string;
    interior_id: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateSavedInterior {
    interior_id: string;
    user_id: string;
}

export interface IFilterSavedInterior {
    id?: string;
    interior_id?: string;
    user_id?: string;
} 