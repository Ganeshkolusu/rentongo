
export interface OwnerCalendarProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: string;
    VechileId: string;
    vechileType: string;
    userId: string;
}

export interface BlockedRecord {
    id: string;
    from: string;
    to: string;
    fromTime: string;
    toTime: string;
    date?: string;
    type?: string; // "booking" | "notavailable"
    availabilityId?: string;
}
