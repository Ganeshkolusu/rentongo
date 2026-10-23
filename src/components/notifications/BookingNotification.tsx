import React from 'react';
import { Car } from 'lucide-react';
import { useNotificationStore } from '../../store/notification.store';
import { bookingsApi } from '../../features/bookings/bookings.api';

interface BookingNotificationProps {
  notificationId: string;
  vehicleName: string;
  vehicleId: string;
  bookingId: string;
  timePassed?: string;
}

const BookingNotification: React.FC<BookingNotificationProps> = ({
  notificationId,
  vehicleName,
  vehicleId,
  bookingId,
  timePassed = '6 min ago'
}) => {
  const { deleteNotification } = useNotificationStore();

  const handleConfirm = async () => {
    try {
      await bookingsApi.confirmBooking(bookingId);
      deleteNotification(notificationId);
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleDecline = async () => {
    try {
      await bookingsApi.cancelBooking(bookingId);
      deleteNotification(notificationId);
    } catch (error) {
      console.error('Error declining booking:', error);
    }
  };

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
                your car has been booked?
              </h3>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-gray-600 font-medium">{vehicleName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Automatic</span>
                  <span>•</span>
                  <span>5 Seaters</span>
                  <span>•</span>
                  <span>Petrol</span>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {timePassed}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Yes
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingNotification;