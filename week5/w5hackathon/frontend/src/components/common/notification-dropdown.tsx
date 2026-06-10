"use client";
import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, ExternalLink, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { markAsRead, markAllAsRead, Notification } from '@/store/slices/notificationSlice';
import { useRouter } from 'next/navigation';

export default function NotificationDropdown({ isTransparent = false }: { isTransparent?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    dispatch(markAsRead(notification._id));
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'danger': return <X className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 ${isTransparent ? 'text-white hover:text-[#f9c146]' : 'text-[#2e3d83] hover:text-[#3b4fa8]'} hover:bg-white/20 rounded-full transition-all`}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <h3 className="text-sm font-bold text-[#2e3d83]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllAsRead())}
                className="text-xs font-semibold text-[#2e3d83] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <Bell className="text-gray-300" size={32} />
                </div>
                <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you when something important happens.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex gap-3 px-4 py-4 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                      !notification.isRead ? 'bg-[#F1F2FF] hover:bg-[#E8E9FF]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="mt-1 shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[13px] font-bold leading-tight ${
                          !notification.isRead ? 'text-[#2e3d83]' : 'text-[#545677]'
                        }`}>
                          {notification.title}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#898989] leading-normal line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <span className="text-[10px] font-bold text-[#2e3d83] mt-1 flex items-center gap-1">
                          View details <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                    {!notification.isRead && (
                      <div className="mt-2 shrink-0">
                        <div className="h-2 w-2 rounded-full bg-[#2e3d83]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 flex justify-center">
             <button className="text-[11px] font-bold text-[#898989] uppercase tracking-wider hover:text-[#2e3d83] transition-colors">
               See all history
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
