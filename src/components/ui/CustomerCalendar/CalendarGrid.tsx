import React from "react";

interface CalendarGridProps {
  days: React.ReactNode[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days }) => (
  <div className="grid grid-cols-7 gap-1 mb-4">{days}</div>
);

export default CalendarGrid;
