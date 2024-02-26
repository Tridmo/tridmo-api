export interface IImageTag {
    id: string;
    image_id: string;
    text: string;
    x: number;
    y: number;
}

export interface ICreateImageTag {
    image_id: string;
    text: string;
    x: number;
    y: number;
}

export interface IImageTagBody {
    text: string;
    x: number;
    y: number;
}

export interface IUpdateImageTag {
    text?: string;
    x?: number;
    y?: number;
}