export interface OrderItem {
  name: string;
  slug: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerFullName: string;
  customerPhoneNumber: string;
}