import axios from 'axios';

const API_BASE = '/api';

// Create axios instance with credentials
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Auth
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Events
export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Guests
export const guestService = {
  getAll: (eventId: string) => api.get(`/guests/${eventId}/guests`),
  create: (eventId: string, data: any) => api.post(`/guests/${eventId}/guests`, data),
  update: (eventId: string, guestId: string, data: any) =>
    api.put(`/guests/${eventId}/guests/${guestId}`, data),
  delete: (eventId: string, guestId: string) =>
    api.delete(`/guests/${eventId}/guests/${guestId}`),
};

// Schedule
export const scheduleService = {
  getItems: (eventId: string) => api.get(`/schedule/${eventId}/schedule`),
  createItem: (eventId: string, data: any) => api.post(`/schedule/${eventId}/schedule`, data),
  updateItem: (eventId: string, scheduleId: string, data: any) =>
    api.put(`/schedule/${eventId}/schedule/${scheduleId}`, data),
  deleteItem: (eventId: string, scheduleId: string) =>
    api.delete(`/schedule/${eventId}/schedule/${scheduleId}`),

  getTasks: (eventId: string) => api.get(`/schedule/${eventId}/tasks`),
  createTask: (eventId: string, data: any) => api.post(`/schedule/${eventId}/tasks`, data),
  updateTask: (eventId: string, taskId: string, data: any) =>
    api.put(`/schedule/${eventId}/tasks/${taskId}`, data),
  deleteTask: (eventId: string, taskId: string) =>
    api.delete(`/schedule/${eventId}/tasks/${taskId}`),
};

// Budget (Vendors & Expenses)
export const budgetService = {
  getVendors: (eventId: string) => api.get(`/budget/${eventId}/vendors`),
  createVendor: (eventId: string, data: any) => api.post(`/budget/${eventId}/vendors`, data),
  updateVendor: (eventId: string, vendorId: string, data: any) =>
    api.put(`/budget/${eventId}/vendors/${vendorId}`, data),
  deleteVendor: (eventId: string, vendorId: string) =>
    api.delete(`/budget/${eventId}/vendors/${vendorId}`),

  getExpenses: (eventId: string) => api.get(`/budget/${eventId}/expenses`),
  createExpense: (eventId: string, data: any) => api.post(`/budget/${eventId}/expenses`, data),
  updateExpense: (eventId: string, expenseId: string, data: any) =>
    api.put(`/budget/${eventId}/expenses/${expenseId}`, data),
  deleteExpense: (eventId: string, expenseId: string) =>
    api.delete(`/budget/${eventId}/expenses/${expenseId}`),
};

// Venues
export const venueService = {
  getAll: () => api.get('/venues'),
  getById: (id: string) => api.get(`/venues/${id}`),
  create: (data: any) => api.post('/venues', data),
  update: (id: string, data: any) => api.put(`/venues/${id}`, data),
  delete: (id: string) => api.delete(`/venues/${id}`),
};

// Tickets & Registrations
export const ticketingService = {
  // Tickets for an event
  getTickets: (eventId: string) => api.get(`/events/${eventId}/tickets`),
  createTicket: (eventId: string, data: any) =>
    api.post(`/events/${eventId}/tickets`, data),
  updateTicket: (eventId: string, ticketId: string, data: any) =>
    api.put(`/events/${eventId}/tickets/${ticketId}`, data),
  deleteTicket: (eventId: string, ticketId: string) =>
    api.delete(`/events/${eventId}/tickets/${ticketId}`),

  // Registrations for an event
  getRegistrations: (eventId: string) => api.get(`/events/${eventId}/registrations`),
  createRegistration: (eventId: string, data: any) =>
    api.post(`/events/${eventId}/registrations`, data),
  updateRegistration: (eventId: string, registrationId: string, data: any) =>
    api.put(`/events/${eventId}/registrations/${registrationId}`, data),
  deleteRegistration: (eventId: string, registrationId: string) =>
    api.delete(`/events/${eventId}/registrations/${registrationId}`),
};

// Sponsors & Sponsorships
export const sponsorService = {
  getAll: () => api.get('/sponsors'),
  getById: (id: string) => api.get(`/sponsors/${id}`),
  create: (data: any) => api.post('/sponsors', data),
  update: (id: string, data: any) => api.put(`/sponsors/${id}`, data),
  delete: (id: string) => api.delete(`/sponsors/${id}`),
  getDealsBySponsor: (id: string) => api.get(`/sponsors/${id}/deals`),
};

export const sponsorshipService = {
  getDealsForEvent: (eventId: string) => api.get(`/events/${eventId}/sponsorships`),
  createDeal: (eventId: string, data: any) =>
    api.post(`/events/${eventId}/sponsorships`, data),
  updateDeal: (eventId: string, dealId: string, data: any) =>
    api.put(`/events/${eventId}/sponsorships/${dealId}`, data),
  deleteDeal: (eventId: string, dealId: string) =>
    api.delete(`/events/${eventId}/sponsorships/${dealId}`),
};

export default api;
