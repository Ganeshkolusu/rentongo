import React, { useState, useEffect } from "react";
import { X, MoreVertical, RefreshCw } from "lucide-react";
import CalendarView from "../../components/ui/Calenderview";
import TimeSelector from "../../components/ui/TimeSelector";
import BlockedDatesList from "../../components/ui/BlockeddatesList";
import EditModal from "../../components/ui/Editmodal";
import { useVehicleAvailability } from "../../components/ui/useVehicleAvilability";
import { useBlockedDates } from "../../components/ui/useBlockeddates";
import { NotAvailabilitySlot } from "../../store/types";

interface VehicleAvailabilityCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  VechileId: string;
  vehicleType: "Car" | "Bike" | "Auto";
  userId: string;
}

const VehicleAvailabilityCalendar: React.FC<VehicleAvailabilityCalendarProps> = ({
  isOpen,
  onClose,
  VechileId,
  vehicleType,
  userId,
}) => {
  // STATE
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // NEW: Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<NotAvailabilitySlot | null>(null);
  const [datesToRemove, setDatesToRemove] = useState<string[]>([]);
  const [editModalMonth, setEditModalMonth] = useState(new Date());

  // Custom hooks
  const {
    apiUnavailableDates,
    ownerBlockedDates,
    customerBookedDates,
    fetchVehicleAvailability,
  } = useVehicleAvailability(VechileId, vehicleType, isOpen);

  const {
    blockedSlots,
    setBlockedSlots,
    createBlockedDatesAPI,
    updateBlockedDatesAPI,
    deleteBlockedDateAPI,
    loadBlockedDatesFromStorage,
    saveBlockedDatesToStorage,
  } = useBlockedDates(VechileId, vehicleType, userId);

  // UI HELPERS
  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const resetForm = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setShowOptionsMenu(false);
    setShowDeleteListModal(false);
    setIsEditMode(false);
    setEditingSlotId(null);
  };

  // USE EFFECT - AUTO REFRESH
  useEffect(() => {
    if (isOpen) {
      fetchVehicleAvailability();
      loadBlockedDatesFromStorage();

      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        console.log("🔄 Auto-refresh: Loading owner calendar...");
        fetchVehicleAvailability();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      resetForm();
    }
  }, [isOpen]);

  // MANUAL REFRESH
  const handleManualRefresh = async () => {
    console.log("🔄 Manual refresh triggered by owner");
    setLoading(true);
    await fetchVehicleAvailability();
    setLoading(false);
    showMessage("success", "✅ Availability refreshed!");
  };

  // SAVE NEW BLOCKED DATES OR UPDATE
  const handleConfirmAndSave = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      showMessage("error", "Please select both start and end dates.");
      return;
    }

    setLoading(true);
    try {
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formatTimeForAPI = (time: string): string => {
        const [hours, minutes] = time.split(":");
        return `${parseInt(hours)}.${minutes}`;
      };

      const payload = {
        vehicleType,
        VechileId,
        fromDate: formatDateForAPI(selectedStartDate),
        toDate: formatDateForAPI(selectedEndDate),
        fromTime: formatTimeForAPI(startTime),
        toTime: formatTimeForAPI(endTime),
      };

      if (editingSlotId) {
        // UPDATE EXISTING SLOT
        const apiResponse = await updateBlockedDatesAPI(editingSlotId, payload);
        const updatedSlots = blockedSlots.map((slot) => {
          const slotId = slot._id || slot.id || slot.notAvailabilityId;
          if (slotId === editingSlotId) {
            return {
              ...slot,
              fromDate: apiResponse.fromDate || payload.fromDate,
              toDate: apiResponse.toDate || payload.toDate,
              fromTime: apiResponse.fromTime || payload.fromTime,
              toTime: apiResponse.toTime || payload.toTime,
            };
          }
          return slot;
        });
        setBlockedSlots(updatedSlots);
        saveBlockedDatesToStorage(updatedSlots);
        await fetchVehicleAvailability();
        showMessage("success", "✅ Dates updated successfully!");
        resetForm();
      } else {
        // CREATE NEW SLOT
        const apiResponse = await createBlockedDatesAPI(payload);
        const newSlot: NotAvailabilitySlot = {
          _id: apiResponse._id,
          fromDate: apiResponse.fromDate,
          toDate: apiResponse.toDate,
          fromTime: apiResponse.fromTime,
          toTime: apiResponse.toTime,
          isNotAvailable: apiResponse.isNotAvailable,
          VechileId: apiResponse.VechileId,
          vechileType: apiResponse.vechileType,
          isCustomerBooking: false,
        };
        const updated = [...blockedSlots, newSlot];
        setBlockedSlots(updated);
        saveBlockedDatesToStorage(updated);
        await fetchVehicleAvailability();
        showMessage("success", "✅ Dates blocked successfully!");
        resetForm();
      }
    } catch (e: any) {
      showMessage("error", e.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-6xl rounded-2xl p-6 overflow-y-auto max-h-[90vh] shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="mr-2">📅</span>
            Manage Vehicle Availability
          </h2>
          <div className="flex items-center gap-3">
            {/* REFRESH BUTTON */}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            {/* THREE DOTS MENU */}
            <div className="relative">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical size={24} />
              </button>
              {showOptionsMenu && (
                <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg border border-gray-200 w-40 z-50">
                  <button
                    onClick={() => {
                      setShowDeleteListModal(true);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100"
                  >
                    Manage Dates
                  </button>
                </div>
              )}
            </div>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              message.type === "error"
                ? "bg-red-100 text-red-800"
                : message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* CALENDAR */}
          <div className="col-span-2">
            <CalendarView
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              onDateClick={(date) => {
                // Handle date click logic here
                setSelectedStartDate(date);
                setSelectedEndDate(null);
              }}
              apiUnavailableDates={apiUnavailableDates}
              ownerBlockedDates={ownerBlockedDates}
              customerBookedDates={customerBookedDates}
              blockedSlots={blockedSlots}
              showMessage={showMessage}
            />
          </div>

          {/* TIME + CONFIRM */}
          <div>
            <TimeSelector
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
            />

            <button
              onClick={handleConfirmAndSave}
              disabled={!selectedStartDate || !selectedEndDate || loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Saving..." : editingSlotId ? "Update Dates" : "Confirm & Block Dates"}
            </button>

            {editingSlotId && (
              <button
                onClick={resetForm}
                className="w-full mt-2 bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold"
              >
                Cancel Edit
              </button>
            )}

            {/* INFO BOX */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>📌 Note:</strong> Customer booked dates (orange) cannot be edited or deleted by owner.
              </p>
            </div>
          </div>
        </div>

        {/* BLOCKED SUMMARY */}
        {(blockedSlots.length > 0 || customerBookedDates.length > 0 || ownerBlockedDates.length > 0) && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-bold text-red-800">{ownerBlockedDates.length} Your Blocked Dates</p>
              <p className="text-xs text-red-600 mt-1">Can edit/delete</p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-bold text-orange-800">{customerBookedDates.length} Customer Bookings</p>
              <p className="text-xs text-orange-600 mt-1">Cannot edit/delete</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-bold text-green-800">{apiUnavailableDates.length} Total Blocked</p>
              <p className="text-xs text-green-600 mt-1">Owner + Customer</p>
            </div>
          </div>
        )}

        {/* EDIT/DELETE LIST MODAL */}
        {showDeleteListModal && (
          <BlockedDatesList
            blockedSlots={blockedSlots}
            onClose={() => setShowDeleteListModal(false)}
            onEdit={(slot) => {
              setEditingSlot(slot);
              setShowEditModal(true);
              setShowDeleteListModal(false);
            }}
            onDelete={async (slot) => {
              const slotId = slot._id || slot.id || slot.notAvailabilityId;
              if (slotId) {
                await deleteBlockedDateAPI(slotId);
                await fetchVehicleAvailability();
                showMessage("success", "✅ Deleted successfully!");
              }
            }}
            showMessage={showMessage}
          />
        )}

        {/* EDIT MODAL */}
        {showEditModal && editingSlot && (
          <EditModal
            editingSlot={editingSlot}
            editModalMonth={editModalMonth}
            setEditModalMonth={setEditModalMonth}
            datesToRemove={datesToRemove}
            setDatesToRemove={setDatesToRemove}
            onClose={() => {
              setShowEditModal(false);
              setEditingSlot(null);
              setDatesToRemove([]);
            }}
            onConfirm={async () => {
              // Handle edit confirmation logic
              setShowEditModal(false);
              await fetchVehicleAvailability();
              showMessage("success", "✅ Dates updated!");
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default VehicleAvailabilityCalendar;