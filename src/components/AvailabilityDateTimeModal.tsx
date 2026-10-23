

// import React, { useState, useEffect } from "react";
// import {
//   X,
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Edit2,
//   Trash2,
//   Check,
//   AlertCircle,
//   MoreVertical,
//   RefreshCw,
// } from "lucide-react";

// interface VehicleAvailabilityCalendarProps {
//   isOpen: boolean;
//   onClose: () => void;
//   VechileId: string;
//   vehicleType: "Car" | "Bike" | "Auto";
//   userId: string;
// }

// interface NotAvailabilitySlot {
//   _id?: string;
//   id?: string;
//   notAvailabilityId?: string;
//   fromDate: string;
//   toDate: string;
//   fromTime: string;
//   toTime: string;
//   isNotAvailable: boolean;
//   VechileId: string;
//   vechileType: string;
//   userId?: string;
//   isCustomerBooking?: boolean;
// }

// const VehicleAvailabilityCalendar: React.FC<VehicleAvailabilityCalendarProps> = ({
//   isOpen,
//   onClose,
//   VechileId,
//   vehicleType,
//   userId,
// }) => {
//   // STATE
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
//   const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
//   const [startTime, setStartTime] = useState("06:00");
//   const [endTime, setEndTime] = useState("18:00");
//   const [blockedSlots, setBlockedSlots] = useState<NotAvailabilitySlot[]>([]);
//   const [apiUnavailableDates, setApiUnavailableDates] = useState<string[]>([]);
//   const [ownerBlockedDates, setOwnerBlockedDates] = useState<string[]>([]);
//   const [customerBookedDates, setCustomerBookedDates] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });
//   const [showOptionsMenu, setShowOptionsMenu] = useState(false);
//   const [showDeleteListModal, setShowDeleteListModal] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
//   const [refreshInterval, setRefreshInterval] = useState<any>(null);
  
//   // NEW: Edit modal states
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingSlot, setEditingSlot] = useState<NotAvailabilitySlot | null>(null);
//   const [datesToRemove, setDatesToRemove] = useState<string[]>([]);
//   const [editModalMonth, setEditModalMonth] = useState(new Date());

//   // ============================
//   // FORMATTERS
//   // ============================

//   const formatDateForAPI = (date: Date | null): string => {
//     if (!date) return "";
//     // ✅ FIX: Use local date components to avoid timezone shifts
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const formatDateForDisplay = (date: Date | null): string => {
//     if (!date) return "Select Date";
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const formatTimeForAPI = (time: string): string => {
//     const [hours, minutes] = time.split(":");
//     return `${parseInt(hours)}.${minutes}`;
//   };

//   // ============================
//   // GET SLOT ID
//   // ============================

//   const getSlotId = (slot: NotAvailabilitySlot): string | null => {
//     return slot._id || slot.id || slot.notAvailabilityId || null;
//   };

//   // ============================
//   // 🔥 FETCH API UNAVAILABLE DATES (INCLUDES CUSTOMER BOOKINGS)
//   // ============================

//   const fetchVehicleAvailability = async () => {
//     try {
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("📡 FETCHING VEHICLE AVAILABILITY (Owner Calendar)");
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("🚗 Vehicle ID:", VechileId);
//       console.log("🏷️ Vehicle Type:", vehicleType);

//       const url = `https://api.rentongovehicle.com/getVehicleAvailability?vechileType=${vehicleType}&VechileId=${VechileId}`;

//       const res = await fetch(url);
//       const data = await res.json();

//       console.log("✅ Raw API Response:", data);

//       if (data.success && data.availability) {
//         // All unavailable dates
//         const unavailable = data.availability
//           .filter((item: any) => item.status === "Unavailable")
//           .map((item: any) => item.date);

//         setApiUnavailableDates(unavailable);
        
//         // Owner blocked dates (not customer bookings)
//         const ownerBlocked = data.availability
//           .filter((item: any) => item.status === "Unavailable" && !item.isCustomerBooking)
//           .map((item: any) => item.date);
        
//         setOwnerBlockedDates(ownerBlocked);
        
//         // Customer booked dates
//         const customerBooked = data.availability
//           .filter((item: any) => item.status === "Unavailable" && item.isCustomerBooking === true)
//           .map((item: any) => item.date);
        
//         setCustomerBookedDates(customerBooked);

//         console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.log("📊 AVAILABILITY SUMMARY (Owner Calendar)");
//         console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.log("🔒 Total Unavailable Dates:", unavailable.length);
//         console.log("   All Unavailable:", unavailable);
//         console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.log("👤 Owner Blocked Dates:", ownerBlocked.length);
//         console.log("   Owner Dates:", ownerBlocked);
//         console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//         console.log("🧑 Customer Booked Dates:", customerBooked.length);
//         console.log("   Customer Dates:", customerBooked);
//         console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       }
//     } catch (err) {
//       console.error("❌ Failed to fetch availability", err);
//     }
//   };

//   // ============================
//   // STORAGE HELPERS
//   // ============================

//   const loadBlockedDatesFromStorage = () => {
//     const stored = localStorage.getItem("blocked_slots_" + VechileId);
//     if (stored) {
//       setBlockedSlots(JSON.parse(stored));
//     }
//   };

//   const saveBlockedDatesToStorage = (slots: any) => {
//     localStorage.setItem("blocked_slots_" + VechileId, JSON.stringify(slots));
//   };

//   // ============================
//   // DATE UTILITIES
//   // ============================

//   const isPastDate = (date: Date): boolean => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const d = new Date(date);
//     d.setHours(0, 0, 0, 0);
//     return d < today;
//   };

//   const isCustomerBooked = (date: Date): boolean => {
//     const formatted = formatDateForAPI(date);
//     return customerBookedDates.includes(formatted);
//   };

//   const isOwnerBlocked = (date: Date): boolean => {
//     const formatted = formatDateForAPI(date);
//     return ownerBlockedDates.includes(formatted);
//   };

//   // MAIN BLOCKED CHECK
//   const isDateBlocked = (date: Date): boolean => {
//     const formatted = formatDateForAPI(date);

//     // API unavailable dates (includes both owner blocked + customer booked)
//     if (apiUnavailableDates.includes(formatted)) return true;

//     // Your manually blocked ranges
//     for (const slot of blockedSlots) {
//       // ✅ FIX: Parse dates without timezone conversion
//       const fromDateStr = slot.fromDate.split("T")[0];
//       const toDateStr = slot.toDate.split("T")[0];
      
//       const [fromYear, fromMonth, fromDay] = fromDateStr.split("-").map(Number);
//       const [toYear, toMonth, toDay] = toDateStr.split("-").map(Number);
      
//       const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
//       const toDate = new Date(toYear, toMonth - 1, toDay);

//       fromDate.setHours(0, 0, 0, 0);
//       toDate.setHours(0, 0, 0, 0);

//       if (date >= fromDate && date <= toDate) return true;
//     }

//     return false;
//   };

//   const resetForm = () => {
//     setSelectedStartDate(null);
//     setSelectedEndDate(null);
//     setShowOptionsMenu(false);
//     setShowDeleteListModal(false);
//     setIsEditMode(false);
//     setEditingSlotId(null);
//   };

//   // ============================
//   // NEW: GET ALL DATES IN RANGE
//   // ============================

//   const getAllDatesInRange = (fromDate: string, toDate: string): string[] => {
//     const dates: string[] = [];
//     // ✅ FIX: Parse dates without timezone conversion
//     const [startYear, startMonth, startDay] = fromDate.split("T")[0].split("-").map(Number);
//     const [endYear, endMonth, endDay] = toDate.split("T")[0].split("-").map(Number);
    
//     const start = new Date(startYear, startMonth - 1, startDay);
//     const end = new Date(endYear, endMonth - 1, endDay);
    
//     const current = new Date(start);
//     while (current <= end) {
//       dates.push(formatDateForAPI(current));
//       current.setDate(current.getDate() + 1);
//     }
    
//     return dates;
//   };

//   // ============================
//   // USE EFFECT - AUTO REFRESH
//   // ============================

//   useEffect(() => {
//     if (isOpen) {
//       fetchVehicleAvailability();
//       loadBlockedDatesFromStorage();

//       // Auto-refresh every 30 seconds to see new customer bookings
//       const interval = setInterval(() => {
//         console.log("🔄 Auto-refresh: Loading owner calendar...");
//         fetchVehicleAvailability();
//       }, 30000);

//       setRefreshInterval(interval);

//       return () => {
//         if (interval) clearInterval(interval);
//       };
//     } else {
//       if (refreshInterval) clearInterval(refreshInterval);
//       resetForm();
//     }
//   }, [isOpen]);

//   // ============================
//   // API CREATE BLOCKED SLOT
//   // ============================

//   const createBlockedDatesAPI = async (slotData: any) => {
//     try {
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("📤 OWNER BLOCKING DATES");
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("📋 Slot Data:", slotData);

//       const headers = new Headers();
//       headers.append("Content-Type", "application/x-www-form-urlencoded");

//       const body = new URLSearchParams();
//       body.append("userId", userId);
//       body.append("vechileType", slotData.vehicleType);
//       body.append("VechileId", slotData.VechileId);
//       body.append("fromDate", slotData.fromDate);
//       body.append("toDate", slotData.toDate);
//       body.append("fromTime", slotData.fromTime);
//       body.append("toTime", slotData.toTime);
//       body.append("isNotAvailable", "true");
//       body.append("bikeImages", "");
//       body.append("isCustomerBooking", "false"); // 🔥 Mark as owner blocking

//       console.log("📤 Request Body:", Object.fromEntries(body));

//       const res = await fetch(
//         "https://api.rentongovehicle.com/createNotAvailability",
//         { method: "POST", headers, body }
//       );

//       const result = await res.json();

//       console.log("✅ API ResponseNOTS:", result);
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("🎉 OWNER DATES BLOCKED!");
//       console.log("📅 From:", slotData.fromDate, "To:", slotData.toDate);
//       console.log("🔒 These dates are now BLOCKED in:");
//       console.log("   ✅ Owner Calendar");
//       console.log("   ✅ All Customer Calendars");
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

//       if (res.ok && result.data) return result.data;

//       throw new Error(result.message || "Failed to create slot");
//     } catch (e: any) {
//       console.error("❌ API Error:", e);
//       throw e;
//     }
//   };

//   // ============================
//   // API UPDATE BLOCKED SLOT
//   // ============================

//   const updateBlockedDatesAPI = async (slotId: string, slotData: any) => {
//     try {
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("📤 OWNER UPDATING BLOCKED DATES");
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("🆔 Slot ID:", slotId);
//       console.log("📋 New Data:", slotData);

//       const headers = new Headers();
//       headers.append("Content-Type", "application/x-www-form-urlencoded");

//       const body = new URLSearchParams();
//       body.append("vechileType", slotData.vehicleType);
//       body.append("VechileId", slotData.VechileId);
//       body.append("fromDate", slotData.fromDate);
//       body.append("toDate", slotData.toDate);
//       body.append("fromTime", slotData.fromTime);
//       body.append("toTime", slotData.toTime);
//       body.append("isNotAvailable", "true");

//       const res = await fetch(
//         `https://api.rentongovehicle.com/updateNotAvailability/${slotId}`,
//         { method: "PUT", headers, body }
//       );

//       const result = await res.json();

//       console.log("✅ Update Response:", result);
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

//       if (res.ok) return result.data || result;

//       throw new Error(result.message || "Failed to update slot");
//     } catch (e: any) {
//       console.error("❌ UPDATE API Error:", e);
//       throw e;
//     }
//   };

//   // ============================
//   // API DELETE BLOCKED SLOT
//   // ============================

//   const deleteBlockedDateAPI = async (slotId: string) => {
//     try {
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("🗑️ OWNER DELETING BLOCKED DATES");
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("🆔 Slot ID:", slotId);

//       const urlencoded = new URLSearchParams();

//       const res = await fetch(
//         `https://api.rentongovehicle.com/deleteNotAvailability/${slotId}`,
//         {
//           method: "DELETE",
//           body: urlencoded,
//         }
//       );

//       const result = await res.text();

//       console.log("✅ Delete Response:", result);
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

//       if (res.ok) return result;

//       throw new Error("Failed to delete slot");
//     } catch (e: any) {
//       console.error("❌ DELETE API Error:", e);
//       throw e;
//     }
//   };

//   // ============================
//   // NEW: HANDLE EDIT WITH MODAL
//   // ============================

//   const handleEdit = (slot: NotAvailabilitySlot) => {
//     const slotId = getSlotId(slot);
//     if (!slotId) {
//       showMessage("error", "Cannot edit: slot ID not found");
//       return;
//     }

//     // 🔥 Check if this is a customer booking - owner cannot edit
//     if (slot.isCustomerBooking) {
//       console.log("🚫 Attempted to edit customer booking:", slot);
//       showMessage("error", "❌ Cannot edit customer bookings! Customers must cancel their own bookings.");
//       return;
//     }

//     console.log("✏️ Opening edit modal for slot:", slotId);
    
//     setEditingSlot(slot);
//     setEditingSlotId(slotId);
//     setDatesToRemove([]);
    
//     // ✅ FIX: Set edit modal to show the month of the slot's start date without timezone conversion
//     const slotStartDateStr = slot.fromDate.split("T")[0];
//     const [year, month, day] = slotStartDateStr.split("-").map(Number);
//     const slotStartDate = new Date(year, month - 1, day);
//     setEditModalMonth(slotStartDate);
    
//     setShowEditModal(true);
//     setShowOptionsMenu(false);
//     setShowDeleteListModal(false);
//   };

//   // ============================
//   // NEW: TOGGLE DATE REMOVAL IN EDIT MODAL
//   // ============================

//   const toggleDateRemoval = (dateStr: string) => {
//     if (datesToRemove.includes(dateStr)) {
//       setDatesToRemove(datesToRemove.filter(d => d !== dateStr));
//     } else {
//       setDatesToRemove([...datesToRemove, dateStr]);
//     }
//   };

//   // ============================
//   // NEW: PROCESS EDIT WITH RANGE SPLITTING
//   // ============================

//   const handleConfirmEdit = async () => {
//     if (!editingSlot || !editingSlotId) {
//       showMessage("error", "No slot selected for editing");
//       return;
//     }

//     if (datesToRemove.length === 0) {
//       showMessage("error", "Please select at least one date to remove");
//       return;
//     }

//     setLoading(true);

//     try {
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("✂️ SPLITTING DATE RANGE");
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
//       // Get all dates in the original range
//       const allDates = getAllDatesInRange(editingSlot.fromDate, editingSlot.toDate);
//       console.log("📅 Original range dates:", allDates);
//       console.log("🗑️ Dates to remove:", datesToRemove);
      
//       // Remove selected dates
//       const remainingDates = allDates.filter(d => !datesToRemove.includes(d));
//       console.log("✅ Remaining dates:", remainingDates);
      
//       if (remainingDates.length === 0) {
//         // All dates removed - just delete the slot
//         console.log("🗑️ All dates removed - deleting entire slot");
//         await deleteBlockedDateAPI(editingSlotId);
        
//         const filtered = blockedSlots.filter((s) => getSlotId(s) !== editingSlotId);
//         setBlockedSlots(filtered);
//         saveBlockedDatesToStorage(filtered);
        
//         await fetchVehicleAvailability();
        
//         showMessage("success", "✅ All dates removed - slot deleted!");
//         setShowEditModal(false);
//         setEditingSlot(null);
//         setEditingSlotId(null);
//         setDatesToRemove([]);
//         return;
//       }
      
//       // Find continuous date ranges in remaining dates
//       const ranges: { from: string; to: string }[] = [];
//       let rangeStart = remainingDates[0];
//       let rangeEnd = remainingDates[0];
      
//       for (let i = 1; i < remainingDates.length; i++) {
//         // ✅ FIX: Parse dates without timezone conversion
//         const [currYear, currMonth, currDay] = remainingDates[i].split("-").map(Number);
//         const [prevYear, prevMonth, prevDay] = remainingDates[i - 1].split("-").map(Number);
        
//         const currentDate = new Date(currYear, currMonth - 1, currDay);
//         const previousDate = new Date(prevYear, prevMonth - 1, prevDay);
        
//         // Check if dates are consecutive
//         const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
//         if (diffDays === 1) {
//           // Continue current range
//           rangeEnd = remainingDates[i];
//         } else {
//           // Start new range
//           ranges.push({ from: rangeStart, to: rangeEnd });
//           rangeStart = remainingDates[i];
//           rangeEnd = remainingDates[i];
//         }
//       }
      
//       // Add the last range
//       ranges.push({ from: rangeStart, to: rangeEnd });
      
//       console.log("📊 Split into", ranges.length, "range(s):", ranges);
      
//       // Delete the original slot
//       console.log("🗑️ Deleting original slot:", editingSlotId);
//       await deleteBlockedDateAPI(editingSlotId);
      
//       // Create new slots for each range
//       const newSlots: NotAvailabilitySlot[] = [];
      
//       for (const range of ranges) {
//         console.log("➕ Creating new range:", range);
        
//         const payload = {
//           vehicleType,
//           VechileId,
//           fromDate: range.from,
//           toDate: range.to,
//           fromTime: editingSlot.fromTime,
//           toTime: editingSlot.toTime,
//         };
        
//         const apiResponse = await createBlockedDatesAPI(payload);
        
//         newSlots.push({
//           _id: apiResponse._id,
//           fromDate: apiResponse.fromDate,
//           toDate: apiResponse.toDate,
//           fromTime: apiResponse.fromTime,
//           toTime: apiResponse.toTime,
//           isNotAvailable: apiResponse.isNotAvailable,
//           VechileId: apiResponse.VechileId,
//           vechileType: apiResponse.vechileType,
//           isCustomerBooking: false,
//         });
//       }
      
//       // Update local state
//       const filtered = blockedSlots.filter((s) => getSlotId(s) !== editingSlotId);
//       const updated = [...filtered, ...newSlots];
//       setBlockedSlots(updated);
//       saveBlockedDatesToStorage(updated);
      
//       await fetchVehicleAvailability();
      
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
//       console.log("🎉 RANGE SPLIT COMPLETE!");
//       console.log("✅ Created", newSlots.length, "new range(s)");
//       console.log("📅 Removed dates are now available for customers");
//       console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
//       showMessage("success", `✅ Dates updated! Split into ${ranges.length} range(s). Removed dates are now available for customers.`);
      
//       setShowEditModal(false);
//       setEditingSlot(null);
//       setEditingSlotId(null);
//       setDatesToRemove([]);
      
//     } catch (e: any) {
//       console.error("❌ Edit failed:", e);
//       showMessage("error", e.message || "Failed to update dates");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================
//   // HANDLE DELETE
//   // ============================

//   const handleDelete = async (slot: NotAvailabilitySlot) => {
//     const slotId = getSlotId(slot);
//     if (!slotId) {
//       showMessage("error", "Cannot delete: slot ID not found");
//       return;
//     }

//     // 🔥 Check if this is a customer booking - owner cannot delete
//     if (slot.isCustomerBooking) {
//       console.log("🚫 Attempted to delete customer booking:", slot);
//       showMessage("error", "❌ Cannot delete customer bookings! Customers must cancel their own bookings.");
//       return;
//     }

//     if (!confirm("Are you sure you want to delete this blocked date range?")) {
//       return;
//     }

//     setLoading(true);

//     try {
//       console.log("🗑️ Deleting owner blocked slot:", slotId);
//       await deleteBlockedDateAPI(slotId);

//       const filtered = blockedSlots.filter((s) => getSlotId(s) !== slotId);
//       setBlockedSlots(filtered);
//       saveBlockedDatesToStorage(filtered);

//       await fetchVehicleAvailability();

//       showMessage("success", "✅ Blocked dates deleted successfully!");
//       setShowOptionsMenu(false);
//       setShowDeleteListModal(false);
//     } catch (e: any) {
//       showMessage("error", e.message || "Failed to delete");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================
//   // HANDLE DATE CLICK
//   // ============================

//   const handleDateClick = (date: Date) => {
//     if (isPastDate(date)) return;

//     const blocked = isDateBlocked(date);
//     const customerBooked = isCustomerBooked(date);

//     // 🔥 Owner cannot select customer booked dates
//     if (customerBooked) {
//       console.log("🚫 Owner attempted to select customer booked date:", formatDateForAPI(date));
//       showMessage("error", "❌ This date is booked by a customer. Cannot modify.");
//       return;
//     }

//     if (isEditMode && blocked) {
//       const filtered = blockedSlots.filter((slot) => {
//         const from = new Date(slot.fromDate.split("T")[0]);
//         const to = new Date(slot.toDate.split("T")[0]);
//         return !(date >= from && date <= to);
//       });

//       setBlockedSlots(filtered);
//       saveBlockedDatesToStorage(filtered);
//       showMessage("success", "Blocked date removed.");
//       return;
//     }

//     if (blocked && !editingSlotId) {
//       if (customerBooked) {
//         showMessage("error", "This date is booked by a customer.");
//       } else {
//         showMessage("error", "This date is already blocked by you.");
//       }
//       return;
//     }

//     if (!selectedStartDate) {
//       setSelectedStartDate(date);
//       setSelectedEndDate(null);
//       return;
//     }

//     if (!selectedEndDate) {
//       if (date < selectedStartDate) {
//         showMessage("error", "End date cannot be before start date");
//         return;
//       }
//       setSelectedEndDate(date);
//       return;
//     }

//     setSelectedStartDate(date);
//     setSelectedEndDate(null);
//   };

//   // ============================
//   // SAVE NEW BLOCKED DATES OR UPDATE
//   // ============================

//   const handleConfirmAndSave = async () => {
//     if (!selectedStartDate || !selectedEndDate) {
//       showMessage("error", "Please select both start and end dates.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const payload = {
//         vehicleType,
//         VechileId,
//         fromDate: formatDateForAPI(selectedStartDate),
//         toDate: formatDateForAPI(selectedEndDate),
//         fromTime: formatTimeForAPI(startTime),
//         toTime: formatTimeForAPI(endTime),
//       };

//       if (editingSlotId) {
//         // UPDATE EXISTING SLOT
//         const apiResponse = await updateBlockedDatesAPI(editingSlotId, payload);

//         const updatedSlots = blockedSlots.map((slot) => {
//           if (getSlotId(slot) === editingSlotId) {
//             return {
//               ...slot,
//               fromDate: apiResponse.fromDate || payload.fromDate,
//               toDate: apiResponse.toDate || payload.toDate,
//               fromTime: apiResponse.fromTime || payload.fromTime,
//               toTime: apiResponse.toTime || payload.toTime,
//             };
//           }
//           return slot;
//         });

//         setBlockedSlots(updatedSlots);
//         saveBlockedDatesToStorage(updatedSlots);
//         await fetchVehicleAvailability();

//         showMessage("success", "✅ Dates updated successfully!");
//         resetForm();
//       } else {
//         // CREATE NEW SLOT
//         const apiResponse = await createBlockedDatesAPI(payload);

//         const newSlot: NotAvailabilitySlot = {
//           _id: apiResponse._id,
//           fromDate: apiResponse.fromDate,
//           toDate: apiResponse.toDate,
//           fromTime: apiResponse.fromTime,
//           toTime: apiResponse.toTime,
//           isNotAvailable: apiResponse.isNotAvailable,
//           VechileId: apiResponse.VechileId,
//           vechileType: apiResponse.vechileType,
//           isCustomerBooking: false,
//         };

//         const updated = [...blockedSlots, newSlot];
//         setBlockedSlots(updated);
//         saveBlockedDatesToStorage(updated);
//         await fetchVehicleAvailability();

//         showMessage("success", "✅ Dates blocked successfully! Now visible in all customer calendars.");
//         resetForm();
//       }
//     } catch (e: any) {
//       showMessage("error", e.message || "Failed to save.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================
//   // MANUAL REFRESH BUTTON
//   // ============================

//   const handleManualRefresh = async () => {
//     console.log("🔄 Manual refresh triggered by owner");
//     setLoading(true);
//     await fetchVehicleAvailability();
//     setLoading(false);
//     showMessage("success", "✅ Availability refreshed!");
//   };

//   // ============================
//   // UI HELPERS
//   // ============================

//   const showMessage = (type: string, text: string) => {
//     setMessage({ type, text });
//     setTimeout(() => setMessage({ type: "", text: "" }), 4000);
//   };

//   // ============================
//   // CALENDAR UI GENERATION
//   // ============================

//   const monthName = currentMonth.toLocaleDateString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

//   const daysInMonth = new Date(
//     currentMonth.getFullYear(),
//     currentMonth.getMonth() + 1,
//     0
//   ).getDate();

//   const firstDay = new Date(
//     currentMonth.getFullYear(),
//     currentMonth.getMonth(),
//     1
//   ).getDay();

//   const renderCalendarDays = () => {
//     const days: JSX.Element[] = [];
//     const offset = firstDay === 0 ? 6 : firstDay - 1;

//     for (let i = 0; i < offset; i++) days.push(<div key={"empty-"+i} />);

//     for (let d = 1; d <= daysInMonth; d++) {
//       const date = new Date(
//         currentMonth.getFullYear(),
//         currentMonth.getMonth(),
//         d
//       );

//       const past = isPastDate(date);
//       const blocked = isDateBlocked(date);
//       const customerBooked = isCustomerBooked(date);
//       const ownerBlocked = isOwnerBlocked(date);
//       const selected =
//         selectedStartDate?.getTime() === date.getTime() ||
//         selectedEndDate?.getTime() === date.getTime();

//       let className =
//         "h-12 rounded-lg transition relative font-medium flex items-center justify-center ";

//       if (past) {
//         className += "bg-gray-100 text-gray-400 cursor-not-allowed";
//       } else if (customerBooked) {
//         // 🔥 Customer booked dates - orange/yellow color with badge
//         className += "bg-orange-100 border-2 border-orange-500 text-orange-700 relative cursor-not-allowed";
//       } else if (ownerBlocked) {
//         // 🔥 Owner blocked dates - red color
//         className += "bg-red-100 border-2 border-red-500 text-red-700 relative hover:bg-red-200";
//       } else if (blocked) {
//         // Generic blocked
//         className += "bg-red-100 border-2 border-red-500 text-red-700 relative hover:bg-red-200";
//       } else if (selected) {
//         className += "bg-black text-white border-2 border-black";
//       } else {
//         className += "bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white hover:opacity-90";
//       }

//       days.push(
//         <button
//           key={d}
//           className={className}
//           disabled={past || customerBooked}
//           onClick={() => handleDateClick(date)}
//           title={
//             customerBooked 
//               ? "Customer Booking (Cannot Edit)" 
//               : ownerBlocked 
//                 ? "Your Blocked Date" 
//                 : blocked
//                   ? "Blocked"
//                   : "Available"
//           }
//         >
//           {d}
//           {customerBooked && (
//             <>
//               <svg
//                 className="absolute inset-0 w-full h-full pointer-events-none"
//                 viewBox="0 0 40 40"
//               >
//                 <circle cx="20" cy="20" r="15" fill="none" stroke="#f97316" strokeWidth="2" />
//                 <text x="20" y="24" textAnchor="middle" fill="#f97316" fontSize="16" fontWeight="bold">
//                   C
//                 </text>
//               </svg>
//               <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
//             </>
//           )}
//           {ownerBlocked && (
//             <>
//               <svg
//                 className="absolute inset-0 w-full h-full pointer-events-none"
//                 viewBox="0 0 40 40"
//               >
//                 <line
//                   x1="6"
//                   y1="6"
//                   x2="34"
//                   y2="34"
//                   stroke="#dc2626"
//                   strokeWidth="3"
//                   strokeLinecap="round"
//                 />
//                 <line
//                   x1="34"
//                   y1="6"
//                   x2="6"
//                   y2="34"
//                   stroke="#dc2626"
//                   strokeWidth="3"
//                   strokeLinecap="round"
//                 />
//               </svg>
//               <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
//             </>
//           )}
//         </button>
//       );
//     }

//     return days;
//   };

//   // ============================
//   // NEW: EDIT MODAL CALENDAR
//   // ============================

//   const renderEditModalCalendar = () => {
//     if (!editingSlot) return null;

//     const allDates = getAllDatesInRange(editingSlot.fromDate, editingSlot.toDate);
    
//     const editMonthName = editModalMonth.toLocaleDateString("en-US", {
//       month: "long",
//       year: "numeric",
//     });

//     const daysInEditMonth = new Date(
//       editModalMonth.getFullYear(),
//       editModalMonth.getMonth() + 1,
//       0
//     ).getDate();

//     const firstDayEdit = new Date(
//       editModalMonth.getFullYear(),
//       editModalMonth.getMonth(),
//       1
//     ).getDay();

//     const days: JSX.Element[] = [];
//     const offset = firstDayEdit === 0 ? 6 : firstDayEdit - 1;

//     for (let i = 0; i < offset; i++) days.push(<div key={"empty-edit-"+i} />);

//     for (let d = 1; d <= daysInEditMonth; d++) {
//       const date = new Date(
//         editModalMonth.getFullYear(),
//         editModalMonth.getMonth(),
//         d
//       );
      
//       const dateStr = formatDateForAPI(date);
//       const isInRange = allDates.includes(dateStr);
//       const isMarkedForRemoval = datesToRemove.includes(dateStr);
      
//       let className = "h-12 rounded-lg transition relative font-medium flex items-center justify-center ";
      
//       if (!isInRange) {
//         className += "bg-gray-100 text-gray-400 cursor-not-allowed";
//       } else if (isMarkedForRemoval) {
//         className += "bg-green-500 text-white border-2 border-green-600 cursor-pointer hover:bg-green-600";
//       } else {
//         className += "bg-red-100 border-2 border-red-500 text-red-700 cursor-pointer hover:bg-red-200";
//       }

//       days.push(
//         <button
//           key={d}
//           className={className}
//           disabled={!isInRange}
//           onClick={() => isInRange && toggleDateRemoval(dateStr)}
//           title={
//             !isInRange 
//               ? "Not in range" 
//               : isMarkedForRemoval 
//                 ? "Click to keep (will remain blocked)" 
//                 : "Click to remove (will become available)"
//           }
//         >
//           {d}
//           {isMarkedForRemoval && (
//             <Check className="absolute top-1 right-1" size={16} />
//           )}
//         </button>
//       );
//     }

//     return (
//       <div>
//         <div className="flex justify-between items-center mb-4">
//           <button onClick={() =>
//             setEditModalMonth(
//               new Date(
//                 editModalMonth.getFullYear(),
//                 editModalMonth.getMonth() - 1
//               )
//             )
//           }>
//             <ChevronLeft />
//           </button>

//           <h3 className="text-xl font-bold">{editMonthName}</h3>

//           <button onClick={() =>
//             setEditModalMonth(
//               new Date(
//                 editModalMonth.getFullYear(),
//                 editModalMonth.getMonth() + 1
//               )
//             )
//           }>
//             <ChevronRight />
//           </button>
//         </div>

//         <div className="grid grid-cols-7 gap-2 mb-2">
//           {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
//             <div key={d} className="text-center font-bold text-gray-600 text-sm">
//               {d}
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-7 gap-2">{days}</div>
//       </div>
//     );
//   };

//   const generateTimeOptions = () => {
//     const arr = [];
//     for (let h = 0; h < 24; h++) {
//       for (let m = 0; m < 60; m += 30) {
//         const hh = String(h).padStart(2, "0");
//         const mm = String(m).padStart(2, "0");
//         arr.push({
//           value: `${hh}:${mm}`,
//           label: `${h % 12 || 12}:${mm} ${h >= 12 ? "PM" : "AM"}`,
//         });
//       }
//     }
//     return arr;
//   };

//   const timeOptions = generateTimeOptions();

//   // ============================
//   // JSX
//   // ============================

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white w-full max-w-6xl rounded-2xl p-6 overflow-y-auto max-h-[90vh] shadow-xl">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold flex items-center">
//             <Calendar className="mr-2 text-blue-600" />
//             Manage Vehicle Availability
//           </h2>

//           <div className="flex items-center gap-3">
//             {/* REFRESH BUTTON */}
//             <button
//               onClick={handleManualRefresh}
//               disabled={loading}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-semibold flex items-center gap-2"
//             >
//               <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
//               {loading ? "Refreshing..." : "Refresh"}
//             </button>

//             {/* THREE DOTS MENU */}
//             <div className="relative">
//               <button
//                 onClick={() => setShowOptionsMenu(!showOptionsMenu)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition"
//               >
//                 <MoreVertical size={24} />
//               </button>

//               {showOptionsMenu && (
//                 <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg border border-gray-200 w-40 z-50">
//                   <button
//                     onClick={() => {
//                       setShowDeleteListModal(true);
//                       setShowOptionsMenu(false);
//                     }}
//                     className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-2"
//                   >
//                     <Edit2 size={16} />
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowDeleteListModal(true);
//                       setShowOptionsMenu(false);
//                     }}
//                     className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
//                   >
//                     <Trash2 size={16} />
//                     Delete
//                   </button>
//                 </div>
//               )}
//             </div>

//             <button onClick={onClose}>
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* MESSAGES */}
//         {message.text && (
//           <div
//             className={`p-4 rounded-lg mb-4 ${
//               message.type === "error"
//                 ? "bg-red-100 text-red-800"
//                 : message.type === "success"
//                 ? "bg-green-100 text-green-800"
//                 : "bg-blue-100 text-blue-800"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <div className="grid grid-cols-3 gap-6">
//           {/* CALENDAR */}
//           <div className="col-span-2">
//             <div className="flex justify-between items-center mb-4">
//               <button onClick={() =>
//                 setCurrentMonth(
//                   new Date(
//                     currentMonth.getFullYear(),
//                     currentMonth.getMonth() - 1
//                   )
//                 )
//               }>
//                 <ChevronLeft />
//               </button>

//               <h3 className="text-xl font-bold">{monthName}</h3>

//               <button onClick={() =>
//                 setCurrentMonth(
//                   new Date(
//                     currentMonth.getFullYear(),
//                     currentMonth.getMonth() + 1
//                   )
//                 )
//               }>
//                 <ChevronRight />
//               </button>
//             </div>

//             <div className="grid grid-cols-7 gap-2 mb-2">
//               {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
//                 <div key={d} className="text-center font-bold text-gray-600">
//                   {d}
//                 </div>
//               ))}
//             </div>

//             <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

//             {/* LEGEND */}
//             <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//               <p className="font-semibold mb-2 text-sm">Legend:</p>
//               <div className="grid grid-cols-2 gap-2 text-xs">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
//                   <span>Your Blocked Dates</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
//                   <span>Customer Bookings</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* TIME + CONFIRM */}
//           <div>
//             <label className="font-semibold">Start Time</label>
//             <select
//               className="w-full p-2 border rounded mb-3"
//               value={startTime}
//               onChange={(e) => setStartTime(e.target.value)}
//             >
//               {timeOptions.map((t) => (
//                 <option value={t.value} key={t.value}>
//                   {t.label}
//                 </option>
//               ))}
//             </select>

//             <label className="font-semibold">End Time</label>
//             <select
//               className="w-full p-2 border rounded mb-4"
//               value={endTime}
//               onChange={(e) => setEndTime(e.target.value)}
//             >
//               {timeOptions.map((t) => (
//                 <option value={t.value} key={t.value}>
//                   {t.label}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={handleConfirmAndSave}
//               disabled={!selectedStartDate || !selectedEndDate || loading}
//               className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Saving..." : editingSlotId ? "Update Dates" : "Confirm & Block Dates"}
//             </button>

//             {editingSlotId && (
//               <button
//                 onClick={resetForm}
//                 className="w-full mt-2 bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold"
//               >
//                 Cancel Edit
//               </button>
//             )}

//             {/* INFO BOX */}
//             <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="text-xs text-blue-800">
//                 <strong>📌 Note:</strong> Customer booked dates (orange) cannot be edited or deleted by owner. Customers must cancel their own bookings. Auto-refreshes every 30 seconds.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* BLOCKED SUMMARY */}
//         {(blockedSlots.length > 0 || customerBookedDates.length > 0 || ownerBlockedDates.length > 0) && (
//           <div className="mt-6 grid grid-cols-3 gap-4">
//             <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//               <p className="font-bold text-red-800">
//                 {ownerBlockedDates.length} Your Blocked Dates
//               </p>
//               <p className="text-xs text-red-600 mt-1">Can edit/delete</p>
//             </div>
//             <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
//               <p className="font-bold text-orange-800">
//                 {customerBookedDates.length} Customer Bookings
//               </p>
//               <p className="text-xs text-orange-600 mt-1">Cannot edit/delete</p>
//             </div>
//             <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//               <p className="font-bold text-green-800">
//                 {apiUnavailableDates.length} Total Blocked
//               </p>
//               <p className="text-xs text-green-600 mt-1">Owner + Customer</p>
//             </div>
//           </div>
//         )}

//         {/* EDIT/DELETE LIST MODAL */}
//         {showDeleteListModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-bold">Manage Blocked Dates</h3>
//                 <button onClick={() => setShowDeleteListModal(false)}>
//                   <X size={24} />
//                 </button>
//               </div>

//               {blockedSlots.length === 0 ? (
//                 <p className="text-gray-500">No blocked dates available.</p>
//               ) : (
//                 <div className="space-y-3">
//                   {blockedSlots.map((slot, idx) => {
//                     const isCustomerBooking = slot.isCustomerBooking;
                    
//                     // ✅ FIX: Parse dates without timezone conversion
//                     const fromDateStr = slot.fromDate.split("T")[0];
//                     const toDateStr = slot.toDate.split("T")[0];
//                     const [fromYear, fromMonth, fromDay] = fromDateStr.split("-").map(Number);
//                     const [toYear, toMonth, toDay] = toDateStr.split("-").map(Number);
//                     const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
//                     const toDate = new Date(toYear, toMonth - 1, toDay);
                    
//                     return (
//                       <div
//                         key={idx}
//                         className={`border rounded-lg p-4 flex justify-between items-center ${
//                           isCustomerBooking 
//                             ? 'border-orange-300 bg-orange-50' 
//                             : 'border-gray-200'
//                         }`}
//                       >
//                         <div>
//                           <p className="font-semibold">
//                             {formatDateForDisplay(fromDate)} - {formatDateForDisplay(toDate)}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             Time: {slot.fromTime} - {slot.toTime}
//                           </p>
//                           {isCustomerBooking && (
//                             <p className="text-xs text-orange-600 font-semibold mt-1">
//                               🧑 Customer Booking (Cannot Edit/Delete)
//                             </p>
//                           )}
//                         </div>

//                         <div className="flex gap-2">
//                           {!isCustomerBooking ? (
//                             <>
//                               <button
//                                 onClick={() => handleEdit(slot)}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                               >
//                                 <Edit2 size={16} />
//                                 Edit
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(slot)}
//                                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
//                               >
//                                 <Trash2 size={16} />
//                                 Delete
//                               </button>
//                             </>
//                           ) : (
//                             <div className="px-4 py-2 bg-orange-200 text-orange-800 rounded-lg text-sm font-semibold">
//                               Customer Booking
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* NEW: EDIT MODAL WITH DATE SELECTION */}
//         {showEditModal && editingSlot && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h3 className="text-2xl font-bold">Edit Blocked Dates</h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Select dates to remove from blocking. Click dates to toggle.
//                   </p>
//                 </div>
//                 <button 
//                   onClick={() => {
//                     setShowEditModal(false);
//                     setEditingSlot(null);
//                     setEditingSlotId(null);
//                     setDatesToRemove([]);
//                   }}
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* Current Range Info */}
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                 <p className="font-semibold text-blue-900 mb-2">Current Blocked Range:</p>
//                 <p className="text-blue-800">
//                   <strong>{formatDateForDisplay((() => {
//                     const dateStr = editingSlot.fromDate.split("T")[0];
//                     const [year, month, day] = dateStr.split("-").map(Number);
//                     return new Date(year, month - 1, day);
//                   })())}</strong>
//                   {" → "}
//                   <strong>{formatDateForDisplay((() => {
//                     const dateStr = editingSlot.toDate.split("T")[0];
//                     const [year, month, day] = dateStr.split("-").map(Number);
//                     return new Date(year, month - 1, day);
//                   })())}</strong>
//                 </p>
//                 <p className="text-sm text-blue-700 mt-1">
//                   Time: {editingSlot.fromTime} - {editingSlot.toTime}
//                 </p>
//               </div>

//               {/* Calendar for date selection */}
//               <div className="mb-6">
//                 {renderEditModalCalendar()}
//               </div>

//               {/* Legend */}
//               <div className="bg-gray-50 rounded-lg p-4 mb-6">
//                 <p className="font-semibold mb-3 text-sm">How to use:</p>
//                 <div className="space-y-2 text-xs">
//                   <div className="flex items-center gap-2">
//                     <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded flex-shrink-0"></div>
//                     <span><strong>Red dates:</strong> Currently blocked. Click to mark for removal.</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-6 h-6 bg-green-500 rounded flex-shrink-0 flex items-center justify-center">
//                       <Check size={12} className="text-white" />
//                     </div>
//                     <span><strong>Green dates with ✓:</strong> Marked for removal (will become available for customers).</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Selected dates info */}
//               {datesToRemove.length > 0 && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//                   <p className="font-semibold text-green-900 mb-2">
//                     {datesToRemove.length} date(s) selected for removal:
//                   </p>
//                   <div className="flex flex-wrap gap-2">
//                     {datesToRemove.sort().map(dateStr => {
//                       // ✅ FIX: Parse date without timezone conversion
//                       const [year, month, day] = dateStr.split("-").map(Number);
//                       const date = new Date(year, month - 1, day);
                      
//                       return (
//                         <span 
//                           key={dateStr}
//                           className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium"
//                         >
//                           {formatDateForDisplay(date)}
//                         </span>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleConfirmEdit}
//                   disabled={datesToRemove.length === 0 || loading}
//                   className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                 >
//                   {loading ? "Processing..." : `Remove ${datesToRemove.length} Date(s) & Update`}
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowEditModal(false);
//                     setEditingSlot(null);
//                     setEditingSlotId(null);
//                     setDatesToRemove([]);
//                   }}
//                   disabled={loading}
//                   className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition"
//                 >
//                   Cancel
//                 </button>
//               </div>

//               {/* Info Alert */}
//               <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-xs text-yellow-800">
//                   <strong>⚠️ Important:</strong> If you remove dates from the middle of a range, it will be split into multiple ranges. Removed dates will immediately become available for customer bookings.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VehicleAvailabilityCalendar;

 












import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  MoreVertical,
  RefreshCw,
} from "lucide-react";

interface VehicleAvailabilityCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  VechileId: string;
  vehicleType: "Car" | "Bike" | "Auto";
  userId: string;
  
}

interface NotAvailabilitySlot {
  _id?: string;
  id?: string;
  notAvailabilityId?: string;
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  isNotAvailable: boolean;
  VechileId: string;
  vechileType: string;
  userId?: string;
  isCustomerBooking?: boolean;
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
  const [blockedSlots, setBlockedSlots] = useState<NotAvailabilitySlot[]>([]);
  const [apiUnavailableDates, setApiUnavailableDates] = useState<string[]>([]);
  const [ownerBlockedDates, setOwnerBlockedDates] = useState<string[]>([]);
  const [customerBookedDates, setCustomerBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<any>(null);
  
  // NEW: Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<NotAvailabilitySlot | null>(null);
  const [datesToRemove, setDatesToRemove] = useState<string[]>([]);
  const [editModalMonth, setEditModalMonth] = useState(new Date());

  // ============================
  // FORMATTERS
  // ============================

  const formatDateForAPI = (date: Date | null): string => {
    if (!date) return "";
    // ✅ FIX: Use local date components to avoid timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeForAPI = (time: string): string => {
    const [hours, minutes] = time.split(":");
    return `${parseInt(hours)}.${minutes}`;
  };

  // ============================
  // GET SLOT ID
  // ============================

  const getSlotId = (slot: NotAvailabilitySlot): string | null => {
    return slot._id || slot.id || slot.notAvailabilityId || null;
  };

  // ============================
  // 🔥 FETCH API UNAVAILABLE DATES (INCLUDES CUSTOMER BOOKINGS)
  // ============================

  const fetchVehicleAvailability = async () => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📡 FETCHING VEHICLE AVAILABILITY (Owner Calendar)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🚗 Vehicle ID:", VechileId);
      console.log("🏷️ Vehicle Type:", vehicleType);

      const url = `https://api.rentongovehicle.com/getVehicleAvailability?vechileType=${vehicleType}&VechileId=${VechileId}`;

      const res = await fetch(url);
      const data = await res.json();

      console.log("✅ Raw API Response:", data);

      if (data.success && data.availability) {
        // All unavailable dates
        const unavailable = data.availability
          .filter((item: any) => item.status === "Unavailable")
          .map((item: any) => item.date);

        setApiUnavailableDates(unavailable);
        
        // Owner blocked dates (not customer bookings)
        const ownerBlocked = data.availability
          .filter((item: any) => item.status === "Unavailable" && !item.isCustomerBooking)
          .map((item: any) => item.date);
        
        setOwnerBlockedDates(ownerBlocked);
        
        // Customer booked dates
        const customerBooked = data.availability
          .filter((item: any) => item.status === "Unavailable" && item.isCustomerBooking === true)
          .map((item: any) => item.date);
        
        setCustomerBookedDates(customerBooked);

        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📊 AVAILABILITY SUMMARY (Owner Calendar)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🔒 Total Unavailable Dates:", unavailable.length);
        console.log("   All Unavailable:", unavailable);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("👤 Owner Blocked Dates:", ownerBlocked.length);
        console.log("   Owner Dates:", ownerBlocked);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🧑 Customer Booked Dates:", customerBooked.length);
        console.log("   Customer Dates:", customerBooked);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
    } catch (err) {
      console.error("❌ Failed to fetch availability", err);
    }
  };

  // ============================
  // STORAGE HELPERS
  // ============================

  const loadBlockedDatesFromStorage = () => {
    const stored = localStorage.getItem("blocked_slots_" + VechileId);
    if (stored) {
      setBlockedSlots(JSON.parse(stored));
    }
  };

  const saveBlockedDatesToStorage = (slots: any) => {
    localStorage.setItem("blocked_slots_" + VechileId, JSON.stringify(slots));
  };

  // ============================
  // DATE UTILITIES
  // ============================

  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isCustomerBooked = (date: Date): boolean => {
    const formatted = formatDateForAPI(date);
    return customerBookedDates.includes(formatted);
  };

  const isOwnerBlocked = (date: Date): boolean => {
    const formatted = formatDateForAPI(date);
    return ownerBlockedDates.includes(formatted);
  };

  // MAIN BLOCKED CHECK
  const isDateBlocked = (date: Date): boolean => {
    const formatted = formatDateForAPI(date);

    // API unavailable dates (includes both owner blocked + customer booked)
    if (apiUnavailableDates.includes(formatted)) return true;

    // Your manually blocked ranges
    for (const slot of blockedSlots) {
      // ✅ FIX: Parse dates without timezone conversion
      const fromDateStr = slot.fromDate.split("T")[0];
      const toDateStr = slot.toDate.split("T")[0];
      
      const [fromYear, fromMonth, fromDay] = fromDateStr.split("-").map(Number);
      const [toYear, toMonth, toDay] = toDateStr.split("-").map(Number);
      
      const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
      const toDate = new Date(toYear, toMonth - 1, toDay);

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      if (date >= fromDate && date <= toDate) return true;
    }

    return false;
  };

  const resetForm = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setShowOptionsMenu(false);
    setShowDeleteListModal(false);
    setIsEditMode(false);
    setEditingSlotId(null);
  };

  // ============================
  // NEW: GET ALL DATES IN RANGE
  // ============================

  const getAllDatesInRange = (fromDate: string, toDate: string): string[] => {
    const dates: string[] = [];
    // ✅ FIX: Parse dates without timezone conversion
    const [startYear, startMonth, startDay] = fromDate.split("T")[0].split("-").map(Number);
    const [endYear, endMonth, endDay] = toDate.split("T")[0].split("-").map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(formatDateForAPI(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // ============================
  // USE EFFECT - AUTO REFRESH
  // ============================

  useEffect(() => {
    if (isOpen) {
      fetchVehicleAvailability();
      loadBlockedDatesFromStorage();

      // Auto-refresh every 30 seconds to see new customer bookings
      const interval = setInterval(() => {
        console.log("🔄 Auto-refresh: Loading owner calendar...");
        fetchVehicleAvailability();
      }, 30000);

      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) clearInterval(refreshInterval);
      resetForm();
    }
  }, [isOpen]);

  // ============================
  // API CREATE BLOCKED SLOT
  // ============================

  const createBlockedDatesAPI = async (slotData: any) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 OWNER BLOCKING DATES");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📋 Slot Data:", slotData);

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const body = new URLSearchParams();
      body.append("userId", userId);
      body.append("vechileType", slotData.vehicleType);
      body.append("VechileId", slotData.VechileId);
      body.append("fromDate", slotData.fromDate);
      body.append("toDate", slotData.toDate);
      body.append("fromTime", slotData.fromTime);
      body.append("toTime", slotData.toTime);
      body.append("isNotAvailable", "true");
      body.append("bikeImages", "");
      body.append("isCustomerBooking", "false"); // 🔥 Mark as owner blocking

      console.log("📤 Request Body:", Object.fromEntries(body));

      const res = await fetch(
        "https://api.rentongovehicle.com/createNotAvailability",
        { method: "POST", headers, body }
      );

      const result = await res.json();

      console.log("✅ API Response:", result);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎉 OWNER DATES BLOCKED!");
      console.log("📅 From:", slotData.fromDate, "To:", slotData.toDate);
      console.log("🔒 These dates are now BLOCKED in:");
      console.log("   ✅ Owner Calendar");
      console.log("   ✅ All Customer Calendars");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (res.ok && result.data) return result.data;

      throw new Error(result.message || "Failed to create slot");
    } catch (e: any) {
      console.error("❌ API Error:", e);
      throw e;
    }
  };

  // ============================
  // API UPDATE BLOCKED SLOT
  // ============================

  const updateBlockedDatesAPI = async (slotId: string, slotData: any) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 OWNER UPDATING BLOCKED DATES");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🆔 Slot ID:", slotId);
      console.log("📋 New Data:", slotData);

      const headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      const body = new URLSearchParams();
      body.append("vechileType", slotData.vehicleType);
      body.append("VechileId", slotData.VechileId);
      body.append("fromDate", slotData.fromDate);
      body.append("toDate", slotData.toDate);
      body.append("fromTime", slotData.fromTime);
      body.append("toTime", slotData.toTime);
      body.append("isNotAvailable", "true");

      const res = await fetch(
        `https://api.rentongovehicle.com/updateNotAvailability/${slotId}`,
        { method: "PUT", headers, body }
      );

      const result = await res.json();

      console.log("✅ Update Response:", result);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (res.ok) return result.data || result;

      throw new Error(result.message || "Failed to update slot");
    } catch (e: any) {
      console.error("❌ UPDATE API Error:", e);
      throw e;
    }
  };

  // ============================
  // API DELETE BLOCKED SLOT
  // ============================

  const deleteBlockedDateAPI = async (slotId: string) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🗑️ OWNER DELETING BLOCKED DATES");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🆔 Slot ID:", slotId);

      const urlencoded = new URLSearchParams();

      const res = await fetch(
        `https://api.rentongovehicle.com/deleteNotAvailability/${slotId}`,
        {
          method: "DELETE",
          body: urlencoded,
        }
      );

      const result = await res.text();

      console.log("✅ Delete Response:", result);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (res.ok) return result;

      throw new Error("Failed to delete slot");
    } catch (e: any) {
      console.error("❌ DELETE API Error:", e);
      throw e;
    }
  };

  // ============================
  // NEW: HANDLE EDIT WITH MODAL
  // ============================

  const handleEdit = (slot: NotAvailabilitySlot) => {
    const slotId = getSlotId(slot);
    if (!slotId) {
      showMessage("error", "Cannot edit: slot ID not found");
      return;
    }

    // 🔥 Check if this is a customer booking - owner cannot edit
    if (slot.isCustomerBooking) {
      console.log("🚫 Attempted to edit customer booking:", slot);
      showMessage("error", "❌ Cannot edit customer bookings! Customers must cancel their own bookings.");
      return;
    }

    console.log("✏️ Opening edit modal for slot:", slotId);
    
    setEditingSlot(slot);
    setEditingSlotId(slotId);
    setDatesToRemove([]);
    
    // ✅ FIX: Set edit modal to show the month of the slot's start date without timezone conversion
    const slotStartDateStr = slot.fromDate.split("T")[0];
    const [year, month, day] = slotStartDateStr.split("-").map(Number);
    const slotStartDate = new Date(year, month - 1, day);
    setEditModalMonth(slotStartDate);
    
    setShowEditModal(true);
    setShowOptionsMenu(false);
    setShowDeleteListModal(false);
  };

  // ============================
  // NEW: TOGGLE DATE REMOVAL IN EDIT MODAL
  // ============================

  const toggleDateRemoval = (dateStr: string) => {
    if (datesToRemove.includes(dateStr)) {
      setDatesToRemove(datesToRemove.filter(d => d !== dateStr));
    } else {
      setDatesToRemove([...datesToRemove, dateStr]);
    }
  };

  // ============================
  // NEW: PROCESS EDIT WITH RANGE SPLITTING
  // ============================

  const handleConfirmEdit = async () => {
    if (!editingSlot || !editingSlotId) {
      showMessage("error", "No slot selected for editing");
      return;
    }

    if (datesToRemove.length === 0) {
      showMessage("error", "Please select at least one date to remove");
      return;
    }

    setLoading(true);

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✂️ SPLITTING DATE RANGE");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      // Get all dates in the original range
      const allDates = getAllDatesInRange(editingSlot.fromDate, editingSlot.toDate);
      console.log("📅 Original range dates:", allDates);
      console.log("🗑️ Dates to remove:", datesToRemove);
      
      // Remove selected dates
      const remainingDates = allDates.filter(d => !datesToRemove.includes(d));
      console.log("✅ Remaining dates:", remainingDates);
      
      if (remainingDates.length === 0) {
        // All dates removed - just delete the slot
        console.log("🗑️ All dates removed - deleting entire slot");
        await deleteBlockedDateAPI(editingSlotId);
        
        const filtered = blockedSlots.filter((s) => getSlotId(s) !== editingSlotId);
        setBlockedSlots(filtered);
        saveBlockedDatesToStorage(filtered);
        
        await fetchVehicleAvailability();
        
        showMessage("success", "✅ All dates removed - slot deleted!");
        setShowEditModal(false);
        setEditingSlot(null);
        setEditingSlotId(null);
        setDatesToRemove([]);
        return;
      }
      
      // Find continuous date ranges in remaining dates
      const ranges: { from: string; to: string }[] = [];
      let rangeStart = remainingDates[0];
      let rangeEnd = remainingDates[0];
      
      for (let i = 1; i < remainingDates.length; i++) {
        // ✅ FIX: Parse dates without timezone conversion
        const [currYear, currMonth, currDay] = remainingDates[i].split("-").map(Number);
        const [prevYear, prevMonth, prevDay] = remainingDates[i - 1].split("-").map(Number);
        
        const currentDate = new Date(currYear, currMonth - 1, currDay);
        const previousDate = new Date(prevYear, prevMonth - 1, prevDay);
        
        // Check if dates are consecutive
        const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Continue current range
          rangeEnd = remainingDates[i];
        } else {
          // Start new range
          ranges.push({ from: rangeStart, to: rangeEnd });
          rangeStart = remainingDates[i];
          rangeEnd = remainingDates[i];
        }
      }
      
      // Add the last range
      ranges.push({ from: rangeStart, to: rangeEnd });
      
      console.log("📊 Split into", ranges.length, "range(s):", ranges);
      
      // Delete the original slot
      console.log("🗑️ Deleting original slot:", editingSlotId);
      await deleteBlockedDateAPI(editingSlotId);
      
      // Create new slots for each range
      const newSlots: NotAvailabilitySlot[] = [];
      
      for (const range of ranges) {
        console.log("➕ Creating new range:", range);
        
        const payload = {
          vehicleType,
          VechileId,
          fromDate: range.from,
          toDate: range.to,
          fromTime: editingSlot.fromTime,
          toTime: editingSlot.toTime,
        };
        
        const apiResponse = await createBlockedDatesAPI(payload);
        
        newSlots.push({
          _id: apiResponse._id,
          fromDate: apiResponse.fromDate,
          toDate: apiResponse.toDate,
          fromTime: apiResponse.fromTime,
          toTime: apiResponse.toTime,
          isNotAvailable: apiResponse.isNotAvailable,
          VechileId: apiResponse.VechileId,
          vechileType: apiResponse.vechileType,
          isCustomerBooking: false,
        });
      }
      
      // Update local state
      const filtered = blockedSlots.filter((s) => getSlotId(s) !== editingSlotId);
      const updated = [...filtered, ...newSlots];
      setBlockedSlots(updated);
      saveBlockedDatesToStorage(updated);
      
      await fetchVehicleAvailability();
      
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎉 RANGE SPLIT COMPLETE!");
      console.log("✅ Created", newSlots.length, "new range(s)");
      console.log("📅 Removed dates are now available for customers");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      showMessage("success", `✅ Dates updated! Split into ${ranges.length} range(s). Removed dates are now available for customers.`);
      
      setShowEditModal(false);
      setEditingSlot(null);
      setEditingSlotId(null);
      setDatesToRemove([]);
      
    } catch (e: any) {
      console.error("❌ Edit failed:", e);
      showMessage("error", e.message || "Failed to update dates");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // HANDLE DELETE
  // ============================

  const handleDelete = async (slot: NotAvailabilitySlot) => {
    const slotId = getSlotId(slot);
    if (!slotId) {
      showMessage("error", "Cannot delete: slot ID not found");
      return;
    }

    // 🔥 Check if this is a customer booking - owner cannot delete
    if (slot.isCustomerBooking) {
      console.log("🚫 Attempted to delete customer booking:", slot);
      showMessage("error", "❌ Cannot delete customer bookings! Customers must cancel their own bookings.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this blocked date range?")) {
      return;
    }

    setLoading(true);

    try {
      console.log("🗑️ Deleting owner blocked slot:", slotId);
      await deleteBlockedDateAPI(slotId);

      const filtered = blockedSlots.filter((s) => getSlotId(s) !== slotId);
      setBlockedSlots(filtered);
      saveBlockedDatesToStorage(filtered);

      await fetchVehicleAvailability();

      showMessage("success", "✅ Blocked dates deleted successfully!");
      setShowOptionsMenu(false);
      setShowDeleteListModal(false);
    } catch (e: any) {
      showMessage("error", e.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // HANDLE DATE CLICK
  // ============================

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) return;

    const blocked = isDateBlocked(date);
    const customerBooked = isCustomerBooked(date);

    // 🔥 Owner cannot select customer booked dates
    if (customerBooked) {
      console.log("🚫 Owner attempted to select customer booked date:", formatDateForAPI(date));
      showMessage("error", "❌ This date is booked by a customer. Cannot modify.");
      return;
    }

    if (isEditMode && blocked) {
      const filtered = blockedSlots.filter((slot) => {
        const from = new Date(slot.fromDate.split("T")[0]);
        const to = new Date(slot.toDate.split("T")[0]);
        return !(date >= from && date <= to);
      });

      setBlockedSlots(filtered);
      saveBlockedDatesToStorage(filtered);
      showMessage("success", "Blocked date removed.");
      return;
    }

    if (blocked && !editingSlotId) {
      if (customerBooked) {
        showMessage("error", "This date is booked by a customer.");
      } else {
        showMessage("error", "This date is already blocked by you.");
      }
      return;
    }

    if (!selectedStartDate) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      return;
    }

    if (!selectedEndDate) {
      if (date < selectedStartDate) {
        showMessage("error", "End date cannot be before start date");
        return;
      }
      setSelectedEndDate(date);
      return;
    }

    setSelectedStartDate(date);
    setSelectedEndDate(null);
  };

  // ============================
  // SAVE NEW BLOCKED DATES OR UPDATE
  // ============================

  const handleConfirmAndSave = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      showMessage("error", "Please select both start and end dates.");
      return;
    }

    setLoading(true);

    try {
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
          if (getSlotId(slot) === editingSlotId) {
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

        showMessage("success", "✅ Dates blocked successfully! Now visible in all customer calendars.");
        resetForm();
      }
    } catch (e: any) {
      showMessage("error", e.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // MANUAL REFRESH BUTTON
  // ============================

  const handleManualRefresh = async () => {
    console.log("🔄 Manual refresh triggered by owner");
    setLoading(true);
    await fetchVehicleAvailability();
    setLoading(false);
    showMessage("success", "✅ Availability refreshed!");
  };

  // ============================
  // UI HELPERS
  // ============================

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // ============================
  // CALENDAR UI GENERATION
  // ============================

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const renderCalendarDays = () => {
    const days: JSX.Element[] = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) days.push(<div key={"empty-"+i} />);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        d
      );

      const past = isPastDate(date);
      const blocked = isDateBlocked(date);
      const customerBooked = isCustomerBooked(date);
      const ownerBlocked = isOwnerBlocked(date);
      const selected =
        selectedStartDate?.getTime() === date.getTime() ||
        selectedEndDate?.getTime() === date.getTime();

      let className =
        "h-12 rounded-lg transition relative font-medium flex items-center justify-center ";

      if (past) {
        className += "bg-gray-100 text-gray-400 cursor-not-allowed";
      } else if (customerBooked) {
        // 🔥 Customer booked dates - orange/yellow color with badge
        className += "bg-orange-100 border-2 border-orange-500 text-orange-700 relative cursor-not-allowed";
      } else if (ownerBlocked) {
        // 🔥 Owner blocked dates - red color
        className += "bg-red-100 border-2 border-red-500 text-red-700 relative hover:bg-red-200";
      } else if (blocked) {
        // Generic blocked
        className += "bg-red-100 border-2 border-red-500 text-red-700 relative hover:bg-red-200";
      } else if (selected) {
        className += "bg-black text-white border-2 border-black";
      } else {
        className += "bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white hover:opacity-90";
      }

      days.push(
        <button
          key={d}
          className={className}
          disabled={past || customerBooked}
          onClick={() => handleDateClick(date)}
          title={
            customerBooked 
              ? "Customer Booking (Cannot Edit)" 
              : ownerBlocked 
                ? "Your Blocked Date" 
                : blocked
                  ? "Blocked"
                  : "Available"
          }
        >
          {d}
          {customerBooked && (
            <>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 40 40"
              >
                <circle cx="20" cy="20" r="15" fill="none" stroke="#f97316" strokeWidth="2" />
                <text x="20" y="24" textAnchor="middle" fill="#f97316" fontSize="16" fontWeight="bold">
                  C
                </text>
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
            </>
          )}
          {ownerBlocked && (
            <>
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 40 40"
              >
                <line
                  x1="6"
                  y1="6"
                  x2="34"
                  y2="34"
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="34"
                  y1="6"
                  x2="6"
                  y2="34"
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </>
          )}
        </button>
      );
    }

    return days;
  };

  // ============================
  // NEW: EDIT MODAL CALENDAR
  // ============================

  const renderEditModalCalendar = () => {
    if (!editingSlot) return null;

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

    for (let i = 0; i < offset; i++) days.push(<div key={"empty-edit-"+i} />);

    for (let d = 1; d <= daysInEditMonth; d++) {
      const date = new Date(
        editModalMonth.getFullYear(),
        editModalMonth.getMonth(),
        d
      );
      
      const dateStr = formatDateForAPI(date);
      const isInRange = allDates.includes(dateStr);
      const isMarkedForRemoval = datesToRemove.includes(dateStr);
      
      let className = "h-12 rounded-lg transition relative font-medium flex items-center justify-center ";
      
      if (!isInRange) {
        className += "bg-gray-100 text-gray-400 cursor-not-allowed";
      } else if (isMarkedForRemoval) {
        className += "bg-green-500 text-white border-2 border-green-600 cursor-pointer hover:bg-green-600";
      } else {
        className += "bg-red-100 border-2 border-red-500 text-red-700 cursor-pointer hover:bg-red-200";
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
          <button onClick={() =>
            setEditModalMonth(
              new Date(
                editModalMonth.getFullYear(),
                editModalMonth.getMonth() - 1
              )
            )
          }>
            <ChevronLeft />
          </button>

          <h3 className="text-xl font-bold">{editMonthName}</h3>

          <button onClick={() =>
            setEditModalMonth(
              new Date(
                editModalMonth.getFullYear(),
                editModalMonth.getMonth() + 1
              )
            )
          }>
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center font-bold text-gray-600 text-sm">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">{days}</div>
      </div>
    );
  };

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

  // ============================
  // JSX
  // ============================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-6xl rounded-2xl p-6 overflow-y-auto max-h-[90vh] shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2 text-blue-600" />
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
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteListModal(true);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 size={16} />
                    Delete
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
            <div className="flex justify-between items-center mb-4">
              <button onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1
                  )
                )
              }>
                <ChevronLeft />
              </button>

              <h3 className="text-xl font-bold">{monthName}</h3>

              <button onClick={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1
                  )
                )
              }>
                <ChevronRight />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center font-bold text-gray-600">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

            {/* LEGEND */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-2 text-sm">Legend:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                  <span>Your Blocked Dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
                  <span>Customer Bookings</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIME + CONFIRM */}
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

            <button
              onClick={handleConfirmAndSave}
              disabled={!selectedStartDate || !selectedEndDate || loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                <strong>📌 Note:</strong> Customer booked dates (orange) cannot be edited or deleted by owner. Customers must cancel their own bookings. Auto-refreshes every 30 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* BLOCKED SUMMARY */}
        {(blockedSlots.length > 0 || customerBookedDates.length > 0 || ownerBlockedDates.length > 0) && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-bold text-red-800">
                {ownerBlockedDates.length} Your Blocked Dates
              </p>
              <p className="text-xs text-red-600 mt-1">Can edit/delete</p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-bold text-orange-800">
                {customerBookedDates.length} Customer Bookings
              </p>
              <p className="text-xs text-orange-600 mt-1">Cannot edit/delete</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-bold text-green-800">
                {apiUnavailableDates.length} Total Blocked
              </p>
              <p className="text-xs text-green-600 mt-1">Owner + Customer</p>
            </div>
          </div>
        )}

        {/* EDIT/DELETE LIST MODAL */}
        {showDeleteListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Manage Blocked Dates</h3>
                <button onClick={() => setShowDeleteListModal(false)}>
                  <X size={24} />
                </button>
              </div>

              {blockedSlots.length === 0 ? (
                <p className="text-gray-500">No blocked dates available.</p>
              ) : (
                <div className="space-y-3">
                  {blockedSlots.map((slot, idx) => {
                    const isCustomerBooking = slot.isCustomerBooking;
                    
                    // ✅ FIX: Parse dates without timezone conversion
                    const fromDateStr = slot.fromDate.split("T")[0];
                    const toDateStr = slot.toDate.split("T")[0];
                    const [fromYear, fromMonth, fromDay] = fromDateStr.split("-").map(Number);
                    const [toYear, toMonth, toDay] = toDateStr.split("-").map(Number);
                    const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
                    const toDate = new Date(toYear, toMonth - 1, toDay);
                    
                    return (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 flex justify-between items-center ${
                          isCustomerBooking 
                            ? 'border-orange-300 bg-orange-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">
                            {formatDateForDisplay(fromDate)} - {formatDateForDisplay(toDate)}
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
        )}

        {/* NEW: EDIT MODAL WITH DATE SELECTION */}
        {showEditModal && editingSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Edit Blocked Dates</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select dates to remove from blocking. Click dates to toggle.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSlot(null);
                    setEditingSlotId(null);
                    setDatesToRemove([]);
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Current Range Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-blue-900 mb-2">Current Blocked Range:</p>
                <p className="text-blue-800">
                  <strong>{formatDateForDisplay((() => {
                    const dateStr = editingSlot.fromDate.split("T")[0];
                    const [year, month, day] = dateStr.split("-").map(Number);
                    return new Date(year, month - 1, day);
                  })())}</strong>
                  {" → "}
                  <strong>{formatDateForDisplay((() => {
                    const dateStr = editingSlot.toDate.split("T")[0];
                    const [year, month, day] = dateStr.split("-").map(Number);
                    return new Date(year, month - 1, day);
                  })())}</strong>
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Time: {editingSlot.fromTime} - {editingSlot.toTime}
                </p>
              </div>

              {/* Calendar for date selection */}
              <div className="mb-6">
                {renderEditModalCalendar()}
              </div>

              {/* Legend */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="font-semibold mb-3 text-sm">How to use:</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 border-2 border-red-500 rounded flex-shrink-0"></div>
                    <span><strong>Red dates:</strong> Currently blocked. Click to mark for removal.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded flex-shrink-0 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                    <span><strong>Green dates with ✓:</strong> Marked for removal (will become available for customers).</span>
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
                    {datesToRemove.sort().map(dateStr => {
                      // ✅ FIX: Parse date without timezone conversion
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
                  onClick={handleConfirmEdit}
                  disabled={datesToRemove.length === 0 || loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Processing..." : `Remove ${datesToRemove.length} Date(s) & Update`}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSlot(null);
                    setEditingSlotId(null);
                    setDatesToRemove([]);
                  }}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </div>

              {/* Info Alert */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Important:</strong> If you remove dates from the middle of a range, it will be split into multiple ranges. Removed dates will immediately become available for customer bookings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleAvailabilityCalendar;