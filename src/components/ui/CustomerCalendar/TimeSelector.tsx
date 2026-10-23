import React from "react";

interface TimeSelectorProps {
  startTime: string;
  endTime: string;
  setStartTime: (val: string) => void;
  setEndTime: (val: string) => void;
}
const TimeSelector: React.FC<TimeSelectorProps> = ({ startTime, endTime, setStartTime, setEndTime }) => {
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    times.push('24:00');
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="flex gap-2">
      <select className="text-sm border rounded px-2 py-1" value={startTime} onChange={e => setStartTime(e.target.value)}>
        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <span className="text-gray-400">-</span>
      <select className="text-sm border rounded px-2 py-1" value={endTime} onChange={e => setEndTime(e.target.value)}>
        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
};

export default TimeSelector;
