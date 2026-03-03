import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Link2 } from 'lucide-react';
import { eventService, sponsorService, sponsorshipService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Event, Sponsor, SponsorshipDeal } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';

export const SponsorsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [deals, setDeals] = useState<SponsorshipDeal[]>([]);
  const [historyDeals, setHistoryDeals] = useState<SponsorshipDeal[]>([]);
  const [selectedSponsorForHistory, setSelectedSponsorForHistory] = useState<Sponsor | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [editingDeal, setEditingDeal] = useState<SponsorshipDeal | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadDealsForEvent();
    }
  }, [selectedEventId]);

  const loadInitial = async () => {
    try {
      const [eventsRes, sponsorsRes] = await Promise.all([
        eventService.getAll(),
        sponsorService.getAll(),
      ]);
      setEvents(eventsRes.data);
      setSponsors(sponsorsRes.data);
      if (eventsRes.data.length > 0) {
        setSelectedEventId(eventsRes.data[0].id);
      }
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to load sponsors data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDealsForEvent = async () => {
    try {
      const res = await sponsorshipService.getDealsForEvent(selectedEventId);
      setDeals(res.data);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to load sponsorship deals', 'error');
    }
  };

  const loadSponsorHistory = async (sponsor: Sponsor) => {
    try {
      const res = await sponsorService.getDealsBySponsor(sponsor.id);
      setSelectedSponsorForHistory(sponsor);
      setHistoryDeals(res.data);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to load sponsor history', 'error');
    }
  };

  const handleCreateOrUpdateSponsor = async (formData: Record<string, any>) => {
    try {
      if (editingSponsor) {
        await sponsorService.update(editingSponsor.id, formData);
        addToast('Sponsor updated successfully', 'success');
      } else {
        await sponsorService.create(formData);
        addToast('Sponsor created successfully', 'success');
      }
      setEditingSponsor(null);
      const sponsorsRes = await sponsorService.getAll();
      setSponsors(sponsorsRes.data);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Sponsor operation failed', 'error');
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Delete this sponsor? All related deals will also be removed.')) return;
    try {
      await sponsorService.delete(id);
      addToast('Sponsor deleted successfully', 'success');
      const sponsorsRes = await sponsorService.getAll();
      setSponsors(sponsorsRes.data);
      if (selectedSponsorForHistory?.id === id) {
        setSelectedSponsorForHistory(null);
        setHistoryDeals([]);
      }
      loadDealsForEvent();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const handleCreateOrUpdateDeal = async (formData: Record<string, any>) => {
    try {
      if (!selectedEventId) {
        addToast('Please select an event first', 'error');
        return;
      }

      if (editingDeal) {
        await sponsorshipService.updateDeal(selectedEventId, editingDeal.id, formData);
        addToast('Sponsorship deal updated successfully', 'success');
      } else {
        await sponsorshipService.createDeal(selectedEventId, formData);
        addToast('Sponsorship deal created successfully', 'success');
      }
      setEditingDeal(null);
      loadDealsForEvent();
      if (selectedSponsorForHistory) {
        loadSponsorHistory(selectedSponsorForHistory);
      }
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Sponsorship operation failed', 'error');
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Delete this sponsorship deal?')) return;
    try {
      await sponsorshipService.deleteDeal(selectedEventId, dealId);
      addToast('Sponsorship deal deleted successfully', 'success');
      loadDealsForEvent();
      if (selectedSponsorForHistory) {
        loadSponsorHistory(selectedSponsorForHistory);
      }
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const sponsorFields: FieldConfig[] = [
    { name: 'name', label: 'Sponsor Name', type: 'text', required: true },
    { name: 'company_type', label: 'Company Type', type: 'text', placeholder: 'e.g. Bank, Media, Beverage' },
    { name: 'contact_person', label: 'Contact Person', type: 'text' },
    { name: 'contact_email', label: 'Contact Email', type: 'email' },
    { name: 'contact_phone', label: 'Contact Phone', type: 'tel' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const dealFields: FieldConfig[] = [
    {
      name: 'sponsor_id',
      label: 'Sponsor',
      type: 'select',
      required: true,
      options: sponsors.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: 'amount', label: 'Amount', type: 'number', placeholder: '0.00' },
    {
      name: 'package',
      label: 'Package',
      type: 'select',
      options: [
        { value: 'Gold', label: 'Gold' },
        { value: 'Silver', label: 'Silver' },
        { value: 'Bronze', label: 'Bronze' },
        { value: 'Custom', label: 'Custom' },
      ],
    },
    { name: 'benefits', label: 'Benefits', type: 'textarea', placeholder: 'Banner, social media, stage mention...' },
    {
      name: 'deal_status',
      label: 'Deal Status',
      type: 'select',
      options: [
        { value: 'Proposed', label: 'Proposed' },
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Cancelled', label: 'Cancelled' },
      ],
    },
    {
      name: 'payment_status',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'Paid', label: 'Paid' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading sponsors...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card title="No Events">
        <p className="text-gray-500">Create an event first to manage sponsorships.</p>
      </Card>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const totalSponsoredAmount = deals.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sponsor Management</h1>
          <p className="text-gray-500 mt-1">
            Manage sponsors, sponsorship deals, and see sponsor history per event.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSponsor(null);
            setIsSponsorModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sponsor
        </Button>
      </div>

      {/* Event selector */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sponsors list */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Sponsors">
            {sponsors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No sponsors yet. Add one using the button above.
              </p>
            ) : (
              <div className="space-y-3 max-h-[26rem] overflow-y-auto">
                {sponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                      selectedSponsorForHistory?.id === sponsor.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } cursor-pointer`}
                    onClick={() => loadSponsorHistory(sponsor)}
                  >
                      <div className="flex gap-2">
                      <DollarSign className="w-4 h-4 text-amber-500 mt-1" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {sponsor.name}
                        </p>
                        {sponsor.company_type && (
                          <p className="text-xs text-gray-500">
                            {sponsor.company_type}
                          </p>
                        )}
                        {sponsor.contact_person && (
                          <p className="text-xs text-gray-500 mt-1">
                            Contact: {sponsor.contact_person}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSponsor(sponsor);
                          setIsSponsorModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSponsor(sponsor.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sponsor history */}
          <Card title="Sponsor History">
            {!selectedSponsorForHistory ? (
              <p className="text-gray-500 text-center py-6 text-sm">
                Select a sponsor on the left to view all events they sponsor.
              </p>
            ) : historyDeals.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">
                No sponsorship deals found for {selectedSponsorForHistory.name}.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {historyDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 border border-gray-200 rounded-lg text-xs text-gray-700"
                  >
                    <p className="font-semibold text-gray-900 text-sm">
                      {(deal as any).event_title || 'Event'}
                    </p>
                    {(deal as any).event_date && (
                      <p className="text-gray-500">
                        {(deal as any).event_date}
                      </p>
                    )}
                    {deal.amount && (
                      <p className="mt-1">
                        Amount: Rs.{deal.amount.toFixed(2)} ({deal.package || 'Custom'})
                      </p>
                    )}
                    <p className="mt-1">
                      Deal: {deal.deal_status} · Payment: {deal.payment_status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Deals for selected event */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Sponsorship Deals ({deals.length})
            </h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingDeal(null);
                setIsDealModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Deal
            </Button>
          </div>

          {deals.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8 text-sm">
                No sponsorship deals for this event yet. Add one to start tracking
                sponsors and packages.
              </p>
            </Card>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Sponsor
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Package
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                      Benefits
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deals.map((deal) => {
                    const sponsor = sponsors.find((s) => s.id === deal.sponsor_id);
                    return (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {sponsor ? sponsor.name : 'Unknown'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {deal.package || 'Custom'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {deal.amount ? `Rs.${deal.amount.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                deal.deal_status === 'Paid'
                                  ? 'bg-green-100 text-green-700'
                                  : deal.deal_status === 'Confirmed'
                                  ? 'bg-blue-100 text-blue-700'
                                  : deal.deal_status === 'Proposed'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {deal.deal_status}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                deal.payment_status === 'Paid'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {deal.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600 max-w-xs">
                          <div className="flex items-start gap-1">
                            <Link2 className="w-3 h-3 mt-0.5 text-gray-400" />
                            <span className="line-clamp-3">
                              {deal.benefits || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingDeal(deal);
                                setIsDealModalOpen(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeal(deal.id)}
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

          <Card title="Summary">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
              <div>
                <p className="text-gray-500 text-xs">Total Sponsors</p>
                <p className="text-lg font-semibold text-gray-900">{sponsors.length}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Deals for Selected Event</p>
                <p className="text-lg font-semibold text-gray-900">{deals.length}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total Sponsored Amount (Event)</p>
                <p className="text-lg font-semibold text-green-600">
                  Rs.{totalSponsoredAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sponsor Modal */}
      <Modal
        isOpen={isSponsorModalOpen}
        title={editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}
        onClose={() => {
          setIsSponsorModalOpen(false);
          setEditingSponsor(null);
        }}
        onSubmit={handleCreateOrUpdateSponsor}
        fields={sponsorFields}
        defaultValues={editingSponsor || {}}
      />

      {/* Deal Modal */}
      <Modal
        isOpen={isDealModalOpen}
        title={editingDeal ? 'Edit Sponsorship Deal' : 'Add Sponsorship Deal'}
        onClose={() => {
          setIsDealModalOpen(false);
          setEditingDeal(null);
        }}
        onSubmit={handleCreateOrUpdateDeal}
        fields={dealFields}
        defaultValues={editingDeal || {}}
      />
    </div>
  );
};

