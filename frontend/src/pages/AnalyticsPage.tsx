import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, CheckCircle, TrendingUp, Download } from 'lucide-react';
import { api } from '../services/api';

interface Event {
  id: string;
  title: string;
  date: string;
  status: string;
  budget?: number;
}

interface Analytics {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalGuests: number;
  totalBudget: number;
  totalExpenses: number;
  eventsByMonth: Array<{ month: string; count: number }>;
  eventsByStatus: Array<{ status: string; count: number }>;
  budgetByEvent: Array<{ event: string; budget: number; expenses: number }>;
}

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const eventsResponse = await api.get('/events');
      const events = eventsResponse.data;

      // Calculate analytics
      const totalEvents = events.length;
      const publishedEvents = events.filter(
        (e: Event) => e.status === 'Published'
      ).length;
      const draftEvents = events.filter((e: Event) => e.status === 'Draft').length;

      // Group by month
      const eventsByMonth = groupEventsByMonth(events);
      const eventsByStatus = [
        { status: 'Published', count: publishedEvents },
        { status: 'Draft', count: draftEvents },
        {
          status: 'Cancelled',
          count: events.filter((e: Event) => e.status === 'Cancelled').length,
        },
      ].filter((e) => e.count > 0);

      // Calculate budgets (mock data since API doesn't return budget)
      const totalBudget = events.length * 5000;
      const totalExpenses = events.length * 3000;
      const budgetByEvent = events.slice(0, 5).map((e: Event) => ({
        event: e.title.substring(0, 10),
        budget: 5000,
        expenses: 3000,
      }));

      setAnalytics({
        totalEvents,
        publishedEvents,
        draftEvents,
        totalGuests: totalEvents * 50,
        totalBudget,
        totalExpenses,
        eventsByMonth,
        eventsByStatus,
        budgetByEvent,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByMonth = (events: Event[]) => {
    const months: { [key: string]: number } = {};
    events.forEach((event) => {
      const date = new Date(event.date);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      months[monthKey] = (months[monthKey] || 0) + 1;
    });

    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const downloadReport = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    const lineHeight = 8;
    let y = 15;

    doc.setFontSize(16);
    doc.text('Analytics & Reports', 14, y);
    y += lineHeight + 4;

    doc.setFontSize(11);
    doc.text(`Total Events: ${analytics.totalEvents}`, 14, y);
    y += lineHeight;
    doc.text(`Published Events: ${analytics.publishedEvents}`, 14, y);
    y += lineHeight;
    doc.text(`Draft Events: ${analytics.draftEvents}`, 14, y);
    y += lineHeight;
    doc.text(`Total Guests (approx): ${analytics.totalGuests}`, 14, y);
    y += lineHeight;

    doc.text(`Total Budget: ${analytics.totalBudget.toLocaleString()}`, 14, y);
    y += lineHeight;
    doc.text(
      `Total Expenses: ${analytics.totalExpenses.toLocaleString()}`,
      14,
      y
    );
    y += lineHeight;

    const budgetRemaining = analytics.totalBudget - analytics.totalExpenses;
    const budgetPercentage = (
      (analytics.totalExpenses / analytics.totalBudget) *
      100
    ).toFixed(1);

    doc.text(
      `Remaining Budget: ${budgetRemaining.toLocaleString()}`,
      14,
      y
    );
    y += lineHeight;
    doc.text(`Budget Used: ${budgetPercentage}%`, 14, y);
    y += lineHeight + 4;

    doc.setFontSize(12);
    doc.text('Events by Month:', 14, y);
    y += lineHeight;
    doc.setFontSize(10);
    analytics.eventsByMonth.forEach(({ month, count }) => {
      doc.text(`- ${month}: ${count}`, 18, y);
      y += lineHeight;
    });

    y += 2;
    doc.setFontSize(12);
    doc.text('Events by Status:', 14, y);
    y += lineHeight;
    doc.setFontSize(10);
    analytics.eventsByStatus.forEach(({ status, count }) => {
      doc.text(`- ${status}: ${count}`, 18, y);
      y += lineHeight;
    });

    y += 2;
    doc.setFontSize(12);
    doc.text('Budget by Event (top 5):', 14, y);
    y += lineHeight;
    doc.setFontSize(10);
    analytics.budgetByEvent.forEach(({ event, budget, expenses }) => {
      doc.text(
        `- ${event}: Budget ${budget.toLocaleString()}, Expenses ${expenses.toLocaleString()}`,
        18,
        y
      );
      y += lineHeight;
    });

    doc.save('analytics-report.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Failed to load analytics</p>
      </div>
    );
  }

  const budgetRemaining = analytics.totalBudget - analytics.totalExpenses;
  const budgetPercentage = (
    (analytics.totalExpenses / analytics.totalBudget) *
    100
  ).toFixed(1);

  const colors = ['#4F46E5', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6'];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Performance insights and event statistics</p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Download size={20} />
          Download Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalEvents}
              </p>
            </div>
            <Calendar className="text-indigo-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {analytics.publishedEvents}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Guests</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {analytics.totalGuests}
              </p>
            </div>
            <Users className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Budget Status</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {budgetPercentage}%
              </p>
            </div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Events by Month */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Events by Month
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.eventsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ fill: '#4F46E5', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Events by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Events by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.eventsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.eventsByStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget by Event */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget by Event
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.budgetByEvent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="event" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#4F46E5" />
              <Bar dataKey="expenses" fill="#EC4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Budget Summary
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Budget</span>
                <span className="text-2xl font-bold text-gray-900">
                  Rs.{analytics.totalBudget.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Expenses</span>
                <span className="text-2xl font-bold text-red-600">
                  Rs.{analytics.totalExpenses.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Remaining Budget</span>
                <span className="text-2xl font-bold text-green-600">
                  Rs.{budgetRemaining.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {budgetPercentage}% of budget spent
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Avg. Budget/Event</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs.{(analytics.totalBudget / analytics.totalEvents).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Expenses/Event</p>
                <p className="text-xl font-bold text-gray-900">
                  Rs.{(analytics.totalExpenses / analytics.totalEvents).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
