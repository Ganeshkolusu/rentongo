import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.service";
import { VehicleDetails, defaultVehicle, mapCarData } from "../utils/mapCarData";
import type { PickupLocation } from "../components/PickupLocationPicker";
import {
  MSG,
  addressToFields,
  isNonNegativeNumber,
  isPositiveNumber,
  isValidContactName,
  isValidMobile,
  isValidPincode,
  normalizeMobile,
  scrollToFirstError,
  toPickupCoords,
} from "../utils/vehicleFormValidation";

export type VehicleWithImage = VehicleDetails & {
  carImages?: File | string;
};

export const useCarDetails = (carId?: string, carData?: any) => {
  const navigate = useNavigate();
  
  const [editVehicle, setEditVehicle] = useState<VehicleWithImage>({
    ...defaultVehicle,
    carImages: "",
  });
  
  const [originalVehicle, setOriginalVehicle] = useState<VehicleDetails>(defaultVehicle);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [carImage, setCarImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [manualUserId, setManualUserId] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchCarDetails = async (id: string) => {
    try {
      setIsFetching(true);
      console.log("📡 Fetching car details for ID:", id);
      
      const response = await apiService.car.getCarById(id);
      const data = response.data || response;
      
      console.log("📥 Received car data:", data);
      
      if (data && data.car) {
        updateVehicleData(data.car);
      } else if (data) {
        updateVehicleData(data);
      }
    } catch (error: any) {
      console.error("❌ Error fetching car details:", error);
      alert(`Failed to load car details: ${error.message || "Unknown error"}`);
    } finally {
      setIsFetching(false);
    }
  };

  const updateVehicleData = (car: any) => {
    const mapped = mapCarData(car);
    setEditVehicle(mapped);
    setOriginalVehicle(mapped);
    setPreview(mapped.image || null);
    setRemovedImages([]);
  };

  const existingImages = (editVehicle.images || []).filter((url) => !removedImages.includes(url));

  const removeExistingImage = (url: string) => {
    setRemovedImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  useEffect(() => {
    if (carId && !carData) {
      fetchCarDetails(carId);
    } else if (carData) {
      updateVehicleData(carData);
    }
    
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId && !manualUserId) {
      console.log("✅ Auto-loaded userId from localStorage:", storedUserId);
      setManualUserId(storedUserId);
    }
  }, [carId, carData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setEditVehicle((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditVehicle((prev) => ({ ...prev, [name]: value }));
    }
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  // The map pin is the only source of coordinates; the address is auto-filled from it.
  const handlePickupLocationChange = (loc: PickupLocation) => {
    const filled = addressToFields(loc.address, {
      state: "state",
      city: "city",
      area: "street",
      pincode: "pincode",
      country: "country",
    });
    setEditVehicle((prev) => ({
      ...prev,
      ...filled,
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString(),
    }));
    setFieldErrors((prev) => {
      const next = { ...prev, pickupLocation: "" };
      Object.keys(filled).forEach((key) => { next[key] = ""; });
      return next;
    });
  };

  const handleCarImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("📸 Selected main image:", file.name, file.size, "bytes");
      setCarImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setEditVehicle((prev) => ({ ...prev, image: objectUrl }));
    }
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 4 - additionalImages.length);
      console.log("📸 Selected additional images:", newImages.length);
      setAdditionalImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    console.log("🗑️ Removing additional image at index:", index);
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const vehicleId = editVehicle.id || carId;
    
    if (!vehicleId) {
      alert("❌ Vehicle ID missing — cannot update.");
      return;
    }

    const trimmedName = editVehicle.name?.trim();
    const trimmedPrice = (editVehicle.price ?? "").toString().trim();
    const pickupCoords = toPickupCoords(editVehicle.latitude, editVehicle.longitude);
    const street = (editVehicle.street || "").trim();
    const deposit = (editVehicle.depositMoney || "").toString().trim();

    const errors: Record<string, string> = {};
    if (!trimmedName) errors.name = "Vehicle name is required";
    if (!isPositiveNumber(trimmedPrice)) errors.price = "Valid price is required (must be greater than 0)";
    if (deposit && !isNonNegativeNumber(deposit)) errors.depositMoney = "Enter a valid deposit amount";

    if (!(editVehicle.contactName || "").trim()) {
      errors.contactName = "Contact name is required";
    } else if (!isValidContactName(editVehicle.contactName)) {
      errors.contactName = MSG.contactName;
    }
    if (!(editVehicle.contactNumber || "").trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (!isValidMobile(editVehicle.contactNumber)) {
      errors.contactNumber = MSG.mobile;
    }

    if (!pickupCoords) errors.pickupLocation = MSG.pickupLocation;
    if (!(editVehicle.city || "").trim()) errors.city = "City is required";
    if (!(editVehicle.state || "").trim()) errors.state = "State is required";
    if (!(editVehicle.pincode || "").trim()) {
      errors.pincode = "Pincode is required";
    } else if (!isValidPincode(editVehicle.pincode || "")) {
      errors.pincode = MSG.pincode;
    }
    if (!street) {
      errors.street = "Street/Area is required";
    } else if (street.length < 2) {
      errors.street = MSG.pickupArea;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError();
      return;
    }

    setIsLoading(true);

    try {
      let userId = manualUserId || localStorage.getItem('userId') || editVehicle.userId;
      
      if (!userId) {
        const possibleKeys = ["user", "userData", "currentUser", "authUser", "userInfo"];
        
        for (const key of possibleKeys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              userId = parsed._id || parsed.id || parsed.userId || parsed.user_id || parsed.uid;
              if (userId) {
                console.log(`✅ Retrieved userId from localStorage.${key}:`, userId);
                setManualUserId(userId);
                break;
              }
            } catch (e) {
              if (stored && stored.length >= 10 && /^[a-f0-9]+$/i.test(stored)) {
                userId = stored;
                console.log(`✅ Retrieved userId directly from localStorage.${key}:`, userId);
                setManualUserId(userId);
                break;
              }
            }
          }
        }
      }
      
      if (!userId) {
        console.error("❌ userId not found");
        alert("❌ User ID is missing. Please enter it manually in the form.");
        return;
      }
      
      console.log("✅ Using userId:", userId);

      const CarName = trimmedName;
      const CarModel = editVehicle.CarModel?.trim() || "Standard";

      const formdata = new FormData();

      // User & Car Identity
      formdata.append("userId", userId);
      formdata.append("CarName", CarName);
      formdata.append("CarModel", CarModel);
      
      if (editVehicle.CarNumber && editVehicle.CarNumber.trim()) {
        formdata.append("CarNumber", editVehicle.CarNumber.trim());
      }
      
      // Car Specifications
      const seatsValue = (editVehicle.seats ?? "5").toString().replace(/[^\d]/g, "") || "5";
      formdata.append("Carseater", seatsValue);
      
      const fuelType = editVehicle.fuel.toLowerCase();
      const transmissionType = editVehicle.transmission.toLowerCase();
      
      formdata.append("fuelType", fuelType);
      formdata.append("transmissionType", transmissionType);
      formdata.append("Ac_available", editVehicle.ac?.toLowerCase() === "ac" ? "true" : "false");
      
      // Pricing
      const rentPerHour = trimmedPrice;
      const rentPerDay = (Number(rentPerHour) * 24).toString();
      
      formdata.append("RentPerHour", rentPerHour);
      formdata.append("RentPerDay", rentPerDay);
      
      // Contact & Description
      formdata.append("description", editVehicle.description || "No description provided");
      formdata.append("contactName", editVehicle.contactName.trim());
      formdata.append("contactNumber", normalizeMobile(editVehicle.contactNumber));
      
      // Additional Car Details
      formdata.append("gps", "false");
      formdata.append("kmDriven", "50000");
      formdata.append("Available", editVehicle.isAvailable ? "true" : "false");

      // Location (validated above: pin and address are always present here)
      formdata.append("pickupCity", (editVehicle.city || "").trim());
      formdata.append("pickupArea", street);
      formdata.append("pickupCityPinCode", (editVehicle.pincode || "").trim());
      formdata.append("pickupCityState", (editVehicle.state || "").trim());
      formdata.append("pickupCityCountry", (editVehicle.country || "").trim() || "India");
      formdata.append("pickupLatitude", pickupCoords.latitude.toString());
      formdata.append("pickupLongitude", pickupCoords.longitude.toString());

      // Document Requirements
      formdata.append("drivingLicenseRequired", editVehicle.requireDrivingLicense ? "true" : "false");
      formdata.append("AadharCardRequired", editVehicle.requireAadharCard ? "true" : "false");
      
      // Deposit
      if (editVehicle.depositMoney && editVehicle.depositMoney !== "0" && Number(editVehicle.depositMoney) > 0) {
        formdata.append("DepositAmount", editVehicle.depositMoney);
        formdata.append("DepositVehicle", "true");
      } else {
        formdata.append("DepositVehicle", "false");
      }

      // Images
      if (carImage instanceof File) {
        formdata.append("carImages", carImage);
      }
      
      if (additionalImages.length > 0) {
        additionalImages.forEach((img) => {
          formdata.append("carImages", img);
        });
      }

      if (removedImages.length > 0) {
        formdata.append("removeImages", JSON.stringify(removedImages));
      }

      const response = await apiService.car.updateCarById(vehicleId, formdata);
      const result = response.data || response;
      
      if (result?.message?.toLowerCase().includes("updated") || result?.success || result?.car) {
        alert("✅ Car updated successfully!");
        
        if (result.car) {
          updateVehicleData(result.car);
        } else {
          await fetchCarDetails(vehicleId);
        }
        
        setCarImage(null);
        setAdditionalImages([]);
        
        navigate("/listed", { state: { refresh: true } });
      } else {
        throw new Error(result?.message || "Update failed - no success confirmation received");
      }
    } catch (error: any) {
      console.error("❌ Update Error:", error);
      
      const errorMsg = error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message ||
                      "Unknown error occurred";
      
      const errorDetails = error.response?.data?.details || "";
      
      alert(
        `❌ Failed to update car:\n\n${errorMsg}\n${errorDetails ? '\n' + errorDetails : ''}\n\n` +
        `Please check:\n` +
        `• All required fields are filled\n` +
        `• Contact number is valid (10+ digits)\n` +
        `• You have permission to edit this car\n` +
        `• Image files are not too large (< 5MB each)`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const vehicleId = editVehicle.id || carId;
    
    if (!vehicleId) {
      alert("❌ Vehicle ID missing — cannot delete.");
      return;
    }
    
    if (!window.confirm(`⚠️ Are you sure you want to delete "${editVehicle.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiService.car.deleteCarById(vehicleId);
      const data = response.data || response;
      
      if (data?.message?.toLowerCase().includes("deleted") || data?.success) {
        alert("✅ Car deleted successfully!");
        navigate("/listed", { state: { refresh: true } });
      } else {
        throw new Error(data?.message || "Delete failed");
      }
    } catch (error: any) {
      console.error("❌ Delete Car Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert(`❌ Failed to delete car: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editVehicle,
    setEditVehicle,
    isLoading,
    isFetching,
    carImage,
    
    preview,
    additionalImages,
    existingImages,
    removeExistingImage,
    handleChange,
    handlePickupLocationChange,
    fieldErrors,
    handleCarImageChange,
    handleAdditionalImagesChange,
    removeAdditionalImage,
    handleSave,
    handleDelete,
  };
};