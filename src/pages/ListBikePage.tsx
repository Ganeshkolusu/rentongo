import React, { useEffect, useRef, useState } from "react";
import { Loader, Plus, X, ChevronDown } from "lucide-react";
import bikeDataJSON from "./data/bikeData.json";
import apiService from "../services/api.service";
import PickupLocationPicker, { PickupLocation } from "../components/PickupLocationPicker";
import {
  MSG,
  addressToFields,
  cleanVehicleText,
  isNonNegativeNumber,
  isPositiveNumber,
  isValidContactName,
  isValidMobile,
  isValidManufacturingYear,
  isValidPincode,
  isValidVehicleText,
  MIN_MANUFACTURING_YEAR,
  normalizeMobile,
  scrollToFirstError,
  toPickupCoords,
} from "../utils/vehicleFormValidation";

// Typeable Dropdown Component
interface TypeableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
}
const TypeableDropdown: React.FC<TypeableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!options.includes(inputValue)) {
          setInputValue(value);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    const exactMatch = options.find(opt => opt.toLowerCase() === newValue.toLowerCase());
    if (exactMatch) {
      onChange(exactMatch);
    }
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setInputValue(option);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (!disabled) setIsOpen(true);
  };

  const handleDropdownClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className={`w-full flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-text"}`}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder || ""}
          disabled={disabled}
          required={required}
          className={`flex-1 px-4 py-3 outline-none rounded-lg ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        />
        <button type="button" onClick={handleDropdownClick} disabled={disabled} className="px-3 py-3">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden top-full">
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-3 cursor-pointer transition ${option === value ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"}`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ListBikePage = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
const bikeNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$/i;
  const [bikeNumberError, setBikeNumberError] = useState("");
  const getUserId = () => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId && storedUserId.length === 24 && /^[a-f0-9]{24}$/i.test(storedUserId)) {
      return storedUserId;
    }
    return "";
  };

  const [formData, setFormData] = useState({
    userId: getUserId(),
    bikeBrand: "", bikeModel: "", bikeNumber: "", bikeEngine: "",
    bikeYear: "", fuel: "", transmission: "",
    pricePerKm: "", kmDriven: "", description: "",
    photoFront: null as File | null,
    photoBack: null as File | null,
    photoLeft: null as File | null,
    photoRight: null as File | null,
    photoInterior: null as File | null,
    contactName: "", contactNumber: "", insuranceNo: "",
    pickupArea: "", pickupCity: "", pickupCityState: "",
    pickupCityPinCode: "", pickupCityCountry: "",
    latitude: "", longitude: "",
    drivingLicense: false, aadharCard: false, depositVehicle: false,
    depositMoney: "0", gps: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fuelTypes = bikeDataJSON.fuelTypes;
  const transmissionOptions = bikeDataJSON.transmissionTypes;

  // Brand, model and year are typed freely: new vehicles launch every year, so no fixed list.
  const vehicleNameFields = [
    { name: "bikeBrand", label: "Bike Brand", maxLength: 50, numeric: false },
    { name: "bikeModel", label: "Bike Model", maxLength: 50, numeric: false },
    { name: "bikeYear", label: "Manufacturing Year", maxLength: 4, numeric: true },
  ] as const;

  const typeableFields = [
    { name: "fuel", label: "Fuel Type", options: fuelTypes, placeholder: "Type fuel type..." },
    { name: "transmission", label: "Transmission", options: transmissionOptions, placeholder: "Type transmission..." },
  ];

  const textFields = [
    { name: "bikeNumber", label: "Bike Number", placeholder: "AP12AB1234" },
    { name: "bikeEngine", label: "Engine Capacity (CC)", placeholder: "350" },
    { name: "kmDriven", label: "KM Driven", placeholder: "15000" },
    { name: "pricePerKm", label: "Price (per km) (₹)", type: "number", placeholder: "250" },
  ];

  const contactFields = [
    { name: "contactName", label: "Name", placeholder: "John Doe" },
    { name: "contactNumber", label: "Contact Number", placeholder: "9876543210", pattern: "[0-9]{10}" },
  ];

  const addressFields = [
    { name: "pickupCityState", label: "State", placeholder: "Enter state" },
    { name: "pickupCity", label: "City", placeholder: "Enter city" },
    { name: "pickupArea", label: "Street/Area", placeholder: "" },
    { name: "pickupCityPinCode", label: "Zip/Pincode", placeholder: "500001" },
    { name: "pickupCityCountry", label: "Country", placeholder: "India", fullWidth: true },
  ];
  const checkboxes = [
    { name: "drivingLicense", label: "Driving License Required" },
    { name: "aadharCard", label: "Aadhar Card Required" },
    { name: "depositVehicle", label: "Deposit Vehicle Required" },
    { name: "gps", label: "GPS Tracking Available" },
  ];

  const pickupCoords = toPickupCoords(formData.latitude, formData.longitude);

  // The map pin is the only source of coordinates; the address is auto-filled from it.
  const handlePickupLocationChange = (loc: PickupLocation) => {
    const filled = addressToFields(loc.address, {
      state: "pickupCityState",
      city: "pickupCity",
      area: "pickupArea",
      pincode: "pickupCityPinCode",
      country: "pickupCityCountry",
    });
    setFormData((prev) => ({
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

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
   const handleBikeNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setFormData((prev) => ({ ...prev, bikeNumber: value }));
      if (!bikeNumberRegex.test(value)) {
        setBikeNumberError("Invalid format, e.g., AP12AB1234");
      } else {
        setBikeNumberError("");
      }
    };


  const handleTypeableChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSinglePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoKey: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, [photoKey]: e.target.files![0] }));
      setFieldErrors((prev) => ({ ...prev, [photoKey]: "" }));
    }
  };

  const removeSinglePhoto = (photoKey: string) => {
    setFormData((prev) => ({ ...prev, [photoKey]: null }));
  };

  const photoFields = [
    { key: "photoFront", label: "Front View" },
    { key: "photoBack", label: "Back View" },
    { key: "photoLeft", label: "Left Side" },
    { key: "photoRight", label: "Right Side" },
    { key: "photoInterior", label: "Interior/Dashboard" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields and collect errors
    const errors: Record<string, string> = {};

    // Vehicle details validation
    if (!cleanVehicleText(formData.bikeBrand)) errors.bikeBrand = "Bike brand is required";
    else if (!isValidVehicleText(formData.bikeBrand)) errors.bikeBrand = "Enter a valid bike brand (2-50 letters/numbers)";
    if (!cleanVehicleText(formData.bikeModel)) errors.bikeModel = "Bike model is required";
    else if (!isValidVehicleText(formData.bikeModel)) errors.bikeModel = "Enter a valid bike model (2-50 letters/numbers)";
    if (!formData.bikeYear.trim()) errors.bikeYear = "Manufacturing year is required";
    else if (!isValidManufacturingYear(formData.bikeYear))
      errors.bikeYear = `Enter a valid year (${MIN_MANUFACTURING_YEAR}-${new Date().getFullYear() + 1})`;

    if (!formData.fuel) errors.fuel = "Fuel type is required";
    if (!formData.transmission) errors.transmission = "Transmission type is required";
    if (!formData.bikeNumber) {
      errors.bikeNumber = "Bike number is required";
    } else if (!bikeNumberRegex.test(formData.bikeNumber.toUpperCase())) {
      errors.bikeNumber = "Invalid format, e.g., AP12AB1234";
    }
   
    if (!formData.bikeEngine) errors.bikeEngine = "Engine capacity is required";
    if (!formData.kmDriven.trim()) {
      errors.kmDriven = "KM driven is required";
    } else if (!isNonNegativeNumber(formData.kmDriven)) {
      errors.kmDriven = "Enter a valid KM driven (0 or more)";
    }
    if (!isPositiveNumber(formData.pricePerKm)) {
      errors.pricePerKm = "Valid price per km is required (greater than 0)";
    }
    if (formData.depositVehicle && formData.depositMoney.trim() && !isNonNegativeNumber(formData.depositMoney)) {
      errors.depositMoney = "Enter a valid deposit amount";
    }

    // Contact validation
    if (!formData.contactName.trim()) {
      errors.contactName = "Contact name is required";
    } else if (!isValidContactName(formData.contactName)) {
      errors.contactName = MSG.contactName;
    }
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (!isValidMobile(formData.contactNumber)) {
      errors.contactNumber = MSG.mobile;
    }

    // Address validation
    if (!toPickupCoords(formData.latitude, formData.longitude)) {
      errors.pickupLocation = MSG.pickupLocation;
    }
    if (!formData.pickupCityState.trim()) errors.pickupCityState = "State is required";
    if (!formData.pickupCity.trim()) errors.pickupCity = "City is required";
    if (!formData.pickupArea.trim()) {
      errors.pickupArea = "Street/Area is required";
    } else if (formData.pickupArea.trim().length < 2) {
      errors.pickupArea = MSG.pickupArea;
    }
    if (!formData.pickupCityPinCode.trim()) {
      errors.pickupCityPinCode = "Pincode is required";
    } else if (!isValidPincode(formData.pickupCityPinCode)) {
      errors.pickupCityPinCode = MSG.pincode;
    }
    if (!formData.pickupCityCountry.trim()) errors.pickupCityCountry = "Country is required";

    // Photo validation - at least one photo required
    const hasAtLeastOnePhoto = formData.photoFront || formData.photoBack || formData.photoLeft || formData.photoRight || formData.photoInterior;
    if (!hasAtLeastOnePhoto) {
      errors.photoFront = "At least one photo is required";
    }

    // Checkbox required validation
    if (!formData.aadharCard) {
      errors.aadharCard = "Aadhar Card is required";
    }
    if (!formData.drivingLicense) {
      errors.drivingLicense = "Driving License is required";
    }
    if (!formData.depositVehicle) {
      errors.depositVehicle = "Deposit Vehicle is required";
    }

    // Set errors and return if any
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Scroll to first error
      scrollToFirstError();
      return;
    }

    if (!formData.userId || formData.userId.length !== 24 || !/^[a-f0-9]{24}$/i.test(formData.userId)) {
      alert("Invalid user ID format. Please log in again."); return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    const bikeFullName = `${cleanVehicleText(formData.bikeBrand)} ${cleanVehicleText(formData.bikeModel)}`;
    formDataToSend.append("userId", formData.userId.trim());
    formDataToSend.append("bikeName", bikeFullName.trim());
    formDataToSend.append("bikeModel", formData.bikeYear);
    formDataToSend.append("bikeNumber", formData.bikeNumber.trim().toUpperCase());
    formDataToSend.append("bikeEngine", formData.bikeEngine.trim());
    formDataToSend.append("fuel", formData.fuel);
    formDataToSend.append("transmission", formData.transmission);
    formDataToSend.append("pricePerKm", formData.pricePerKm);
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("contactName", formData.contactName.trim());
    formDataToSend.append("contactNumber", normalizeMobile(formData.contactNumber));
    formDataToSend.append("InsuranceNo", formData.insuranceNo.trim());
    formDataToSend.append("pickupArea", formData.pickupArea.trim());
    formDataToSend.append("pickupCity", formData.pickupCity.trim());
    formDataToSend.append("pickupCityState", formData.pickupCityState.trim());
    formDataToSend.append("pickupCityPinCode", formData.pickupCityPinCode.trim());
    formDataToSend.append("pickupCityCountry", formData.pickupCityCountry.trim() || "India");
    formDataToSend.append("latitude", formData.latitude);
    formDataToSend.append("longitude", formData.longitude);
    formDataToSend.append("gps", formData.gps.toString());
    formDataToSend.append("drivingLicense", formData.drivingLicense.toString());
    formDataToSend.append("aadharCard", formData.aadharCard.toString());
    formDataToSend.append("depositVehicle", formData.depositVehicle.toString());
    formDataToSend.append("depositMoney", formData.depositMoney);
    // Append all 5 photos
    if (formData.photoFront) formDataToSend.append("bikeImages", formData.photoFront);
    if (formData.photoBack) formDataToSend.append("bikeImages", formData.photoBack);
    if (formData.photoLeft) formDataToSend.append("bikeImages", formData.photoLeft);
    if (formData.photoRight) formDataToSend.append("bikeImages", formData.photoRight);
    if (formData.photoInterior) formDataToSend.append("bikeImages", formData.photoInterior);

    try {
      const response = await apiService.bike.createBike(formDataToSend);
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage = "Failed to post bike. Please try again.";
      if (error?.response?.data?.message) errorMessage = error.response.data.message;
      else if (error?.response?.data?.error) errorMessage = error.response.data.error;
      else if (error?.message) errorMessage = error.message;
      if (errorMessage.includes("userId") || errorMessage.includes("ObjectId")) errorMessage = "Invalid user ID. Please log in again and try.";
      else if (errorMessage.includes("bikeNumber")) errorMessage = "Invalid bike number format. Please check and try again.";
      else if (errorMessage.includes("duplicate")) errorMessage = "This bike is already listed. Please check the bike number.";

      if ((error?.status === 403 || error?.response?.status === 403) && errorMessage.includes("Vehicle limit reached")) {
        if (window.confirm(`${errorMessage}\n\nGo to plans now?`)) {
          window.location.href = "/subscription";
        }
        return;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => { setShowSuccessModal(false); window.location.href = "/listed-bike"; };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">List your Bike</h1>

          <div className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-800">Vehicle Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicleNameFields.map((field) => (
                <div key={field.name} data-error={!!fieldErrors[field.name]}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(e) => {
                      const value = field.numeric ? e.target.value.replace(/\D/g, "") : e.target.value;
                      setFormData((prev) => ({ ...prev, [field.name]: value }));
                      setFieldErrors((prev) => ({ ...prev, [field.name]: "" }));
                    }}
                    maxLength={field.maxLength}
                    inputMode={field.numeric ? "numeric" : "text"}
                    autoComplete="off"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors[field.name] ? "border-red-500 ring-2 ring-red-500" : "border-gray-300"
                    }`}
                  />
                  {fieldErrors[field.name] && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</span>
                  )}
                </div>
              ))}
              {/* Typeable Dropdowns */}
              {typeableFields.map((field) => (
                <div key={field.name} data-error={!!fieldErrors[field.name]}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <div className={fieldErrors[field.name] ? "ring-2 ring-red-500 rounded-lg" : ""}>
                    <TypeableDropdown
                      options={field.options}
                      value={formData[field.name as keyof typeof formData] as string}
                      onChange={(value) => {
                        handleTypeableChange(field.name, value);
                        setFieldErrors((prev) => ({ ...prev, [field.name]: "" }));
                      }}
                      placeholder={field.placeholder}
                      required={true}
                    />
                  </div>
                  {fieldErrors[field.name] && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</span>
                  )}
                </div>
              ))}

              {/* Text/Number Fields */}
              {textFields.map((field) => (
                <div key={field.name} data-error={!!fieldErrors[field.name]}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={(e) => {
                      if (field.name === "bikeNumber") {
                        handleBikeNumberChange(e);
                      } else {
                        handleInputChange(e);
                      }
                      setFieldErrors((prev) => ({ ...prev, [field.name]: "" }));
                    }}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${fieldErrors[field.name] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {fieldErrors[field.name] && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500"></span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your bike's condition, features, and any additional details..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            {/* Photos - At least one required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bike Photos <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">Upload photos of your bike from different angles (at least one photo required)</p>
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                Please blur or cover your number plate before uploading, for your own privacy.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {photoFields.map((photo) => (
                  <div key={photo.key} className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {photo.label}
                    </label>
                    {formData[photo.key as keyof typeof formData] ? (
                      <div className="relative group">
                        <img
                          src={URL.createObjectURL(formData[photo.key as keyof typeof formData] as File)}
                          alt={photo.label}
                          className="w-full h-28 object-cover rounded-lg border-2 border-green-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeSinglePhoto(photo.key)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className={`cursor-pointer border-2 border-dashed rounded-lg h-28 flex flex-col items-center justify-center transition ${fieldErrors[photo.key] ? 'border-red-400 bg-red-50' : 'border-blue-300 bg-blue-50 hover:bg-blue-100'}`}>
                        <Plus className={`w-6 h-6 ${fieldErrors[photo.key] ? 'text-red-500' : 'text-blue-600'}`} />
                        <span className={`text-xs mt-1 ${fieldErrors[photo.key] ? 'text-red-500' : 'text-blue-600'}`}>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSinglePhotoUpload(e, photo.key)}
                          className="hidden"
                        />
                      </label>
                    )}
                    {fieldErrors[photo.key] && (
                      <span className="text-red-500 text-xs mt-1">{fieldErrors[photo.key]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold text-gray-800">Your Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactFields.map((field) => (
                <div key={field.name} data-error={!!fieldErrors[field.name]}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={field.name === "contactNumber" ? "tel" : "text"}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFieldErrors((prev) => ({ ...prev, [field.name]: "" }));
                    }}
                    placeholder={field.placeholder}
                    pattern={field.pattern}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${fieldErrors[field.name] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {fieldErrors[field.name] && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Details */}
            <div className="border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold text-gray-800">Additional Details</h2>
            </div>
            <div data-error={!!fieldErrors.insuranceNo}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="insuranceNo"
                value={formData.insuranceNo}
                onChange={(e) => {
                  handleInputChange(e);
                  setFieldErrors((prev) => ({ ...prev, insuranceNo: "" }));
                }}
                placeholder="1234567890"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition ${fieldErrors.insuranceNo ? 'border-red-500 ring-2 ring-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                required
              />
              {fieldErrors.insuranceNo && (
                <span className="text-red-500 text-xs mt-1 block">{fieldErrors.insuranceNo}</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checkboxes.map((cb) => (
                <div key={cb.name} className="flex flex-col">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name={cb.name} checked={formData[cb.name as keyof typeof formData] as boolean} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                    <span className="ml-3 text-sm text-gray-700">{cb.label}</span>
                  </label>
                  {fieldErrors[cb.name] && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors[cb.name]}</span>
                  )}
                </div>
              ))}
            </div>
            {formData.depositVehicle && (
              <div data-error={!!fieldErrors.depositMoney}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount (₹)</label>
                <input
                  type="number"
                  name="depositMoney"
                  value={formData.depositMoney}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFieldErrors((prev) => ({ ...prev, depositMoney: "" }));
                  }}
                  placeholder="10,000"
                  min={0}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.depositMoney ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.depositMoney && (
                  <span className="text-red-500 text-xs mt-1 block">{fieldErrors.depositMoney}</span>
                )}
              </div>
            )}

            {/* Address */}
            <div className="border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold text-gray-800">Vehicle Pickup Address</h2>
            </div>

            <PickupLocationPicker
              value={pickupCoords}
              onChange={handlePickupLocationChange}
              required
              error={fieldErrors.pickupLocation}
            />

            {/* Address Text Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addressFields.map((field) => (
                <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""} data-error={!!fieldErrors[field.name]}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFieldErrors((prev) => ({ ...prev, [field.name]: "" }));
                    }}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${fieldErrors[field.name] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                    required
                  />
                  {fieldErrors[field.name] && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</span>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Now"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Posted Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Your bike is now listed and visible to all users.
            </p>
            <button
              onClick={handleModalClose}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-md"
            >
              View Listed Bikes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListBikePage;