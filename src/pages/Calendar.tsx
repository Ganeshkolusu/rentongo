import React, { useState } from "react";

interface CalendarProps {
  onConfirm: (startDate: string, endDate: string, startTime: string, endTime: string) => void;
  onClose?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ onConfirm, onClose }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("18:00");
  const [endTime, setEndTime] = useState<string>("20:00");
  const [availability, setAvailability] = useState<"Available" | "Not Available">("Available");

  const handleConfirm = () => {
    if (!startDate || !endDate || !startTime || !endTime) {
      alert("Please select all fields before confirming.");
      return;
    }
    onConfirm(startDate, endDate, startTime, endTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[900px] p-6 flex flex-col sm:flex-row gap-6 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        {/* Left: Calendar */}
        <div className="flex-1 border rounded-lg p-4 h-[400px] flex flex-col">
          <label className="text-gray-500 text-sm mb-2">Select Start and End Dates</label>
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 border rounded-lg p-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 border rounded-lg p-2"
            />
          </div>
          {/* You can integrate a real calendar component here, e.g., react-datepicker */}
        </div>

        {/* Right: Time + Availability */}
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="text-gray-500 text-sm">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as "Available" | "Not Available")}
              className="mt-1 w-full border rounded-lg p-2 bg-green-100 text-green-700"
            >
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-auto bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white py-2 rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
