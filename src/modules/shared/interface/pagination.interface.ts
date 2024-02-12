export interface IPagination {
    data_count: number | string,
    pages: number,
    current: number,
    next: number,
    limit: number
} 