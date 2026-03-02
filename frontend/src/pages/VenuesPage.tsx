import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { venueService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Venue } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';

export const VenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const response = await venueService.getAll();
      setVenues(response.data);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to load venues', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData: Record<string, any>) => {
    try {
      if (editingVenue) {
        await venueService.update(editingVenue.id, formData);
        addToast('Venue updated successfully', 'success');
      } else {
        await venueService.create(formData);
        addToast('Venue created successfully', 'success');
      }
      setEditingVenue(null);
      loadVenues();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this venue?')) return;
    try {
      await venueService.delete(id);
      addToast('Venue deleted successfully', 'success');
      loadVenues();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const modalFields: FieldConfig[] = [
    { name: 'name', label: 'Venue Name', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
    { name: 'capacity', label: 'Capacity', type: 'number', placeholder: 'e.g. 200' },
    { name: 'price_per_day', label: 'Price Per Day', type: 'number', placeholder: '0.00' },
    { name: 'contact_person', label: 'Contact Person', type: 'text' },
    { name: 'contact_number', label: 'Contact Number', type: 'text' },
    {
      name: 'availability_status',
      label: 'Availability',
      type: 'select',
      options: [
        { value: 'Available', label: 'Available' },
        { value: 'Booked', label: 'Booked' },
        { value: 'Maintenance', label: 'Maintenance' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading venues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venue Management</h1>
          <p className="text-gray-500 mt-1">
            Manage venues and track availability for events
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingVenue(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Venue
        </Button>
      </div>

      {venues.length === 0 ? (
        <Card title="No Venues Yet">
          <p className="text-gray-500 text-center py-8">
            Add your first venue to start assigning it to events.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {venue.name}
                    </h3>
                  </div>
                  {venue.location && (
                    <p className="text-xs text-gray-600 mb-1">{venue.location}</p>
                  )}
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {venue.capacity && (
                      <p>Capacity: {venue.capacity.toLocaleString()} guests</p>
                    )}
                    {venue.price_per_day && (
                      <p>Price/Day: Rs.{venue.price_per_day.toFixed(2)}</p>
                    )}
                    {venue.contact_person && (
                      <p>Contact: {venue.contact_person}</p>
                    )}
                    {venue.contact_number && (
                      <p>Phone: {venue.contact_number}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 text-[10px] rounded-full font-semibold ${
                      venue.availability_status === 'Available'
                        ? 'bg-green-100 text-green-700'
                        : venue.availability_status === 'Booked'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {venue.availability_status}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingVenue(venue);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(venue.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingVenue ? 'Edit Venue' : 'Create Venue'}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVenue(null);
        }}
        onSubmit={handleCreateOrUpdate}
        fields={modalFields}
        defaultValues={editingVenue || {}}
      />
    </div>
  );
};

