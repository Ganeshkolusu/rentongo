import React from "react";

interface TimeSelectorProps {
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}) => {
  const generateTimeOptions = () => {
    const arr = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        arr.push({
          value: `${hh}:${mm}`,
          label: `${h % 12 || 12}:${mm} ${h >= 12 ? "PM" : "AM"}`,
        });
      }
    }
    return arr;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div>
      <label className="font-semibold">Start Time</label>
      <select
        className="w-full p-2 border rounded mb-3"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      >
        {timeOptions.map((t) => (
          <option value={t.value} key={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <label className="font-semibold">End Time</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      >
        {timeOptions.map((t) => (
          <option value={t.value} key={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSelector;