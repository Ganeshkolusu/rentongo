import { BookingStatus } from "../store/booking.store"; // ✅ Shared status type
 
// 🚗 Available vehicle types
export type VehicleType = "Car" | "Auto" | "Bike";
 
// 📘 Booking data model
export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  vehicleType: VehicleType;
  price: number;
 
  // 📅 Timing info
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
 
  // 🧾 Status (linked to store)
  status: BookingStatus;
 
  // 👤 Optional customer info
  customerName?: string;
  contactNumber?: string;
 
  // 🕒 Optional meta
  bookingDate?: string;
  bookingTime?: string;
  createdAt?: string;
  updatedAt?: string;
 
  // 🔢 Optional model details
  modelNo?: string;
 
  // 📍 Locations
  pickupLocation?: string;
  dropLocation?: string;
}
 
 