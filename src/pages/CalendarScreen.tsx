import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CalendarScreen: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("06:00");
  const [endTime, setEndTime] = useState<string>("08:00");

  const handleConfirm = () => {
    navigate("/ListedCars");
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
          Availability Date & Time
        </h1>

        {/* Dates */}
        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Times: stack on mobile, side-by-side on md+ */}
        <div className="flex flex-col md:flex-row md:gap-4 mb-6">
          <div className="flex-1 mb-4 md:mb-0">
            <label className="block text-gray-600 mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-600 mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-2 rounded-lg hover:opacity-90 transition-all text-sm sm:text-base"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default CalendarScreen;
