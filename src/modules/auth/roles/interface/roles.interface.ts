
export interface IRole {
    id: string
    name: string; 
    description: string
}


export interface ICreateRole {
    name: string; 
    description: string
}

export interface ICreateUserRole {
    role_id: number;
    user_id?: string;
}

export interface IUserRole {
    id: string;
    role_id: string;
    user_id: string;
}