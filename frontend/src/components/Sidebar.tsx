import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, Clock, DollarSign, LogOut, BarChart3, Ticket as TicketIcon, MapPin, DollarSign as SponsorIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { addToast } = useToast();

  const menuItems = [
    { path: '/app/events', icon: Calendar, label: 'Events', color: 'text-blue-600' },
    { path: '/app/calendar', icon: Calendar, label: 'Calendar', color: 'text-cyan-600' },
    { path: '/app/guests', icon: Users, label: 'Guests', color: 'text-purple-600' },
    { path: '/app/schedule', icon: Clock, label: 'Schedule & Tasks', color: 'text-orange-600' },
    { path: '/app/budget', icon: DollarSign, label: 'Budget & Vendors', color: 'text-green-600' },
    { path: '/app/ticketing', icon: TicketIcon, label: 'Ticketing & Reg', color: 'text-pink-600' },
    { path: '/app/venues', icon: MapPin, label: 'Venues', color: 'text-red-600' },
    { path: '/app/sponsors', icon: SponsorIcon, label: 'Sponsor Management', color: 'text-amber-600' },
    { path: '/app/analytics', icon: BarChart3, label: 'Analytics', color: 'text-indigo-600' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      addToast('Logged out successfully', 'success');
    } catch {
      addToast('Logout failed', 'error');
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sticky top-0">
      {/* Logo/Title with Notifications */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Eventora</h1>
          <p className="text-xs text-gray-500 mt-1">Manage your events</p>
        </div>
        <NotificationsDropdown />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map(({ path, icon: Icon, label, color }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
          <div className="mt-2 inline-block">
            <span
              className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                user?.role === 'ADMIN'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
