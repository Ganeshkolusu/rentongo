
import React from 'react';
import { BlockedRecord } from '../types';
import { TimeInput24hr } from './TimeInput24hr Component';

interface SelectedRangeProps {
    selectedStart: Date | null;
    selectedEnd: Date | null;
    startTime: string;
    endTime: string;
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    selectedRecord: BlockedRecord | null;
    handleUpdateBlock: () => void;
    handleCreateBlock: () => void;
    handleCancel: () => void;
    loading: boolean;
}

export const SelectedRange: React.FC<SelectedRangeProps> = ({
    selectedStart,
    selectedEnd,
    startTime,
    endTime,
    setStartTime,
    setEndTime,
    selectedRecord,
    handleUpdateBlock,
    handleCreateBlock,
    handleCancel,
    loading
}) => {
    const formatDisplay = (date: Date | null): string => {
        if (!date) return "Select";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="p-3 sm:p-4 border-t pt-4">
            <div className="mb-3">
                <p className="text-sm text-gray-500">Selected Range:</p>
                <p className="font-semibold">{formatDisplay(selectedStart)} → {formatDisplay(selectedEnd)}</p>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <TimeInput24hr
                        value={startTime}
                        onChange={setStartTime}
                        label="Start Time"
                    />
                    <TimeInput24hr
                        value={endTime}
                        onChange={setEndTime}
                        label="End Time"
                    />
                </div>

                {selectedRecord && (
                    <p className="text-xs text-blue-600 mt-1">Editing existing block</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                {selectedRecord ? (
                    <>
                        <button onClick={handleUpdateBlock} disabled={!selectedStart || !selectedEnd || loading} className="w-full sm:flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition">
                            Update Block
                        </button>
                        <button onClick={handleCancel} className="w-full sm:w-auto px-4 py-2.5 sm:py-3 bg-gray-200 rounded-xl text-sm sm:text-base hover:bg-gray-300">
                            Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={handleCreateBlock} disabled={!selectedStart || !selectedEnd || loading} className="w-full bg-red-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition">
                        Block Selected Dates
                    </button>
                )}
            </div>
        </div>
    );
};
