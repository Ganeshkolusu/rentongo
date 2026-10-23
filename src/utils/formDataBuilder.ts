// utils/formDataBuilder.ts
type BuilderArgs = {
  userId: string;
  bikeName: string;
  bikeModel: string;
  bikeNumber?: string;
  pricePerKm: string;
  description?: string;
  contactName?: string;
  contactNumber?: string;
  address?: {
    pickupCity?: string;
    pickupArea?: string;
    pickupCityPinCode?: string;
    pickupCityState?: string;
    pickupCityCountry?: string;
  };
  requireDrivingLicense?: boolean;
  requireAadharCard?: boolean;
  depositMoney?: string;
  /** Required: the pickup pin chosen on the map. */
  latitude: string;
  longitude: string;
  insuranceNo?: string;
  mainImage?: File | null;
  additionalImages?: File[];
  removeImages?: string[];
};

export default function buildFormData(args: BuilderArgs) {
  const fd = new FormData();
  fd.append("userId", args.userId);
  fd.append("bikeName", args.bikeName);
  fd.append("bikeModel", args.bikeModel);
  fd.append("bikeNumber", args.bikeNumber || "");
  fd.append("pricePerKm", args.pricePerKm);
  if (args.description) fd.append("description", args.description);
  if (args.contactName) fd.append("contactName", args.contactName);
  if (args.contactNumber) fd.append("contactNumber", args.contactNumber);

  if (args.address) {
    const { pickupCity, pickupArea, pickupCityPinCode, pickupCityState, pickupCityCountry } = args.address;
    if (pickupCity) fd.append("pickupCity", pickupCity);
    if (pickupArea) fd.append("pickupArea", pickupArea);
    if (pickupCityPinCode) fd.append("pickupCityPinCode", pickupCityPinCode);
    if (pickupCityState) fd.append("pickupCityState", pickupCityState);
    if (pickupCityCountry) fd.append("pickupCityCountry", pickupCityCountry);
  }

  // No fallback coordinates: callers must validate that the pin is set.
  if (args.latitude) fd.append("latitude", args.latitude);
  if (args.longitude) fd.append("longitude", args.longitude);
  fd.append("InsuranceNo", args.insuranceNo || "0987654321");

  if (args.requireDrivingLicense) fd.append("drivingLicenseRequired", "true");
  if (args.requireAadharCard) fd.append("AadharCardRequired", "true");
  if (args.depositMoney && args.depositMoney !== "0") fd.append("DepositAmount", args.depositMoney);

  if (args.mainImage) fd.append("bikeImages", args.mainImage);
  if (args.additionalImages && args.additionalImages.length) {
    args.additionalImages.forEach((img) => fd.append("bikeImages", img));
  }
  if (args.removeImages && args.removeImages.length) {
    fd.append("removeImages", JSON.stringify(args.removeImages));
  }

  return fd;
}
