export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface Event {
  id: string;
  owner_id: string;
  venue_id?: string;
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

export interface Venue {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  price_per_day?: number;
  contact_person?: string;
  contact_number?: string;
  availability_status: 'Available' | 'Booked' | 'Maintenance';
  created_at?: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  sale_start_date?: string;
  sale_end_date?: string;
  status: 'Active' | 'SoldOut' | 'Closed';
  created_at?: string;
}

export interface Registration {
  id: string;
  event_id: string;
  ticket_id: string;
  attendee_name: string;
  attendee_email?: string;
  attendee_phone?: string;
  payment_status: 'Pending' | 'Paid' | 'Cancelled';
  created_at?: string;
}

export interface Sponsor {
  id: string;
  owner_id: string;
  name: string;
  company_type?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at?: string;
}

export interface SponsorshipDeal {
  id: string;
  sponsor_id: string;
  event_id: string;
  amount?: number;
  package?: string;
  benefits?: string;
  deal_status: 'Proposed' | 'Confirmed' | 'Paid' | 'Cancelled';
  payment_status: 'Pending' | 'Paid';
  created_at?: string;
}
