'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';
import api from '@/lib/api';

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  markRead: async () => {},
  markAllRead: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { user, refreshUser } = useAuth();
  const [socket, setSocket] = useState<any>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err: any) {
      // 401 is expected when session expires - silently ignore
      if (err?.response?.status !== 401) {
        console.error('Failed to fetch notifications:', err);
      }
    }
  }, [user]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      // 401 is expected when session expires - silently ignore
      if (err?.response?.status !== 401) {
        console.error('Failed to mark notification as read:', err);
      }
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      // 401 is expected when session expires - silently ignore
      if (err?.response?.status !== 401) {
        console.error('Failed to mark all as read:', err);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    let s: any = null;

    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        s = io(backendUrl, { transports: ['websocket', 'polling'] });
        setSocket(s);

        s.on('connect', () => {
          s.emit('join', user._id || user.id);
        });

        s.on('notification', (notif: NotificationItem) => {
          setNotifications(prev => [notif, ...prev]);
          toast(notif.title, { 
             description: notif.message,
             action: notif.link ? {
                label: 'View',
                onClick: () => window.location.href = notif.link!
             } : undefined
          });
          // Refresh user if points might have changed (e.g. delivered)
          if (notif.type === 'status_updated') refreshUser();
        });

        s.on('order_updated', () => {
          refreshUser();
          fetchNotifications();
        });

        s.on('sale_started', (sale: any) => {
          toast(`🔥 Sale Started: ${sale.name}`, { 
            description: `${sale.discountType === 'percentage' ? `${sale.discountValue}%` : `$${sale.discountValue}`} OFF!`,
          });
        });
      } catch (err) {
        console.warn('Socket connection failed:', err);
      }
    };

    connectSocket();

    return () => {
      if (s) s.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
