import React from 'react';
import { Car } from 'lucide-react';
import { Notification } from '../../store/notification.store';

interface BookingConfirmationNotificationProps {
  notification: Notification;
  timePassed: string;
}

const BookingConfirmationNotification: React.FC<BookingConfirmationNotificationProps> = ({
  notification,
  timePassed
}) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          <Car className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h3>
              {notification.vehicleName && (
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-600 font-medium">
                    {notification.vehicleName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Automatic</span>
                    <span>•</span>
                    <span>5 Seaters</span>
                    <span>•</span>
                    <span>Petrol</span>
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {timePassed}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationNotification;