import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { eventService, venueService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Event, Venue } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';
import { useNavigate } from 'react-router-dom';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
    loadVenues();
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

  const loadVenues = async () => {
    try {
      const response = await venueService.getAll();
      setVenues(response.data);
    } catch (error: any) {
      // Venues are optional for events; keep the page usable
      console.error('Failed to load venues:', error);
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

  const venueOptions = useMemo(() => {
    const currentVenueId = (editingEvent as any)?.venue_id as string | undefined;

    return venues.map((v) => {
      const isSelectable =
        v.availability_status === 'Available' ||
        (currentVenueId && v.id === currentVenueId);

      const labelParts = [
        v.name,
        v.location ? `(${v.location})` : '',
        v.capacity ? `• ${v.capacity} cap` : '',
        `• ${v.availability_status}`,
      ].filter(Boolean);

      return {
        value: v.id,
        label: labelParts.join(' '),
        disabled: !isSelectable,
      };
    });
  }, [venues, editingEvent]);

  const modalFields: FieldConfig[] = [
    { name: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'e.g., Wedding' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Event details...' },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'time', label: 'Time', type: 'time', required: true },
    {
      name: 'venue_id',
      label: 'Venue',
      type: 'select',
      options: venueOptions,
    },
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

  const modalAboveFields = (
    <div className="space-y-2">
      {venues.length === 0 ? (
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-900">
          <p className="font-semibold">No venues found.</p>
          <p className="text-xs mt-1 text-yellow-800">
            Add a venue first, then come back to create an event.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEvent(null);
                navigate('/app/venues');
              }}
              className="px-3 py-1.5 bg-yellow-600 text-white rounded-md text-xs hover:bg-yellow-700 transition"
            >
              Go to Venues
            </button>
            <button
              type="button"
              onClick={loadVenues}
              className="px-3 py-1.5 border border-yellow-300 text-yellow-900 rounded-md text-xs hover:bg-yellow-100 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Select a venue (only available venues can be chosen).
          </p>
          <button
            type="button"
            onClick={loadVenues}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Refresh venues
          </button>
        </div>
      )}
    </div>
  );

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
        aboveFields={modalAboveFields}
        defaultValues={editingEvent || {}}
      />
    </div>
  );
};
