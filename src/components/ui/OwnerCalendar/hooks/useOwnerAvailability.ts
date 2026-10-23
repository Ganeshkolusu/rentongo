
import { useState, useCallback, useEffect } from "react";
import { ownerAvailabilityAPI } from "../api/ownerAvailability.api";
import { BlockedRecord } from "../types";

export const useOwnerAvailability = (
    isOpen: boolean,
    VechileId: string,
    vechileType: string,
    userId: string
) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedStart, setSelectedStart] = useState<Date | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showBlockedDates, setShowBlockedDates] = useState(false);
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState("00:00");
    const [endTime, setEndTime] = useState("23:59");

    const [ownerBlockedDates, setOwnerBlockedDates] = useState<string[]>([]);
    const [customerBookedDates, setCustomerBookedDates] = useState<string[]>([]);
    const [blockedRecords, setBlockedRecords] = useState<BlockedRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<BlockedRecord | null>(null);
    const [clickedBlockRecord, setClickedBlockRecord] = useState<BlockedRecord | null>(null);

    const formatDate = (date: Date | null): string => {
        if (!date) return "";
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const showMsg = (type: string, text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    };

    const fetchNotAvailability = useCallback(async () => {
        try {
            setLoading(true);
            const startDate = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
            const endDate = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0));

            const data = await ownerAvailabilityAPI.getVehicleAvailability(VechileId, vechileType, startDate, endDate);

            console.log("=== GET VEHICLE AVAILABILITY ===", JSON.stringify(data, null, 2));

            if (data && Array.isArray(data.availability)) {
                const ownerDates: string[] = [];
                const customerDates: string[] = [];
                const records: BlockedRecord[] = [];

                data.availability.forEach((item: any) => {
                    if (item.status === "Unavailable") {
                        item.slots.forEach((slot: any) => {
                            const slotType = slot.type?.toLowerCase();

                            if (slotType === "notavailable") {
                                if (!ownerDates.includes(item.date)) {
                                    ownerDates.push(item.date);
                                }
                                records.push({
                                    id: slot.id,
                                    from: item.date,
                                    to: item.date,
                                    fromTime: slot.fromTime ?? "00:00",
                                    toTime: slot.toTime ?? "23:59",
                                    date: item.date,
                                    type: "notavailable"
                                });
                            } else if (slotType === "booking") {
                                if (!customerDates.includes(item.date)) {
                                    customerDates.push(item.date);
                                }
                                records.push({
                                    id: slot.id,
                                    from: item.date,
                                    to: item.date,
                                    fromTime: slot.fromTime ?? "00:00",
                                    toTime: slot.toTime ?? "23:59",
                                    date: item.date,
                                    type: "booking"
                                });
                            }
                        });
                    }
                });

                setOwnerBlockedDates(ownerDates);
                setCustomerBookedDates(customerDates);
                setBlockedRecords(records);
            }
        } catch (error) {
            console.error("Error fetching availability:", error);
            showMsg("error", "Failed to load availability");
        } finally {
            setLoading(false);
        }
    }, [currentMonth, VechileId, vechileType]);

    useEffect(() => {
        if (isOpen) {
            fetchNotAvailability();
        }
    }, [isOpen, fetchNotAvailability]);

    const handleDateClick = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return;

        const d = formatDate(date);

        if (customerBookedDates.includes(d)) {
            const record = blockedRecords.find(r => r.type === "booking" && d >= r.from && d <= r.to);
            if (record) {
                setClickedBlockRecord(record);
            } else {
                showMsg("error", "Cannot modify customer bookings");
            }
            return;
        }

        const isOwnerBlocked = () => {
            if (selectedRecord && d >= selectedRecord.from && d <= selectedRecord.to) return false;
            return ownerBlockedDates.includes(d);
        };

        if (isOwnerBlocked()) {
            const record = blockedRecords.find(r => r.type === "notavailable" && d >= r.from && d <= r.to);
            if (record) setClickedBlockRecord(record);
            return;
        }

        if (!selectedStart) {
            setSelectedStart(date);
            setSelectedEnd(null);
            setSelectedRecord(null);
        } else if (!selectedEnd) {
            if (date < selectedStart) {
                showMsg("error", "End date must be after start");
                return;
            }
            setSelectedEnd(date);
        } else {
            setSelectedStart(date);
            setSelectedEnd(null);
            setSelectedRecord(null);
        }
    };

    const handleCreateBlock = async () => {
        if (!selectedStart || !selectedEnd) return;
        try {
            setLoading(true);
            const body = new URLSearchParams();
            body.append("userId", userId);
            body.append("fromDate", formatDate(selectedStart) + "T00:00:00.000Z");
            body.append("toDate", formatDate(selectedEnd) + "T23:59:59.000Z");
            body.append("fromTime", startTime);
            body.append("toTime", endTime);
            body.append("vechileType", vechileType);
            body.append("VechileId", VechileId);
            body.append("isNotAvailable", "false"); // Logic copied from original: "isNotAvailable" sent as string. Wait, original said "isNotAvailable", "false"? Let's check original.
            // Original code line 215: body.append("isNotAvailable", "false"); 
            // Wait, that seems odd for creating a BLOCK. Usually blocks are isNotAvailable=true.
            // Line 215 in step 274: body.append("isNotAvailable", "false");
            // But line 257 updateNotAvailability sends "true".
            // Let's check CustomerCalender blocking logic. blockDatesAsUnavailable sends "true".
            // Maybe "false" means "I am NOT AVAILABLE"? Or is it a bug in original code?
            // I will copy it AS IS to avoid breaking behavior, but I'll add a comment.
            // Actually, looking at previous diffs, user might have changed it or it's Legacy.
            // In Step 240 diff, he added logic.
            // Let's check the original file content again.
            // Line 215: body.append("isNotAvailable", "false"); 
            // I will persist this exact behavior.

            const result = await ownerAvailabilityAPI.createNotAvailability(body);

            if (result.ok) {
                showMsg("success", "Dates blocked successfully!");
                await fetchNotAvailability();
                setSelectedStart(null);
                setSelectedEnd(null);
            } else {
                showMsg("error", result.data.message || "Failed to block dates");
            }
        } catch (error) {
            console.error("Error creating block:", error);
            showMsg("error", "Failed to block dates");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBlock = async () => {
        if (!selectedRecord || !selectedStart || !selectedEnd) return;

        if (selectedRecord.type === "booking") {
            showMsg("error", "Cannot edit customer bookings");
            return;
        }

        try {
            setLoading(true);
            const body = new URLSearchParams();
            body.append("fromDate", formatDate(selectedStart) + "T00:00:00.000Z");
            body.append("toDate", formatDate(selectedEnd) + "T23:59:59.000Z");
            body.append("fromTime", startTime);
            body.append("toTime", endTime);
            body.append("vechileType", vechileType);
            body.append("VechileId", VechileId);
            body.append("isNotAvailable", "true");

            const result = await ownerAvailabilityAPI.updateNotAvailability(selectedRecord.id, body);

            if (result.ok) {
                showMsg("success", "Block updated successfully!");
                await fetchNotAvailability();
                setSelectedStart(null);
                setSelectedEnd(null);
                setSelectedRecord(null);
            } else {
                showMsg("error", result.data.message || "Failed to update block");
            }
        } catch (error) {
            console.error("Error updating block:", error);
            showMsg("error", "Failed to update block");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBlock = async (recordId: string, recordType?: string) => {
        if (!recordId) return showMsg("error", "Invalid record ID");
        if (recordType === "booking") {
            showMsg("error", "Cannot delete customer bookings. Customers must cancel their own bookings.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this blocked date?")) return;

        try {
            setLoading(true);
            const result = await ownerAvailabilityAPI.deleteNotAvailability(recordId);

            if (result.ok || result.status === 204) {
                showMsg("success", "Block removed successfully!");
                await fetchNotAvailability();
                setShowBlockedDates(false);
                setClickedBlockRecord(null); // Also clear clicked record if open
            } else {
                showMsg("error", result.data?.message || "Failed to delete block");
            }
        } catch (error) {
            console.error("Error deleting block:", error);
            showMsg("error", "Failed to delete block");
        } finally {
            setLoading(false);
        }
    };

    return {
        state: {
            currentMonth,
            selectedStart,
            selectedEnd,
            message,
            showBlockedDates,
            loading,
            startTime,
            endTime,
            ownerBlockedDates,
            customerBookedDates,
            blockedRecords,
            selectedRecord,
            clickedBlockRecord
        },
        actions: {
            setCurrentMonth,
            setSelectedStart,
            setSelectedEnd,
            setStartTime,
            setEndTime,
            setShowBlockedDates,
            setClickedBlockRecord,
            setSelectedRecord,
            handleDateClick,
            handleCreateBlock,
            handleUpdateBlock,
            handleDeleteBlock,
            handleEditBlock: (record: BlockedRecord) => {
                if (record.type === "booking") {
                    showMsg("error", "Cannot edit customer bookings");
                    return;
                }
                setSelectedRecord(record);
                setSelectedStart(new Date(record.from));
                setSelectedEnd(new Date(record.to));
                setStartTime(record.fromTime);
                setEndTime(record.toTime);
                setShowBlockedDates(false);
            },
            formatDate
        }
    };
};
