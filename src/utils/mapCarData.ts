import BlackCar from "../assets/images/BlackCar.png";

export interface VehicleDetails {
  name: string;
  price: string | number;
  rating: string;
  transmission: string;
  seats: string;
  fuel: string;
  ac: string;
  image: string;
  images?: string[];
  email: string;
  city?: string;
  street?: string;
  pincode?: string;
  doorName?: string;
  id?: string;
  isAvailable?: boolean;
  requireDrivingLicense?: boolean;
  requireAadharCard?: boolean;
  depositMoney?: string;
  state?: string;
  country?: string;
  /** Saved pickup coordinates as strings; "" when the car has none. */
  latitude?: string;
  longitude?: string;
  userId?: string;
  CarModel?: string;
  CarNumber?: string;
  contactName: string;
  contactNumber: string;
  description: string;
}

export const defaultVehicle: VehicleDetails = {
  name: "Hyundai Verna",
  CarModel: "Thar",
  CarNumber: "",
  price: "250",
  rating: "4.2",
  transmission: "Automatic",
  seats: "5",
  fuel: "Petrol",
  ac: "AC",
  image: BlackCar,
  description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  contactName: "Manoj Kumar",
  contactNumber: "1234567898",
  email: "owner@example.com",
  city: "",
  street: "",
  pincode: "",
  doorName: "",
  country: "",
  latitude: "",
  longitude: "",
  isAvailable: true,
};

export const mapCarData = (car: any): VehicleDetails => {
  console.log("🗺️ Mapping car data:", car);
  
  const mapped: VehicleDetails = {
    ...defaultVehicle,
    name: `${car.CarName || car.name || ""} ${car.CarModel || car.model || ""}`.trim(),
    CarNumber: car.CarNumber || car.carNumber || "",
    price: car.RentPerHour ?? car.price ?? defaultVehicle.price,
    CarModel: car.CarModel || defaultVehicle.CarModel,
    rating: car.rating?.toString?.() || defaultVehicle.rating,
    transmission: car.transmissionType || car.transmission || defaultVehicle.transmission,
    seats: car.Carseater?.toString() || car.seats || defaultVehicle.seats,
    fuel: car.fuelType || car.fuel || defaultVehicle.fuel,
    ac: car.Ac_available ? "AC" : (car.ac || defaultVehicle.ac),
    image: car.carImages?.[0] || car.image || defaultVehicle.image,
    images: Array.isArray(car.carImages) ? car.carImages : [],
    description: car.description || defaultVehicle.description,
    contactName: car.contactName || defaultVehicle.contactName,
    contactNumber: car.contactNumber || defaultVehicle.contactNumber,
    email: car.email || defaultVehicle.email,
    id: car._id || car.id || undefined,
    userId: car.userId || car.user_id || undefined,
    isAvailable: car.Available !== false && car.isAvailable !== false,
    city: car.pickupCity || "",
    street: car.pickupArea || "",
    pincode: car.pickupCityPinCode || "",
    state: car.pickupCityState || "",
    country: car.pickupCityCountry || "",
    latitude: car.pickupLatitude != null ? car.pickupLatitude.toString() : "",
    longitude: car.pickupLongitude != null ? car.pickupLongitude.toString() : "",
    doorName: car.doorName || "",
    requireDrivingLicense: car.drivingLicenseRequired === true,
    requireAadharCard: car.AadharCardRequired === true,
    depositMoney: car.DepositAmount?.toString() || "",
  };
  
  console.log("✅ Mapped vehicle data:", mapped);
  return mapped;
};