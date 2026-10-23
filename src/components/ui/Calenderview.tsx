import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NotAvailabilitySlot } from "../../store/types";

interface CalendarViewProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  onDateClick: (date: Date) => void;
  apiUnavailableDates: string[];
  ownerBlockedDates: string[];
  customerBookedDates: string[];
  blockedSlots: NotAvailabilitySlot[];
  showMessage: (type: string, text: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  setCurrentMonth,
  selectedStartDate,
  selectedEndDate,
  onDateClick,
  apiUnavailableDates,
  ownerBlockedDates,
  customerBookedDates,
  blockedSlots,
  showMessage,
}) => {
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isCustomerBooked = (date: Date): boolean => {
    const formatted = formatDateForAPI(date);
    return customerBookedDates.includes(formatted);
  };

  const isOwnerBlocked = (date: Date): boolean => {
    const formatted = formatDateForAPI(date);
    return ownerBlockedDates.includes(formatted);
  };

  const isDateBlocked = (date: Date): boolean => {
    const formatted = formatDateForAPI(date);
    if (apiUnavailableDates.includes(formatted)) return true;

    for (const slot of blockedSlots) {
      const fromDateStr = slot.fromDate.split("T")[0];
      const toDateStr = slot.toDate.split("T")[0];
      const [fromYear, fromMonth, fromDay] = fromDateStr.split("-").map(Number);
      const [toYear, toMonth, toDay] = toDateStr.split("-").map(Number);
      const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
      const toDate = new Date(toYear, toMonth - 1, toDay);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);
      if (date >= fromDate && date <= toDate) return true;
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;

    const customerBooked = isCustomerBooked(date);
    if (customerBooked) {
      showMessage("error", "❌ This date is booked by a customer. Cannot modify.");
      return;
    }

    onDateClick(date);
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const renderCalendarDays = () => {
    const days: JSX.Element[] = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d
      );
      const past = isPastDate(date);
      const blocked = isDateBlocked(date);
      const customerBooked = isCustomerBooked(date);
      const ownerBlocked = isOwnerBlocked(date);
      const selected =
        selectedStartDate?.getTime() === date.getTime() ||
        selectedEndDate?.getTime() === date.getTime();

      let className =
        "h-12 rounded-lg transition relative font-medium flex items-center justify-center ";

      if (past) {
        className += "bg-gray-100 text-gray-400 cursor-not-allowed";
      } else if (customerBooked) {
        className +=
          "bg-orange-100 border-2 border-orange-500 text-orange-700 relative cursor-not-allowed";
      } else if (ownerBlocked) {
        className +=
          "bg-red-100 border-2 border-red-500 text-red-700 relative hover:bg-red-200";
      } else if (blocked) {
        className +=
          "bg-red-100 border-2 border-red-500 text-red-700 relative hover:bg-red-200";
      } else if (selected) {
        className += "bg-black text-white border-2 border-black";
      } else {
        className +=
          "bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white hover:opacity-90";
      }

      days.push(
        <button
          key={d}
          className={className}
          disabled={past || customerBooked}
          onClick={() => handleDateClick(date)}
          title={
            customerBooked
              ? "Customer Booking (Cannot Edit)"
              : ownerBlocked
              ? "Your Blocked Date"
              : blocked
              ? "Blocked"
              : "Available"
          }
        >
          {d}
          {customerBooked && (
            <>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 40 40"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                />
                <text
                  x="20"
                  y="24"
                  textAnchor="middle"
                  fill="#f97316"
                  fontSize="16"
                  fontWeight="bold"
                >
                  C
                </text>
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
            </>
          )}
          {ownerBlocked && (
            <>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 40 40"
              >
                <line
                  x1="6"
                  y1="6"
                  x2="34"
                  y2="34"
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="34"
                  y1="6"
                  x2="6"
                  y2="34"
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1
              )
            )
          }
        >
          <ChevronLeft />
        </button>
        <h3 className="text-xl font-bold">{monthName}</h3>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1
              )
            )
          }
        >
          <ChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center font-bold text-gray-600">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

      {/* LEGEND */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="font-semibold mb-2 text-sm">Legend:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
            <span>Your Blocked Dates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
            <span>Customer Bookings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;