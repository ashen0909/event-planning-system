import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { eventService, budgetService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Event, Vendor, Expense } from '../types';
import { Modal, FieldConfig } from '../components/Modal';
import { Card, Button } from '../components/Common';

interface BudgetSummary {
  expenses: Expense[];
  summary: {
    totalEstimated: number;
    totalSpent: number;
    remaining: number;
  };
}

export const BudgetPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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
      addToast('Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [vendorsRes, expensesRes] = await Promise.all([
        budgetService.getVendors(selectedEventId),
        budgetService.getExpenses(selectedEventId),
      ]);
      setVendors(vendorsRes.data);
      setBudgetData(expensesRes.data);
    } catch (error: any) {
      addToast('Failed to load budget data', 'error');
    }
  };

  const handleCreateOrUpdateVendor = async (formData: Record<string, any>) => {
    try {
      if (editingVendor) {
        await budgetService.updateVendor(selectedEventId, editingVendor.id, formData);
        addToast('Vendor updated', 'success');
      } else {
        await budgetService.createVendor(selectedEventId, formData);
        addToast('Vendor added', 'success');
      }
      setEditingVendor(null);
      loadData();
    } catch (error: any) {
      addToast('Operation failed', 'error');
    }
  };

  const handleCreateOrUpdateExpense = async (formData: Record<string, any>) => {
    try {
      if (editingExpense) {
        await budgetService.updateExpense(selectedEventId, editingExpense.id, formData);
        addToast('Expense updated', 'success');
      } else {
        await budgetService.createExpense(selectedEventId, formData);
        addToast('Expense added', 'success');
      }
      setEditingExpense(null);
      loadData();
    } catch (error: any) {
      addToast('Operation failed', 'error');
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try {
      await budgetService.deleteVendor(selectedEventId, id);
      addToast('Vendor deleted', 'success');
      loadData();
    } catch (error: any) {
      addToast('Delete failed', 'error');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await budgetService.deleteExpense(selectedEventId, id);
      addToast('Expense deleted', 'success');
      loadData();
    } catch (error: any) {
      addToast('Delete failed', 'error');
    }
  };

  const vendorFields: FieldConfig[] = [
    { name: 'name', label: 'Vendor Name', type: 'text', required: true },
    {
      name: 'service_type',
      label: 'Service Type',
      type: 'select',
      required: true,
      options: [
        { value: 'Catering', label: 'Catering' },
        { value: 'Hall', label: 'Hall/Venue' },
        { value: 'Photography', label: 'Photography' },
        { value: 'Decoration', label: 'Decoration' },
        { value: 'Music', label: 'Music/DJ' },
        { value: 'Transport', label: 'Transport' },
        { value: 'Other', label: 'Other' },
      ],
    },
    { name: 'contact', label: 'Contact Info', type: 'text', placeholder: 'Email or phone' },
    { name: 'price_estimate', label: 'Price Estimate', type: 'number', placeholder: '0.00' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const expenseFields: FieldConfig[] = [
    { name: 'title', label: 'Expense Title', type: 'text', required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0.00' },
    {
      name: 'payment_status',
      label: 'Payment Status',
      type: 'select',
      options: [
        { value: 'Paid', label: 'Paid' },
        { value: 'Unpaid', label: 'Unpaid' },
      ],
    },
    { name: 'receipt_url', label: 'Receipt URL', type: 'text', placeholder: 'https://...' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading...</p></div>;
  }

  if (events.length === 0) {
    return <Card title="No Events"><p className="text-gray-500">Create an event first</p></Card>;
  }

  const expenses = budgetData?.expenses || [];
  const summary = budgetData?.summary || { totalEstimated: 0, totalSpent: 0, remaining: 0 };
  const percentSpent = summary.totalEstimated > 0 ? (summary.totalSpent / summary.totalEstimated) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget & Vendors</h1>
        <p className="text-gray-500 mt-1">Manage vendors and track expenses</p>
      </div>

      <Card title="Select Event">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </Card>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Estimated">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Estimated</p>
            <p className="text-3xl font-bold text-green-600">Rs.{summary.totalEstimated.toFixed(2)}</p>
          </div>
        </Card>
        <Card title="Total Spent">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-blue-600">Rs.{summary.totalSpent.toFixed(2)}</p>
          </div>
        </Card>
        <Card title="Remaining">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Remaining</p>
            <p className={`text-3xl font-bold ${summary.remaining >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
              Rs.{summary.remaining.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card title="Budget Progress">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Rs.{summary.totalSpent.toFixed(2)} of Rs.{summary.totalEstimated.toFixed(2)}</span>
            <span className="text-gray-500">{percentSpent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${percentSpent <= 75 ? 'bg-green-500' : percentSpent <= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Vendors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Vendors ({vendors.length})</h2>
          <Button size="sm" onClick={() => {
            setEditingVendor(null);
            setIsVendorModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {vendors.length === 0 ? (
          <Card title="Vendors"><p className="text-gray-500 text-center py-4">No vendors added</p></Card>
        ) : (
          <div className="grid gap-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id} title={vendor.name} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{vendor.name}</h4>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {vendor.service_type}
                      </span>
                    </div>
                    {vendor.contact && <p className="text-sm text-gray-600">{vendor.contact}</p>}
                    {vendor.notes && <p className="text-sm text-gray-500 mt-1">{vendor.notes}</p>}
                    {vendor.price_estimate && (
                      <p className="text-lg font-bold text-green-600 mt-2">Rs.{vendor.price_estimate.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingVendor(vendor);
                        setIsVendorModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Expenses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Expenses ({expenses.length})</h2>
          <Button size="sm" onClick={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {expenses.length === 0 ? (
          <Card title="Expenses"><p className="text-gray-500 text-center py-4">No expenses recorded</p></Card>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{expense.title}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-blue-600">Rs.{expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        expense.payment_status === 'Paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {expense.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setIsExpenseModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
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
      </div>

      <Modal
        isOpen={isVendorModalOpen}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        onClose={() => {
          setIsVendorModalOpen(false);
          setEditingVendor(null);
        }}
        onSubmit={handleCreateOrUpdateVendor}
        fields={vendorFields}
        defaultValues={editingVendor || {}}
      />

      <Modal
        isOpen={isExpenseModalOpen}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleCreateOrUpdateExpense}
        fields={expenseFields}
        defaultValues={editingExpense || {}}
      />
    </div>
  );
};
