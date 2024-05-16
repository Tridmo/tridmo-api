export interface IInteraction {
    id: string;
    views: number;
    likes: number;
    saves: number;
}

export interface IUpdateInteraction {
    views?: number;
    likes?: number;
    saves?: number;
}