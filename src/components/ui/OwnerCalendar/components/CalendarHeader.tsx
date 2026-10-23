
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    loading: boolean;
    blockedCount: number;
    onShowBlocked: () => void;
    message: { type: string; text: string };
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    loading,
    blockedCount,
    onShowBlocked,
    message
}) => {
    return (
        <>
            <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                    <Calendar className="text-blue-600" size={24} />
                    <div>
                        <h2 className="font-bold text-base sm:text-lg">Manage Availability</h2>
                        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                            Owner
                        </span>
                    </div>
                </div>
                {blockedCount > 0 && (
                    <button onClick={onShowBlocked} className="w-full sm:w-auto px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm font-medium">
                        Your Blocks ({blockedCount})
                    </button>
                )}
            </div>

            {message.text && (
                <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {message.text}
                </div>
            )}

            {loading && (
                <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 z-50">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm">Loading...</span>
                </div>
            )}

            <div className="p-3 sm:p-4 pb-0">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-semibold text-sm sm:text-base">
                        {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </>
    );
};
