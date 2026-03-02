import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { LoginPage } from './pages/LoginPage';
import { EventsPage } from './pages/EventsPage';
import { GuestsPage } from './pages/GuestsPage';
import { SchedulePage } from './pages/SchedulePage';
import { BudgetPage } from './pages/BudgetPage';
import { CalendarPage } from './pages/CalendarPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { VenuesPage } from './pages/VenuesPage';
import { TicketingPage } from './pages/TicketingPage';
import './index.css';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NotificationsProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/app/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      <Route
                        path="events"
                        element={
                          <AppLayout>
                            <EventsPage />
                          </AppLayout>
                        }
                      />
                      <Route
                        path="guests"
                        element={
                          <AppLayout>
                            <GuestsPage />
                          </AppLayout>
                        }
                      />
                      <Route
                        path="schedule"
                        element={
                          <AppLayout>
                            <SchedulePage />
                          </AppLayout>
                        }
                      />
                      <Route
                        path="budget"
                        element={
                          <AppLayout>
                            <BudgetPage />
                          </AppLayout>
                        }
                      />
                      <Route
                        path="ticketing"
                        element={
                          <AppLayout>
                            <TicketingPage />
                          </AppLayout>
                        }
                      />
                      <Route
                        path="venues"
                        element={
                          <AppLayout>
                            <VenuesPage />
                          </AppLayout>
                        }
                      />
                      <Route
                        path="calendar"
                        element={
                          <AppLayout>
                            <CalendarPage />
                          </AppLayout>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <AppLayout>
                            <AnalyticsPage />
                          </AppLayout>
                        }
                      />
                      <Route path="*" element={<Navigate to="/app/events" />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <Toast />
          </NotificationsProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
