export interface ICountry {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateCountry {
    name: string;
} 

export interface IGetCountriesQuery {
    name?: string;
    models_count?: boolean;
    brands_count?: boolean;
}