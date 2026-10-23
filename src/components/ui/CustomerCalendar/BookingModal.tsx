import React from "react";

interface BookingModalProps {
  show: boolean;
  loading: boolean;
  vehicleName: string;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  formatDisplay: (date: Date | null) => string;
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ show, loading, vehicleName, selectedStart, selectedEnd, startTime, endTime, totalHours, totalPrice, formatDisplay, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-lg mb-4">Confirm Booking</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-2">
          <p><strong>Vehicle:</strong> {vehicleName}</p>
          <p><strong>Dates:</strong> {formatDisplay(selectedStart)} → {formatDisplay(selectedEnd)}</p>
          <p><strong>Time:</strong> {startTime} - {endTime}</p>
          <p><strong>Total Hours:</strong> {totalHours}</p>
          <p><strong>Total Price:</strong> ₹{totalPrice}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
            {loading ? "Booking..." : "Confirm"}
          </button>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
