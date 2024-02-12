export interface IColor {
    id: string;
    name: string;
    hex_value: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateColor {
    name: string;
    hex_value: string;
} 