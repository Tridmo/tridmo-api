export interface ICost {
    id: string;
    amount: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateCost {
    amount: string;
} 