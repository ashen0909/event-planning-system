import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface Notification {
  id: string;
  user_id: string;
  event_id?: string;
  type: string;
  title: string;
  message: string;
  reminder_time?: string;
  is_read: number;
  created_at: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
      
      // Fetch unread count
      const countResponse = await api.get('/notifications/unread/count');
      setUnreadCount(countResponse.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: 1 } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: 1 }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      // Refetch unread count
      const countResponse = await api.get('/notifications/unread/count');
      setUnreadCount(countResponse.data.unreadCount);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider'
    );
  }
  return context;
};
