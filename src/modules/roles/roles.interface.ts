export interface IRole{
    id: number;
    name: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateRole{
    id: number;
    name: string;
    description: string;
    access_modules?: number[];
}

export interface IUpdateRole{
    name?: string;
    description?: string;
}