import React from 'react';
import { useNotificationStore } from '../../store/notification.store';
import RideCompletionNotification from './RideCompletionNotification';
import BookingConfirmationNotification from './BookingConfirmationNotification';

const NotificationsList = () => {
  const { notifications } = useNotificationStore();

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {notifications.map((notification) => {
        switch (notification.type) {
          case 'ride_completed':
            return (
              <RideCompletionNotification
                key={notification.id}
                rideId={notification.vehicleId || ''}
                vehicleName={notification.vehicleName}
                timePassed={getTimePassed(notification.timestamp)}
              />
            );
          case 'booking_confirmed':
            return (
              <BookingConfirmationNotification
                key={notification.id}
                notification={notification}
                timePassed={getTimePassed(notification.timestamp)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

const getTimePassed = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

export default NotificationsList;