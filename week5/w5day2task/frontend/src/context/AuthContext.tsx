'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

// Configure standard API base URL
export const API_BASE_URL = 'http://localhost:3001/api';
axios.defaults.baseURL = API_BASE_URL;

interface User {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  followers?: string[];
  following?: string[];
}

interface Notification {
  _id: string;
  recipient: string;
  sender: {
    username: string;
    profilePicture: string;
  };
  type: 'comment' | 'reply' | 'like' | 'follow';
  comment?: {
    content: string;
  };
  read: boolean;
  message: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  socket: Socket | null;
  notifications: Notification[];
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (notif: Notification) => void;
  markNotificationsAsRead: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchNotifications(storedToken);
    }
    setLoading(false);
  }, []);

  const fetchNotifications = async (authToken: string) => {
    try {
      const res = await axios.get('/notifications', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Manage WebSockets Connection based on User authentication state
  useEffect(() => {
    if (token && user) {
      // Connect to WebSocket gateway
      const newSocket = io('http://localhost:3001', {
        auth: { token },
        query: { token },
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket gateway');
      });

      // Receive personalized notifications in real-time
      newSocket.on('notification.received', (newNotif: Notification) => {
        setNotifications((prev) => [newNotif, ...prev]);
        // Trigger generic browser notification toaster if permission given
        if (Notification.permission === 'granted') {
          new Notification(newNotif.message);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(null);
    }
  }, [token, user]);

  // Request browser notification permissions on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    fetchNotifications(userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setNotifications([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    if (socket) {
      socket.disconnect();
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updatedUser };
      setUser(merged);
      localStorage.setItem('user', JSON.stringify(merged));
    }
  };

  const addNotification = (notif: Notification) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const markNotificationsAsRead = async () => {
    if (!token) return;
    try {
      await axios.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        socket,
        notifications,
        login,
        logout,
        updateUser,
        setNotifications,
        addNotification,
        markNotificationsAsRead,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
