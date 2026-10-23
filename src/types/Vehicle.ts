export interface Vehicle {
  id: string;
  name?: string; // make optional
  Number?: string;
  bikeName?: string; // ✅ add this line
  price: number;
  transmission: string;
  fuel: string;
  seats?: number;
  location?: string;
  rating: number;
  available?: boolean;
  image: string;
  description?: string;
  model?: string;
  cc?: string;
  type?: "Car" | "Bike" | "Auto";
  contactName?: string;
  contactNumber?: string;
  bikeNumber?: string;
  distance?: string;
  ownerId?: string; // Owner's user ID for booking notifications
  unavailableDates?: { startDate: string; endDate: string; startTime: string; endTime: string }[];
}