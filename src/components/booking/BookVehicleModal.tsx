import React, { useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import DateTimePicker from '../ui/DateTimePicker';
import Button from '../ui/Button';

interface BookVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
}

export const BookVehicleModal: React.FC<BookVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
}) => {
  // Use string dates compatible with your DateTimePicker
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);

  const { createBooking, isLoading, error } = useBooking();

  if (!isOpen) return null;

  const handleBooking = async () => {
    try {
      await createBooking({
        vehicleId,
        vehicleName,
        startDate: new Date(startDate), // convert string to Date
      endDate: new Date(endDate),     // convert string to Date
      userId: 'current-user-id', // Get from auth context in production
      });
      onClose();
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Book {vehicleName}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DateTimePicker
              value={startDate}
              onChange={setStartDate}
              minDate={today}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DateTimePicker
              value={endDate}
              onChange={setEndDate}
              minDate={startDate} // endDate cannot be before startDate
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleBooking} loading={isLoading}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
