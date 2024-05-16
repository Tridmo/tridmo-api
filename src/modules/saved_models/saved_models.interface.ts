export interface ISavedModel {
    id: string;
    model_id: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateSavedModel {
    model_id: string;
    user_id: string;
}

export interface IFilterSavedModel {
    id?: string;
    model_id?: string;
    user_id?: string;
} 