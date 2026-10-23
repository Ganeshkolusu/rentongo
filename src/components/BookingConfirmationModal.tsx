// src/components/BookingConfirmationModal.tsx
import React from "react";
import { X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  ) => void;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [showDateTimeSelection, setShowDateTimeSelection] = React.useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = React.useState(false);

  // Calendar & Date States
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = React.useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = React.useState<Date | null>(null);
  const [activeInput, setActiveInput] = React.useState<"start" | "end" | null>(null);

  // Time States
  const [startTime, setStartTime] = React.useState("06 PM");
  const [endTime, setEndTime] = React.useState("08 PM");

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeOptions = [
    "12 AM", "01 AM", "02 AM", "03 AM", "04 AM", "05 AM",
    "06 AM", "07 AM", "08 AM", "09 AM", "10 AM", "11 AM",
    "12 PM", "01 PM", "02 PM", "03 PM", "04 PM", "05 PM",
    "06 PM", "07 PM", "08 PM", "09 PM", "10 PM", "11 PM"
  ];

  if (!isOpen) return null;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const handleDateClick = (date: Date) => {
    if (activeInput === "start") {
      setSelectedStartDate(date);
      setActiveInput("end");
    } else if (activeInput === "end") {
      setSelectedEndDate(date);
      setActiveInput(null);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Empty cells
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} />);

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected =
        (selectedStartDate && selectedStartDate.getTime() === date.getTime()) ||
        (selectedEndDate && selectedEndDate.getTime() === date.getTime());

      days.push(
        <button
          key={day}
          className={`py-2 rounded-full transition w-full ${
            isSelected ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"
          }`}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handleYesClick = () => setShowDateTimeSelection(true);
  const handleConfirmClick = () => setShowSuccessScreen(true);
  const handleOkayClick = () => {
    setShowSuccessScreen(false);
    setShowDateTimeSelection(false);
    onConfirm(
      selectedStartDate?.toISOString() || "",
      selectedEndDate?.toISOString() || "",
      startTime,
      endTime
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${showDateTimeSelection ? 'max-w-2xl' : 'max-w-md'} w-full p-6 relative`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Modal Content */}
        {!showSuccessScreen && (
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Booking Confirmation
          </h2>
        )}

        {showSuccessScreen ? (
          <div className="flex flex-col items-center justify-center py-8">
            {/* Success Checkmark */}
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your booking is confirmed<br />with the owner
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Please go to the owner location and<br />complete the process offline
            </p>

            {/* Required Documents */}
            <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Required Documents</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
                  Driving License
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
                  Aadhar Card
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
                  Deposit money : 10,000
                </li>
              </ul>
              <p className="text-yellow-600 text-sm mt-3 flex items-start gap-1">
                <span className="text-lg">⚠️</span>
                <span>Deposit will be refunded once you handover the vehicle</span>
              </p>
            </div>

            {/* Okay Button */}
            <button
              onClick={handleOkayClick}
              className="w-full bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition shadow-md"
            >
              Okay
            </button>
          </div>
        ) : !showDateTimeSelection ? (
          <>
            <p className="text-gray-600 mb-6">
              Did the owner confirm your booking for this vehicle?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleYesClick}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Yes
              </button>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column: Dates + Calendar */}
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => setActiveInput("start")}>
                    <label className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar size={20} className="text-gray-400" /> Start Date
                    </label>
                    <div className={`border rounded-lg p-4 text-center text-gray-700 font-semibold text-lg ${activeInput === "start" ? "ring-2 ring-blue-500" : ""}`}>
                      {selectedStartDate?.toLocaleDateString() || "Select"}
                    </div>
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => setActiveInput("end")}>
                    <label className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar size={20} className="text-gray-400" /> End Date
                    </label>
                    <div className={`border rounded-lg p-4 text-center text-gray-700 font-semibold text-lg ${activeInput === "end" ? "ring-2 ring-blue-500" : ""}`}>
                      {selectedEndDate?.toLocaleDateString() || "Select"}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold">{monthName}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs text-gray-500 font-medium">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>
                </div>
              </div>

              {/* Right Column: Time Selection */}
              <div className="w-1/3 space-y-4">
                <div>
                  <label className="text-sm text-gray-500 font-medium">Start Time</label>
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-3 border rounded-lg bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 font-medium">End Time</label>
                  <select
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-3 border rounded-lg bg-white text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmClick}
              className="mt-6 w-full bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition shadow-md"
            >
              Confirm
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
