import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const socketRef = useRef(null);

  // Custom Toast Trigger
  const triggerToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Automatically remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Fetch notifications list
  const fetchNotifications = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      await axios.patch(
        `http://localhost:3000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err.message);
    }
  };

  // Connect / Disconnect socket based on user authentication state
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (user && token) {
      // Connect to NestJS backend Socket.IO
      const newSocket = io('http://localhost:3000', {
        query: { token },
        transports: ['websocket'],
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      fetchNotifications();

      // Listen for direct notifications (Replies, Likes, Admin deletion, Webhooks)
      newSocket.on('new-notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        triggerToast(notification.title, notification.message, notification.type);
      });

      // Listen for broadcast new reviews
      newSocket.on('new-review', (data) => {
        // Trigger visual toast to everyone online
        triggerToast(
          'New Product Review!',
          `Someone left a ${data.review.rating}★ rating on "${data.productName}"`,
          'review'
        );

        // Dispatches event to document so active ProductDetail page can catch it
        const event = new CustomEvent('broadcast-review', { detail: data });
        document.dispatchEvent(event);
      });

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        triggerToast,
        fetchNotifications,
      }}
    >
      {children}

      {/* Modern Glassmorphic Floating Toasts Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let badgeColor = 'bg-[#10B981]'; // Success / reply
          if (toast.type === 'like') badgeColor = 'bg-pink-500';
          if (toast.type === 'review') badgeColor = 'bg-amber-500';
          if (toast.type === 'price_change' || toast.type === 'stock_change') badgeColor = 'bg-blue-500';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto w-full bg-white/80 dark:bg-[#1A1A1A]/85 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-4 rounded-lg flex items-start gap-3 animate-slide-in relative overflow-hidden transition-all duration-300"
              style={{
                animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              {/* Top Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${badgeColor}`} />
              
              <div className="flex-1 mt-1">
                <h4 className="text-[12px] font-bold text-black dark:text-white uppercase tracking-wider mb-0.5">
                  {toast.title}
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-normal font-medium">
                  {toast.message}
                </p>
              </div>
              
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white text-[14px] font-bold leading-none select-none transition-colors"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

      {/* Inject slide-in styles into DOM */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateY(1.5rem) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
