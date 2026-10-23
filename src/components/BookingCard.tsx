import React from "react";
import { Booking } from "../types/booking";

interface BookingCardProps {
  booking: Booking;
  onDelete: (id: string) => void;
  onBookAgain: (booking: Booking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onDelete,
  onBookAgain,
}) => (
  <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <img
        src={booking.vehicleImage}
        alt={booking.vehicleName}
        className="w-20 h-20 rounded-lg object-cover"
      />
      <div>
        <h3 className="text-lg font-semibold">{booking.vehicleName}</h3>
        <p className="text-gray-600">
          {booking.startDate} → {booking.endDate || "—"}
        </p>
        <p className="text-gray-500 text-sm">
          {booking.startTime} – {booking.endTime}
        </p>
        <p className="font-medium mt-1">₹{booking.price}</p>
      </div>
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => onBookAgain(booking)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Book Again
      </button>
      <button
        onClick={() => onDelete(booking.id)}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Delete
      </button>
    </div>
  </div>
);

export default BookingCard;
