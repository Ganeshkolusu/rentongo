import React from 'react';

interface TimeInput24hrProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
}

export const TimeInput24hr: React.FC<TimeInput24hrProps> = ({ value, onChange, label }) => {
    // Parse the time value (HH:MM format)
    const [hours, minutes] = value.split(':').map(v => v || '00');

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newHour = e.target.value.padStart(2, '0');
        onChange(`${newHour}:${minutes}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMinute = e.target.value.padStart(2, '0');
        onChange(`${hours}:${newMinute}`);
    };

    return (
        <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <div className="flex gap-1">
                <select
                    value={parseInt(hours)}
                    onChange={handleHourChange}
                    className="flex-1 p-2 border rounded-lg text-sm bg-white"
                >
                    {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}
                        </option>
                    ))}
                </select>
                <span className="flex items-center text-gray-500 font-bold">:</span>
                <select
                    value={parseInt(minutes)}
                    onChange={handleMinuteChange}
                    className="flex-1 p-2 border rounded-lg text-sm bg-white"
                >
                    {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>
                            {i.toString().padStart(2, '0')}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};