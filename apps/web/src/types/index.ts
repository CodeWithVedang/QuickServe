export type Role = 'waiter' | 'kitchen' | 'counter' | 'admin';
export type OrderStatus = 'pending' | 'preparing' | 'done' | 'cancelled' | 'paid';
export type PaymentMethod = 'cash' | 'upi' | 'card';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  meal_time?: string;
  food_type?: string;
  image_url?: string;
  is_available?: boolean;
  created_at?: string;
}

export interface Order {
  id: string;
  table_number: number | null;
  status: OrderStatus;
  created_by: string;
  created_at: string;
  items?: OrderItem[]; // Joined relations
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  status: OrderStatus; // Pending, Preparing, Done
  menu_item?: MenuItem; // Joined
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
