import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { eventService, guestService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Event, Guest } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';

export const GuestsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadGuests();
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
      addToast('Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuests = async () => {
    try {
      const response = await guestService.getAll(selectedEventId);
      setGuests(response.data);
    } catch (error: any) {
      addToast('Failed to load guests', 'error');
    }
  };

  const handleCreateOrUpdate = async (formData: Record<string, any>) => {
    try {
      if (editingGuest) {
        await guestService.update(selectedEventId, editingGuest.id, formData);
        addToast('Guest updated successfully', 'success');
      } else {
        await guestService.create(selectedEventId, formData);
        addToast('Guest added successfully', 'success');
      }
      setEditingGuest(null);
      loadGuests();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (guestId: string) => {
    if (!confirm('Remove this guest?')) return;
    try {
      await guestService.delete(selectedEventId, guestId);
      addToast('Guest removed successfully', 'success');
      loadGuests();
    } catch (error: any) {
      addToast('Delete failed', 'error');
    }
  };

  const modalFields: FieldConfig[] = [
    { name: 'name', label: 'Guest Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'guest@example.com' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    {
      name: 'tag',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'VIP', label: 'VIP' },
        { value: 'Family', label: 'Family' },
        { value: 'Friends', label: 'Friends' },
        { value: 'Work', label: 'Work' },
      ],
    },
    {
      name: 'rsvp_status',
      label: 'RSVP Status',
      type: 'select',
      options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'Going', label: 'Going' },
        { value: 'Maybe', label: 'Maybe' },
        { value: 'NotGoing', label: 'Not Going' },
      ],
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading...</p></div>;
  }

  if (events.length === 0) {
    return (
      <Card title="No Events">
        <p className="text-gray-500">Create an event first to manage guests</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
        <p className="text-gray-500 mt-1">Manage guests and track RSVP responses</p>
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
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Guests ({guests.length})
        </h2>
        <Button onClick={() => {
          setEditingGuest(null);
          setIsModalOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {guests.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">No guests added yet</p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">RSVP</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{guest.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{guest.email || '-'}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {guest.tag || 'Untagged'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      guest.rsvp_status === 'Going' ? 'bg-green-100 text-green-700' :
                      guest.rsvp_status === 'Maybe' ? 'bg-yellow-100 text-yellow-700' :
                      guest.rsvp_status === 'NotGoing' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {guest.rsvp_status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setEditingGuest(guest);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingGuest ? 'Edit Guest' : 'Add Guest'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGuest(null);
        }}
        onSubmit={handleCreateOrUpdate}
        fields={modalFields}
        defaultValues={editingGuest || {}}
      />
    </div>
  );
};
