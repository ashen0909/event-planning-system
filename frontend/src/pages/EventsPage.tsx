import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { eventService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Event } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventService.getAll();
      setEvents(response.data);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData: Record<string, any>) => {
    try {
      if (editingEvent) {
        await eventService.update(editingEvent.id, formData);
        addToast('Event updated successfully', 'success');
      } else {
        await eventService.create(formData);
        addToast('Event created successfully', 'success');
      }
      setEditingEvent(null);
      loadEvents();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await eventService.delete(id);
      addToast('Event deleted successfully', 'success');
      loadEvents();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const modalFields: FieldConfig[] = [
    { name: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'e.g., Wedding' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Event details...' },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'time', label: 'Time', type: 'time', required: true },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Event venue...' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Draft', label: 'Draft' },
        { value: 'Published', label: 'Published' },
        { value: 'Cancelled', label: 'Cancelled' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Manage and organize your events</p>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <Card title="No Events Yet">
          <p className="text-gray-500 text-center py-8">
            Create your first event to get started
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      event.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                      event.status === 'Published' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                  )}
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>📅 {event.date} at {event.time}</span>
                    {event.location && <span>📍 {event.location}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleCreateOrUpdate}
        fields={modalFields}
        defaultValues={editingEvent || {}}
      />
    </div>
  );
};
