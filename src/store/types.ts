export interface NotAvailabilitySlot {
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

export interface VehicleAvailabilityCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  VechileId: string;
  vehicleType: "Car" | "Bike" | "Auto";
  userId: string;
}