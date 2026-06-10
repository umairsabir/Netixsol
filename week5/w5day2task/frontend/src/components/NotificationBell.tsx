'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, MessageSquare, CornerDownRight, Heart, UserPlus } from 'lucide-react';
import axios from 'axios';

export default function NotificationBell() {
  const { notifications, markNotificationsAsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'reply':
        return <CornerDownRight className="w-4 h-4 text-indigo-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-all duration-200 focus:outline-none cursor-pointer"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/40">
            <h3 className="text-sm font-bold text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markNotificationsAsRead}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-900">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-10 h-10 text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-sm text-slate-500">All caught up!</p>
                <p className="text-xs text-slate-600">Real-time alerts will appear here.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex gap-3 p-4 transition-colors duration-200 hover:bg-slate-900/50 ${
                    !notif.read ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={notif.sender?.profilePicture || 'https://api.dicebear.com/7.x/adventurer/svg'}
                      alt={notif.sender?.username}
                      className="w-10 h-10 rounded-full bg-slate-800 border border-slate-800"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-slate-950 rounded-full border border-slate-900">
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 leading-snug">
                      <span className="font-bold text-slate-100">{notif.sender?.username}</span>{' '}
                      {notif.type === 'like' && 'liked your comment'}
                      {notif.type === 'reply' && 'replied to your comment'}
                      {notif.type === 'comment' && 'commented on a post'}
                      {notif.type === 'follow' && 'started following you'}
                    </p>
                    {notif.comment && (
                      <p className="mt-1 text-xs text-slate-500 truncate italic">
                        "{notif.comment.content}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
