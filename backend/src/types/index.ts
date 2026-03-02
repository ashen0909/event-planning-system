export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: 'ADMIN' | 'USER';
  created_at?: string;
}

export interface Event {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  status: 'Draft' | 'Published' | 'Cancelled';
  cover_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  email?: string;
  phone?: string;
  tag?: string;
  rsvp_status: 'Pending' | 'Going' | 'Maybe' | 'NotGoing';
  created_at?: string;
}

export interface ScheduleItem {
  id: string;
  event_id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  event_id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'ToDo' | 'Doing' | 'Done';
  due_date?: string;
  assigned_to?: string;
  created_at?: string;
}

export interface Vendor {
  id: string;
  event_id: string;
  name: string;
  service_type: string;
  contact?: string;
  price_estimate?: number;
  notes?: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  event_id: string;
  title: string;
  amount: number;
  payment_status: 'Unpaid' | 'Paid';
  receipt_url?: string;
  created_at?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
}
