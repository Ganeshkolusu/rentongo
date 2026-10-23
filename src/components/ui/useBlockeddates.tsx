import { useState } from "react";
import { NotAvailabilitySlot } from "../../store/types";

export const useBlockedDates = (
  VechileId: string,
  vehicleType: string,
  userId: string
) => {
  const [blockedSlots, setBlockedSlots] = useState<NotAvailabilitySlot[]>([]);

  // STORAGE HELPERS
  const loadBlockedDatesFromStorage = () => {
    const stored = localStorage.getItem("blocked_slots_" + VechileId);
    if (stored) {
      setBlockedSlots(JSON.parse(stored));
    }
  };

  const saveBlockedDatesToStorage = (slots: NotAvailabilitySlot[]) => {
    localStorage.setItem("blocked_slots_" + VechileId, JSON.stringify(slots));
  };

  // API CREATE BLOCKED SLOT
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
      body.append("isCustomerBooking", "false");

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
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      if (res.ok && result.data) return result.data;
      throw new Error(result.message || "Failed to create slot");
    } catch (e: any) {
      console.error("❌ API Error:", e);
      throw e;
    }
  };

  // API UPDATE BLOCKED SLOT
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

  // API DELETE BLOCKED SLOT
  const deleteBlockedDateAPI = async (slotId: string) => {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🗑️ OWNER DELETING BLOCKED DATES");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🆔 Slot ID:", slotId);

      const urlencoded = new URLSearchParams();
      const res = await fetch(
        `https://api.rentongovehicle.com/deleteNotAvailability/${slotId}`,
        { method: "DELETE", body: urlencoded }
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

  return {
    blockedSlots,
    setBlockedSlots,
    createBlockedDatesAPI,
    updateBlockedDatesAPI,
    deleteBlockedDateAPI,
    loadBlockedDatesFromStorage,
    saveBlockedDatesToStorage,
  };
};