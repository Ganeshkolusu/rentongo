import React from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import { NotAvailabilitySlot } from "../../store/types";

interface BlockedDatesListProps {
  blockedSlots: NotAvailabilitySlot[];
  onClose: () => void;
  onEdit: (slot: NotAvailabilitySlot) => void;
  onDelete: (slot: NotAvailabilitySlot) => void;
  showMessage: (type: string, text: string) => void;
}

const BlockedDatesList: React.FC<BlockedDatesListProps> = ({
  blockedSlots,
  onClose,
  onEdit,
  onDelete,
  showMessage,
}) => {
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEdit = (slot: NotAvailabilitySlot) => {
    if (slot.isCustomerBooking) {
      showMessage(
        "error",
        "❌ Cannot edit customer bookings! Customers must cancel their own bookings."
      );
      return;
    }
    onEdit(slot);
  };

  const handleDelete = (slot: NotAvailabilitySlot) => {
    if (slot.isCustomerBooking) {
      showMessage(
        "error",
        "❌ Cannot delete customer bookings! Customers must cancel their own bookings."
      );
      return;
    }

    if (confirm("Are you sure you want to delete this blocked date range?")) {
      onDelete(slot);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Manage Blocked Dates</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {blockedSlots.length === 0 ? (
          <p className="text-gray-500">No blocked dates available.</p>
        ) : (
          <div className="space-y-3">
            {blockedSlots.map((slot, idx) => {
              const isCustomerBooking = slot.isCustomerBooking;
              const fromDateStr = slot.fromDate.split("T")[0];
              const toDateStr = slot.toDate.split("T")[0];
              const [fromYear, fromMonth, fromDay] = fromDateStr
                .split("-")
                .map(Number);
              const [toYear, toMonth, toDay] = toDateStr.split("-").map(Number);
              const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
              const toDate = new Date(toYear, toMonth - 1, toDay);

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 flex justify-between items-center ${
                    isCustomerBooking
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div>
                    <p className="font-semibold">
                      {formatDateForDisplay(fromDate)} -{" "}
                      {formatDateForDisplay(toDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {slot.fromTime} - {slot.toTime}
                    </p>
                    {isCustomerBooking && (
                      <p className="text-xs text-orange-600 font-semibold mt-1">
                        🧑 Customer Booking (Cannot Edit/Delete)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isCustomerBooking ? (
                      <>
                        <button
                          onClick={() => handleEdit(slot)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(slot)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-2 bg-orange-200 text-orange-800 rounded-lg text-sm font-semibold">
                        Customer Booking
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedDatesList;