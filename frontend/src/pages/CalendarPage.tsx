import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
}

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day: number) => {
    // Build a YYYY-MM-DD string in local time to avoid timezone-related date shifts
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 0-based
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;

    return events.filter((event) => event.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/app/events/${eventId}`);
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDate(day);
    setSelectedDay(day);
    setSelectedDate(dayEvents);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
        <p className="text-gray-600 mt-2">View all your events in a calendar format</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{monthName}</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft size={24} className="text-gray-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday =
                day &&
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                  .toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  onClick={() => day && handleDayClick(day)}
                  className={`min-h-24 p-2 rounded-lg cursor-pointer transition ${
                    day
                      ? isToday
                        ? 'bg-blue-50 border-2 border-blue-400 hover:bg-blue-100'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      : 'bg-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <div
                        className={`font-semibold mb-1 text-sm ${
                          isToday ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event.id);
                            }}
                            className="w-full text-left bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600 truncate"
                            title={event.title}
                          >
                            {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-gray-600 text-xs px-2">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {selectedDay !== null ? 'Selected Date Events' : 'All Events'}
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedDay !== null ? (
              selectedDate.length > 0 ? (
                selectedDate.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event.id)}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                  >
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      📅 {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">⏰ {event.time}</p>
                    {event.location && (
                      <p className="text-sm text-gray-600 mt-2">📍 {event.location}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No events scheduled for this date</p>
                </div>
              )
            ) : (
              events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">⏰ {event.time}</p>
                  {event.location && (
                    <p className="text-sm text-gray-600 mt-2">📍 {event.location}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {events.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No events scheduled yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
