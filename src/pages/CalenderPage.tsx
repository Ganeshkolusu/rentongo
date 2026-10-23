import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("06:00");
  const [endTime, setEndTime] = useState<string>("08:00");

  const handleConfirm = () => {
    navigate("/Notifications");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-gray-200">
        <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-center border-b border-gray-300 pb-3">
          Booking Confirmation
        </h1>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Time Section */}
        <div className="mb-6">
          <h2 className="text-gray-700 font-medium mb-3">Select Time</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center sm:justify-end mt-6">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-base font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
