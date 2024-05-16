export interface IUserProductView {
    id: number;
    product_id: string;
    user_id: string;
    remote_ip: string;
    device: string;
    created_at: Date;
    updated_at: Date;
} 

export interface ICreateUserProductView {
    product_id: string;
    user_id?: string;
    remote_ip?: string;
    device?: string;
}

export interface IGetUserProductViewFilters {
    product_id?: string;
    user_id?: string;
    remote_ip?: string;
    device?: string;
}