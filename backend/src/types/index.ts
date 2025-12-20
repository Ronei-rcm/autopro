export type UserProfile = 'admin' | 'mechanic' | 'financial' | 'attendant';

export type ClientType = 'PF' | 'PJ';

export type QuoteStatus = 'open' | 'approved' | 'rejected' | 'converted';

export type OrderStatus = 'open' | 'in_progress' | 'waiting_parts' | 'finished' | 'cancelled';

export type AccountStatus = 'open' | 'paid' | 'overdue' | 'cancelled';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer';

export type ItemType = 'product' | 'labor';

export type CashFlowType = 'income' | 'expense';

export interface User {
  id: number;
  email: string;
  name: string;
  profile: UserProfile;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: number;
  name: string;
  type: ClientType;
  cpf?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  notes?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Vehicle {
  id: number;
  client_id: number;
  brand: string;
  model: string;
  year?: number;
  plate?: string;
  chassis?: string;
  color?: string;
  mileage: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  code?: string;
  name: string;
  description?: string;
  category?: string;
  supplier_id?: number;
  cost_price: number;
  sale_price: number;
  min_quantity: number;
  current_quantity: number;
  unit: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Quote {
  id: number;
  client_id: number;
  vehicle_id: number;
  user_id: number;
  quote_number: string;
  status: QuoteStatus;
  subtotal: number;
  discount: number;
  total: number;
  valid_until?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  quote_id?: number;
  client_id: number;
  vehicle_id: number;
  mechanic_id?: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  started_at?: Date;
  finished_at?: Date;
  technical_notes?: string;
  client_signature?: string;
  signature_date?: Date;
  signed_by_name?: string;
  created_at: Date;
  updated_at: Date;
}

