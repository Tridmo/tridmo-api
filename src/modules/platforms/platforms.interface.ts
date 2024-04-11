export interface IPlatform {
    id: string;
    name: string;
    type: number;
}

export interface ICreatePlatform {
    name: string;
    type: number;
}

export interface IUpdatePlatform {
    name?: string;
    type?: number;
}