export interface ITransaction{
    id: string;
    user_id: string;
    order_id: string;
    payment_product_id: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    organization: string;
    income: string;
    tax_amount: string;
    tax_rate: string;
    total_amount: string;
    currency: string;
    country: string;
    event_id: string;
    transaction_type: string;
    status: number;
    created_at: Date;
    updated_at: Date;
}

export interface ICreateTransaction{
    id: string;
    user_id: string;
    order_id: string;
    payment_product_id: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    organization: string;
    income: string;
    tax_amount: string;
    tax_rate: string;
    total_amount: string;
    currency: string;
    country: string;
    event_id: string;
    transaction_type: string;
}