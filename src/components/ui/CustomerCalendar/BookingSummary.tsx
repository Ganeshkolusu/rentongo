import React from "react";

interface BookingSummaryProps {
  selectedStart: Date | null;
  selectedEnd: Date | null;
  totalHours: number;
  totalPrice: number;
  formatDisplay: (date: Date | null) => string;
  driverAvailable?: boolean;
  driverFee?: number;
  totalDays?: number;
  basePrice?: number;
  withDriver?: boolean;
  onWithDriverChange?: (value: boolean) => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedStart,
  selectedEnd,
  totalHours,
  totalPrice,
  formatDisplay,
  driverAvailable,
  driverFee = 0,
  totalDays = 0,
  basePrice = 0,
  withDriver,
  onWithDriverChange,
}) => {
  const driverTotal = driverFee * totalDays;

  return (
    <div>
      <p className="text-sm text-gray-500">Selected:</p>
      <p className="font-semibold">{formatDisplay(selectedStart)} → {formatDisplay(selectedEnd)}</p>
      {selectedStart && selectedEnd && (
        <>
          <p className="text-xs text-gray-500">Hours: {totalHours}</p>

          {driverAvailable ? (
            <div className="mt-2 space-y-1.5">
              <label className="flex items-center justify-between gap-3 border rounded-lg px-2 py-1.5 cursor-pointer text-sm border-gray-200">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="withDriver"
                    checked={!withDriver}
                    onChange={() => onWithDriverChange?.(false)}
                  />
                  Without driver
                </span>
                <span className="font-semibold">₹{basePrice}</span>
              </label>
              <label className="flex items-center justify-between gap-3 border rounded-lg px-2 py-1.5 cursor-pointer text-sm border-gray-200">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="withDriver"
                    checked={!!withDriver}
                    onChange={() => onWithDriverChange?.(true)}
                  />
                  With driver (₹{driverFee}/day × {totalDays})
                </span>
                <span className="font-semibold">₹{basePrice + driverTotal}</span>
              </label>
            </div>
          ) : null}

          <p className="text-blue-600 font-bold mt-1">Total: ₹{totalPrice}</p>
        </>
      )}
    </div>
  );
};

export default BookingSummary;
