import React from "react";
import { X, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { NotAvailabilitySlot } from"../../store/types";

interface EditModalProps {
  editingSlot: NotAvailabilitySlot;
  editModalMonth: Date;
  setEditModalMonth: (date: Date) => void;
  datesToRemove: string[];
  setDatesToRemove: (dates: string[]) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  editingSlot,
  editModalMonth,
  setEditModalMonth,
  datesToRemove,
  setDatesToRemove,
  onClose,
  onConfirm,
  loading,
}) => {
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAllDatesInRange = (fromDate: string, toDate: string): string[] => {
    const dates: string[] = [];
    const [startYear, startMonth, startDay] = fromDate
      .split("T")[0]
      .split("-")
      .map(Number);
    const [endYear, endMonth, endDay] = toDate
      .split("T")[0]
      .split("-")
      .map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    const current = new Date(start);

    while (current <= end) {
      dates.push(formatDateForAPI(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const toggleDateRemoval = (dateStr: string) => {
    if (datesToRemove.includes(dateStr)) {
      setDatesToRemove(datesToRemove.filter((d) => d !== dateStr));
    } else {
      setDatesToRemove([...datesToRemove, dateStr]);
    }
  };

  const renderEditModalCalendar = () => {
    const allDates = getAllDatesInRange(editingSlot.fromDate, editingSlot.toDate);
    const editMonthName = editModalMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const daysInEditMonth = new Date(
      editModalMonth.getFullYear(),
      editModalMonth.getMonth() + 1,
      0
    ).getDate();

    const firstDayEdit = new Date(
      editModalMonth.getFullYear(),
      editModalMonth.getMonth(),
      1
    ).getDay();

    const days: JSX.Element[] = [];
    const offset = firstDayEdit === 0 ? 6 : firstDayEdit - 1;

    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-edit-${i}`} />);
    }

    for (let d = 1; d <= daysInEditMonth; d++) {
      const date = new Date(
        editModalMonth.getFullYear(),
        editModalMonth.getMonth(),
        d
      );
      const dateStr = formatDateForAPI(date);
      const isInRange = allDates.includes(dateStr);
      const isMarkedForRemoval = datesToRemove.includes(dateStr);

      let className =
        "h-12 rounded-lg transition relative font-medium flex items-center justify-center ";

      if (!isInRange) {
        className += "bg-gray-100 text-gray-400 cursor-not-allowed";
      } else if (isMarkedForRemoval) {
        className +=
          "bg-green-500 text-white border-2 border-green-600 cursor-pointer hover:bg-green-600";
      } else {
        className +=
          "bg-red-100 border-2 border-red-500 text-red-700 cursor-pointer hover:bg-red-200";
      }

      days.push(
        <button
          key={d}
          className={className}
          disabled={!isInRange}
          onClick={() => isInRange && toggleDateRemoval(dateStr)}
          title={
            !isInRange
              ? "Not in range"
              : isMarkedForRemoval
              ? "Click to keep (will remain blocked)"
              : "Click to remove (will become available)"
          }
        >
          {d}
          {isMarkedForRemoval && (
            <Check className="absolute top-1 right-1" size={16} />
          )}
        </button>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() =>
              setEditModalMonth(
                new Date(
                  editModalMonth.getFullYear(),
                  editModalMonth.getMonth() - 1
                )
              )
            }
          >
            <ChevronLeft />
          </button>
          <h3 className="text-xl font-bold">{editMonthName}</h3>
          <button
            onClick={() =>
              setEditModalMonth(
                new Date(
                  editModalMonth.getFullYear(),
                  editModalMonth.getMonth() + 1
                )
              )
            }
          >
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-center font-bold text-gray-600 text-sm"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">{days}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold">Edit Blocked Dates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Select dates to remove from blocking. Click dates to toggle.
            </p>
          </div>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Current Range Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-blue-900 mb-2">
            Current Blocked Range:
          </p>
          <p className="text-blue-800">
            <strong>
              {formatDateForDisplay(
                (() => {
                  const dateStr = editingSlot.fromDate.split("T")[0];
                  const [year, month, day] = dateStr.split("-").map(Number);
                  return new Date(year, month - 1, day);
                })()
              )}
            </strong>
            {" → "}
            <strong>
              {formatDateForDisplay(
                (() => {
                  const dateStr = editingSlot.toDate.split("T")[0];
                  const [year, month, day] = dateStr.split("-").map(Number);
                  return new Date(year, month - 1, day);
                })()
              )}
            </strong>
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Time: {editingSlot.fromTime} - {editingSlot.toTime}
          </p>
        </div>

        {/* Calendar for date selection */}
        <div className="mb-6">{renderEditModalCalendar()}</div>

        {/* Legend */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="font-semibold mb-3 text-sm">How to use:</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded flex-shrink-0"></div>
              <span>
                <strong>Red dates:</strong> Currently blocked. Click to mark for
                removal.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded flex-shrink-0 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <span>
                <strong>Green dates with ✓:</strong> Marked for removal (will
                become available for customers).
              </span>
            </div>
          </div>
        </div>

        {/* Selected dates info */}
        {datesToRemove.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-green-900 mb-2">
              {datesToRemove.length} date(s) selected for removal:
            </p>
            <div className="flex flex-wrap gap-2">
              {datesToRemove.sort().map((dateStr) => {
                const [year, month, day] = dateStr.split("-").map(Number);
                const date = new Date(year, month - 1, day);
                return (
                  <span
                    key={dateStr}
                    className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium"
                  >
                    {formatDateForDisplay(date)}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={datesToRemove.length === 0 || loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading
              ? "Processing..."
              : `Remove ${datesToRemove.length} Date(s) & Update`}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Cancel
          </button>
        </div>

        {/* Info Alert */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>⚠️ Important:</strong> If you remove dates from the middle
            of a range, it will be split into multiple ranges. Removed dates
            will immediately become available for customer bookings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditModal;