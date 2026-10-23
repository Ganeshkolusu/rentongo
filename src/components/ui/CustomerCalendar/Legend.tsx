import React from "react";

const Legend: React.FC = () => (
  <div className="flex flex-wrap gap-3 text-xs mb-4 p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded" />
      <span>Available</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded" />
      <span>Owner Blocked</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded" />
      <span>Confirmed</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 bg-orange-100 border-2 border-orange-400 rounded" />
      <span>Pending</span>
    </div>
  </div>
);

export default Legend;
