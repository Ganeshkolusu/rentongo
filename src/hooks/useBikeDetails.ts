// hooks/useBikeDetails.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.service";
import mapBikeData from "utils/mapBikeData";
import buildFormData from "utils/formDataBuilder";
import Enfield from "../assets/images/Enfield.png";
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

export type VehicleDetails = {
  name: string;
  price: string | number;
  rating: string;
  image: string;
  images?: string[];
  email: string;
  city?: string;
  street?: string;
  pincode?: string;
  doorName?: string;
  id?: string;
  bikenumber?: string;
  BikeNumber?: string;
  isAvailable?: boolean;
  requireDrivingLicense?: boolean;
  requireAadharCard?: boolean;
  depositMoney?: string;
  state?: string;
  country?: string;
  /** Saved pickup coordinates as strings; "" when the bike has none. */
  latitude?: string;
  longitude?: string;
  userId?: string;
  BikeModel?: string;
  contactName: string;
  contactNumber: string;
  description: string;
  engineCapacity?: string;
  transmission?: string;
  fuel?: string;
};

type HookArgs = {
  bikeId?: string;
  bikeData?: any;
  openEditForm?: boolean;
};

export default function useBikeDetails({ bikeId, bikeData, openEditForm }: HookArgs) {
  const navigate = useNavigate();

  const defaultVehicle: VehicleDetails = {
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

  const [editOpen, setEditOpen] = useState<boolean>(!!openEditForm);
  const [editVehicle, setEditVehicle] = useState<VehicleDetails>({ ...defaultVehicle });
  const [originalVehicle, setOriginalVehicle] = useState<VehicleDetails>({ ...defaultVehicle });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [bikeImage, setBikeImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [manualUserId, setManualUserId] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bikeId && !bikeData) {
      fetchBikeDetails(bikeId);
    } else if (bikeData) {
      const mapped = mapBikeData(bikeData);
      setEditVehicle(mapped);
      setOriginalVehicle(mapped);
      setPreview(mapped.image || null);
      setRemovedImages([]);
    }

    const storedUserId = localStorage.getItem("userId");
    if (storedUserId && !manualUserId) {
      setManualUserId(storedUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bikeId, bikeData]);

  const fetchBikeDetails = async (id: string) => {
    try {
      setIsFetching(true);
      const response = await apiService.bike.getBikeById(id);
      const data = response.data || response;
      const bike = data.bike || data;
      const mapped = mapBikeData(bike);
      setEditVehicle(mapped);
      setOriginalVehicle(mapped);
      setPreview(mapped.image || null);
      setRemovedImages([]);
    } catch (err) {
      console.error("fetchBikeDetails error", err);
      alert("Failed to load bike details");
    } finally {
      setIsFetching(false);
    }
  };

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

  const handleBikeImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setBikeImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setEditVehicle((prev) => ({ ...prev, image: objectUrl }));
    }
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 4 - additionalImages.length);
      setAdditionalImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const existingImages = (editVehicle.images || []).filter((url) => !removedImages.includes(url));

  const removeExistingImage = (url: string) => {
    setRemovedImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const carouselImages = existingImages.length > 0
    ? [...existingImages, ...additionalImages.map((img) => URL.createObjectURL(img))]
    : [preview || editVehicle.image || Enfield, ...additionalImages.map((img) => URL.createObjectURL(img))];

  const safeImageIndex = currentImageIndex < carouselImages.length ? currentImageIndex : 0;

  const prepareUserId = (): string | null => {
    let userId = manualUserId || localStorage.getItem("userId") || editVehicle.userId || null;
    if (!userId) {
      const possibleKeys = ["user", "userData", "currentUser", "authUser", "userInfo"];
      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            userId = parsed._id || parsed.id || parsed.userId || parsed.user_id || parsed.uid || userId;
          } catch (e) {
            if (stored && stored.length >= 10 && /^[a-f0-9]+$/i.test(stored)) {
              userId = stored;
            }
          }
          if (userId) break;
        }
      }
    }
    return userId;
  };

  const handleSave = async () => {
    const vehicleId = editVehicle.id || bikeId;
    if (!vehicleId) {
      alert("Bike ID missing — cannot update.");
      return;
    }

    const trimmedName = (editVehicle.name || "").trim();
    const trimmedPrice = ((editVehicle.price ?? "") as any).toString().trim();

    const pickupCoords = toPickupCoords(editVehicle.latitude, editVehicle.longitude);
    const street = (editVehicle.street || "").trim();
    const deposit = (editVehicle.depositMoney || "").toString().trim();

    const errors: Record<string, string> = {};
    if (!trimmedName) errors.name = "Bike name is required";
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
    if (!street) {
      errors.street = "Street/Area is required";
    } else if (street.length < 2) {
      errors.street = MSG.pickupArea;
    }
    if (!(editVehicle.pincode || "").trim()) {
      errors.pincode = "Pincode is required";
    } else if (!isValidPincode(editVehicle.pincode || "")) {
      errors.pincode = MSG.pincode;
    }
    if (!(editVehicle.state || "").trim()) errors.state = "State is required";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError();
      return;
    }

    setIsLoading(true);
    try {
      const userId = prepareUserId();
      if (!userId) {
        alert("User ID is missing. Please enter it manually in the form.");
        setIsLoading(false);
        return;
      }

      const nameParts = trimmedName.split(" ");
      const bikeName = nameParts[0] || trimmedName;
      const bikeModel = nameParts.slice(1).join(" ") || editVehicle.BikeModel || "";

      const formdata = buildFormData({
        userId,
        bikeName,
        bikeModel,
        bikeNumber: editVehicle.BikeNumber || "",
        pricePerKm: trimmedPrice,
        description: editVehicle.description || "",
        contactName: editVehicle.contactName.trim(),
        contactNumber: normalizeMobile(editVehicle.contactNumber),
        address: {
          pickupCity: (editVehicle.city || "").trim(),
          pickupArea: street,
          pickupCityPinCode: (editVehicle.pincode || "").trim(),
          pickupCityState: (editVehicle.state || "").trim(),
          pickupCityCountry: (editVehicle.country || "").trim() || "India",
        },
        requireDrivingLicense: !!editVehicle.requireDrivingLicense,
        requireAadharCard: !!editVehicle.requireAadharCard,
        depositMoney: editVehicle.depositMoney,
        latitude: pickupCoords.latitude.toString(),
        longitude: pickupCoords.longitude.toString(),
        insuranceNo: "0987654321",
        mainImage: bikeImage,
        additionalImages,
        removeImages: removedImages,
      });

      const response = await apiService.bike.updateBikeById(vehicleId, formdata);
      const result = response.data || response;

      if (result?.message?.toLowerCase().includes("updated") || result?.success || result?.bike) {
        alert("Bike updated successfully!");
        if (result.bike) {
          const mapped = mapBikeData(result.bike);
          setEditVehicle(mapped);
          setOriginalVehicle(mapped);
          setPreview(mapped.image || null);
        } else {
          await fetchBikeDetails(vehicleId);
        }
        setBikeImage(null);
        setAdditionalImages([]);
        setRemovedImages([]);
        navigate("/listed-bike", { state: { refresh: true } });
      } else {
        throw new Error(result?.message || "Update failed");
      }
    } catch (err: any) {
      console.error("Update Error:", err);
      const errorMsg = err?.response?.data?.message || err.message || "Unknown error occurred";
      alert(`Failed to update bike: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const vehicleId = editVehicle.id || bikeId;
    if (!vehicleId) {
      alert("Vehicle ID missing — cannot delete.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${editVehicle.name}"? This cannot be undone.`)) return;

    setIsLoading(true);
    try {
      const response = await apiService.bike.deleteBikeById(vehicleId);
      const data = response.data || response;
      if (data?.message?.toLowerCase().includes("deleted") || data?.success) {
        alert("Bike deleted successfully!");
        navigate("/listed-bikes", { state: { refresh: true } });
      } else {
        throw new Error(data?.message || "Delete failed");
      }
    } catch (err: any) {
      console.error("Delete Bike Error:", err);
      const errorMsg = err?.response?.data?.message || err.message || "Unknown error";
      alert(`Failed to delete bike: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    editOpen,
    setEditOpen,
    editVehicle,
    originalVehicle,
    isLoading,
    isFetching,
    preview,
    additionalImages,
    existingImages,
    removeExistingImage,
    bikeImage,
    currentImageIndex: safeImageIndex,
    setCurrentImageIndex,
    carouselImages,
    handleChange,
    handlePickupLocationChange,
    fieldErrors,
    handleBikeImageChange,
    handleAdditionalImagesChange,
    removeAdditionalImage,
    handleSave,
    handleDelete,
  };
}
