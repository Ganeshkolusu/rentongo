import React from "react";
import { X } from "lucide-react";

interface Booking {
  id: string;
  from: string;
  to: string;
  fromTime: string;
  toTime: string;
  status: string;
  isConfirmed: boolean;
  customerId: string;
}

interface MyBookingsModalProps {
  show: boolean;
  bookings: Booking[];
  loading: boolean;
  onCancelBooking: (booking: Booking) => void;
  onClose: () => void;
}

const MyBookingsModal: React.FC<MyBookingsModalProps> = ({ show, bookings, loading, onCancelBooking, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">My Bookings</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet</p>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{b.from} → {b.to}</p>
                    <p className="text-sm text-gray-500">{b.fromTime} - {b.toTime}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${b.isConfirmed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {b.status || 'Pending'}
                  </span>
                </div>
                <button onClick={() => onCancelBooking(b)} disabled={loading} className="w-full px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 disabled:opacity-50">
                  Cancel Booking
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsModal;
