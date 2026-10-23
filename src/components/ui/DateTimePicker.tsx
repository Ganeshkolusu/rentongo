
 

import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DateTimePickerProps {
  value: string;
  onChange: (newValue: string) => void;
  minDate?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ 
  value, 
  onChange, 
  minDate
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    onChange(dateStr);
    setShowPicker(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const [year, month, selectedDay] = value.split('-');
    return parseInt(selectedDay) === day && 
           parseInt(month) - 1 === currentMonth.getMonth() && 
           parseInt(year) === currentMonth.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return dateStr < minDate;
  };

  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="border rounded px-3 py-2 bg-white hover:border-blue-500 transition flex items-center gap-2 min-w-[150px]"
        >
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{value ? formatDisplayDate(value) : 'Select'}</span>
        </button>

        {showPicker && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 w-80">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold text-gray-900">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((dateObj, idx) => {
                  const disabled = !dateObj.isCurrentMonth || isDisabled(dateObj.day);
                  return (
                    <button
                      key={idx}
                      onClick={() => dateObj.isCurrentMonth && !isDisabled(dateObj.day) && handleDateSelect(dateObj.day)}
                      disabled={disabled}
                      className={`
                        aspect-square flex items-center justify-center text-sm rounded-lg transition
                        ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
                        ${isSelected(dateObj.day) && dateObj.isCurrentMonth ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${isToday(dateObj.day) && dateObj.isCurrentMonth && !isSelected(dateObj.day) ? 'bg-blue-50 font-semibold' : ''}
                      `}
                    >
                      {dateObj.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
 
export default DateTimePicker;