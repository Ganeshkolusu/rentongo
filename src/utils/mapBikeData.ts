// utils/mapBikeData.ts
import Enfield from "../assets/images/Enfield.png";

export default function mapBikeData(bike: any) {
  const defaultVehicle = {
    name: "Royal Enfield Classic 350",
    BikeModel: "BS6",
    price: "10",
    rating: "4.5",
    image: Enfield,
    description: "Well-maintained bike for rent",
    contactName: "Owner Name",
    contactNumber: "1234567890",
    email: "owner@example.com",
    city: "",
    street: "",
    pincode: "",
    doorName: "",
    isAvailable: true,
    engineCapacity: "350",
    transmission: "Manual",
    fuel: "Petrol",
  };

  const mapped = {
    ...defaultVehicle,
    name: `${bike?.bikeName || bike?.name || ""} ${bike?.bikeModel || bike?.BikeModel || bike?.model || ""}`.trim(),
    bikenumber: bike?.bikeNumber || "",
    BikeNumber: bike?.bikeNumber || "",
    BikeModel: bike?.bikeModel || bike?.model || "",
    price: bike?.pricePerKm ?? bike?.price ?? defaultVehicle.price,
    rating: bike?.rating?.toString?.() || defaultVehicle.rating,
    image: bike?.bikeImages?.[0] || bike?.image || defaultVehicle.image,
    images: Array.isArray(bike?.bikeImages) ? bike.bikeImages : [],
    description: bike?.description || defaultVehicle.description,
    contactName: bike?.contactName || defaultVehicle.contactName,
    contactNumber: bike?.contactNumber || defaultVehicle.contactNumber,
    email: bike?.email || defaultVehicle.email,
    id: bike?._id || bike?.id || undefined,
    userId: bike?.userId || bike?.user_id || undefined,
    isAvailable: bike?.Available !== false && bike?.isAvailable !== false,
    city: bike?.pickupCity || bike?.city || "",
    street: bike?.pickupArea || bike?.street || "",
    pincode: bike?.pickupCityPinCode || bike?.pincode || "",
    state: bike?.pickupCityState || bike?.state || "",
    country: bike?.pickupCityCountry || bike?.country || "India",
    // Saved pickup coordinates; "" when the bike has none (never a fallback point).
    latitude: bike?.latitude != null ? bike.latitude.toString() : "",
    longitude: bike?.longitude != null ? bike.longitude.toString() : "",
    requireDrivingLicense: bike?.drivingLicenseRequired === "true" || bike?.drivingLicenseRequired === true,
    requireAadharCard: bike?.AadharCardRequired === "true" || bike?.AadharCardRequired === true,
    depositMoney: bike?.DepositAmount?.toString() || "",
    engineCapacity: bike?.engineCapacity || "350",
    transmission: bike?.transmission || "Manual",
    fuel: bike?.fuel || "Petrol",
  };

  return mapped;
}
