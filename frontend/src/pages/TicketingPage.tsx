import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Ticket, Users } from 'lucide-react';
import { eventService, ticketingService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Event, Ticket as TicketType, Registration } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';

export const TicketingPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadData();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getAll();
      setEvents(response.data);
      if (response.data.length > 0) {
        setSelectedEventId(response.data[0].id);
      }
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [ticketsRes, regsRes] = await Promise.all([
        ticketingService.getTickets(selectedEventId),
        ticketingService.getRegistrations(selectedEventId),
      ]);
      setTickets(ticketsRes.data);
      setRegistrations(regsRes.data);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to load ticket data', 'error');
    }
  };

  const handleCreateOrUpdateTicket = async (formData: Record<string, any>) => {
    try {
      if (editingTicket) {
        await ticketingService.updateTicket(selectedEventId, editingTicket.id, formData);
        addToast('Ticket updated successfully', 'success');
      } else {
        await ticketingService.createTicket(selectedEventId, formData);
        addToast('Ticket created successfully', 'success');
      }
      setEditingTicket(null);
      loadData();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Delete this ticket type?')) return;
    try {
      await ticketingService.deleteTicket(selectedEventId, ticketId);
      addToast('Ticket deleted successfully', 'success');
      loadData();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleCreateOrUpdateRegistration = async (formData: Record<string, any>) => {
    try {
      if (editingRegistration) {
        await ticketingService.updateRegistration(
          selectedEventId,
          editingRegistration.id,
          formData
        );
        addToast('Registration updated successfully', 'success');
      } else {
        await ticketingService.createRegistration(selectedEventId, formData);
        addToast('Registration created successfully', 'success');
      }
      setEditingRegistration(null);
      loadData();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('Delete this registration?')) return;
    try {
      await ticketingService.deleteRegistration(selectedEventId, registrationId);
      addToast('Registration deleted successfully', 'success');
      loadData();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const ticketFields: FieldConfig[] = [
    { name: 'name', label: 'Ticket Name', type: 'text', required: true, placeholder: 'VIP, Standard, Early Bird...' },
    { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '0.00' },
    { name: 'total_quantity', label: 'Total Quantity', type: 'number', required: true },
    { name: 'sale_start_date', label: 'Sale Start Date', type: 'date' },
    { name: 'sale_end_date', label: 'Sale End Date', type: 'date' },
  ];

  const registrationFields: FieldConfig[] = [
    {
      name: 'ticket_id',
      label: 'Ticket Type',
      type: 'select',
      options: tickets.map((t) => ({ value: t.id, label: t.name })),
      required: true,
    },
    { name: 'attendee_name', label: 'Attendee Name', type: 'text', required: true },
    { name: 'attendee_email', label: 'Email', type: 'email' },
    { name: 'attendee_phone', label: 'Phone', type: 'tel' },
    {
      name: 'payment_status',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Cancelled', label: 'Cancelled' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card title="No Events">
        <p className="text-gray-500">Create an event first to manage tickets.</p>
      </Card>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const totalSold = tickets.reduce((sum, t) => sum + (t.sold_quantity || 0), 0);
  const totalRevenue = tickets.reduce(
    (sum, t) => sum + (t.sold_quantity || 0) * t.price,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Event Ticketing & Registration</h1>
        <p className="text-gray-500 mt-1">
          Manage ticket types, registrations and track ticket sales.
        </p>
      </div>

      <Card title="Select Event">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} ({event.date})
            </option>
          ))}
        </select>
        {selectedEvent && (
          <p className="text-xs text-gray-500 mt-2">
            Selected event: {selectedEvent.title} on {selectedEvent.date} at{' '}
            {selectedEvent.time}
          </p>
        )}
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Ticket Types">
          <div className="flex items-center gap-3">
            <Ticket className="text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              <p className="text-xs text-gray-500">Active ticket categories</p>
            </div>
          </div>
        </Card>
        <Card title="Tickets Sold">
          <div className="flex items-center gap-3">
            <Users className="text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
              <p className="text-xs text-gray-500">Total tickets sold</p>
            </div>
          </div>
        </Card>
        <Card title="Revenue (approx)">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total revenue</p>
            <p className="text-2xl font-bold text-blue-600">Rs.{totalRevenue.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Ticket Types ({tickets.length})
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingTicket(null);
              setIsTicketModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Ticket Type
          </Button>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-6">
              No ticket types yet. Add one to start selling tickets.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tickets.map((ticket) => {
              const total = ticket.total_quantity || 0;
              const ticketRegs = registrations.filter(
                (r) => r.ticket_id === ticket.id
              );
              const paidCount = ticketRegs.filter(
                (r) => r.payment_status === 'Paid'
              ).length;
              const pendingCount = ticketRegs.filter(
                (r) => r.payment_status === 'Pending'
              ).length;
              const cancelledCount = ticketRegs.filter(
                (r) => r.payment_status === 'Cancelled'
              ).length;
              const activeCount = pendingCount + paidCount; // non-cancelled
              const remaining = Math.max(total - activeCount, 0);

              const paidPct =
                total > 0 ? (paidCount / total) * 100 : 0;
              const pendingPct =
                total > 0 ? (pendingCount / total) * 100 : 0;
              const cancelledPct =
                total > 0 ? (cancelledCount / total) * 100 : 0;

              return (
                <Card key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {ticket.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-[10px] rounded-full font-semibold ${
                            ticket.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : ticket.status === 'SoldOut'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        Price: Rs.{ticket.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {paidCount}/{total} paid · {pendingCount} pending ·{' '}
                        {cancelledCount} cancelled · {remaining} remaining
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1 overflow-hidden">
                        <div className="flex h-full w-full">
                          {paidPct > 0 && (
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${Math.min(paidPct, 100)}%` }}
                            />
                          )}
                          {pendingPct > 0 && (
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: `${Math.min(pendingPct, 100)}%` }}
                            />
                          )}
                          {cancelledPct > 0 && (
                            <div
                              className="h-full bg-red-400"
                              style={{ width: `${Math.min(cancelledPct, 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      {(ticket.sale_start_date || ticket.sale_end_date) && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          {ticket.sale_start_date && (
                            <>From {ticket.sale_start_date} </>
                          )}
                          {ticket.sale_end_date && <>to {ticket.sale_end_date}</>}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setEditingTicket(ticket);
                          setIsTicketModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Registrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Registrations ({registrations.length})
          </h2>
          <Button
            size="sm"
            onClick={() => {
              setEditingRegistration(null);
              setIsRegModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Registration
          </Button>
        </div>

        {registrations.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-6">
              No registrations yet. Add a registration or share this event for
              attendees.
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Attendee
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Ticket
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Payment
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((reg) => {
                  const ticket = tickets.find((t) => t.id === reg.ticket_id);
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {reg.attendee_name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {ticket ? ticket.name : '—'}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">
                        {reg.attendee_email && <p>{reg.attendee_email}</p>}
                        {reg.attendee_phone && <p>{reg.attendee_phone}</p>}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            reg.payment_status === 'Paid'
                              ? 'bg-green-100 text-green-700'
                              : reg.payment_status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {reg.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingRegistration(reg);
                              setIsRegModalOpen(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegistration(reg.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isTicketModalOpen}
        title={editingTicket ? 'Edit Ticket Type' : 'Add Ticket Type'}
        onClose={() => {
          setIsTicketModalOpen(false);
          setEditingTicket(null);
        }}
        onSubmit={handleCreateOrUpdateTicket}
        fields={ticketFields}
        defaultValues={editingTicket || {}}
      />

      <Modal
        isOpen={isRegModalOpen}
        title={editingRegistration ? 'Edit Registration' : 'Add Registration'}
        onClose={() => {
          setIsRegModalOpen(false);
          setEditingRegistration(null);
        }}
        onSubmit={handleCreateOrUpdateRegistration}
        fields={registrationFields}
        defaultValues={editingRegistration || {}}
      />
    </div>
  );
};

