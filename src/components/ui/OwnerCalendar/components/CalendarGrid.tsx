
import React from 'react';

interface CalendarGridProps {
    currentMonth: Date;
    selectedStart: Date | null;
    selectedEnd: Date | null;
    ownerBlockedDates: string[];
    customerBookedDates: string[];
    onDateClick: (date: Date) => void;
    formatDate: (date: Date | null) => string;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentMonth,
    selectedStart,
    selectedEnd,
    ownerBlockedDates,
    customerBookedDates,
    onDateClick,
    formatDate
}) => {
    const isPast = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const renderCalendar = () => {
        const days: JSX.Element[] = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const offset = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < offset; i++) days.push(<div key={`e${i}`} />);

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const past = isPast(date);
            const dateStr = formatDate(date);

            const ownerBlocked = ownerBlockedDates.includes(dateStr);
            const custBooked = customerBookedDates.includes(dateStr);

            const selected = (selectedStart && formatDate(selectedStart) === dateStr) ||
                (selectedEnd && formatDate(selectedEnd) === dateStr);

            let cls = "h-10 sm:h-12 rounded-lg font-medium flex items-center justify-center relative transition text-sm ";

            if (past) cls += "bg-gray-100 text-gray-400 cursor-not-allowed";
            else if (custBooked) cls += "bg-green-100 border-2 border-green-400 text-green-700 cursor-pointer";
            else if (ownerBlocked) cls += "bg-red-100 border-2 border-red-400 text-red-700 hover:bg-red-200 cursor-pointer";
            else if (selected) cls += "bg-black text-white border-2 border-blue-700";
            else cls += "bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:opacity-90 cursor-pointer";

            days.push(
                <button key={d} className={cls} disabled={past} onClick={() => onDateClick(date)}>
                    {d}
                    {custBooked && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />}
                    {ownerBlocked && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="p-3 sm:p-4 pt-0">
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                    <div key={d} className="text-center font-medium text-gray-500 text-xs py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-4">{renderCalendar()}</div>
        </div>
    );
};
