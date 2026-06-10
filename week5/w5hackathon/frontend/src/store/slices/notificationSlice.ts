import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'danger';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
