
import React from 'react';

export const BlockLegend: React.FC = () => {
    return (
        <div className="px-3 sm:px-4">
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded" />
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded" />
                    <span>Your Blocks</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded" />
                    <span>Customer Bookings (Protected)</span>
                </div>
            </div>
        </div>
    );
};
