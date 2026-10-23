import React, { useEffect, useRef, useState } from "react";
import { Loader, Plus, X, ChevronDown } from "lucide-react";
import apiService from "../services/api.service";
import carData from "./data/carData.json";
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

const ListCarPage = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const carNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{1,4}$/i;
  const [carNumberError, setCarNumberError] = useState("");

  const getUserId = () => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId || "";
  };

  const [formData, setFormData] = useState({
    userId: getUserId(),
    CarName: "", CarBrand: "", CarModel: "", CarNumber: "", Carseater: "",
    CarYear: "", fuelType: "", transmissionType: "", kmDriven: "",
    Ac_available: false, description: "", RentPerHour: "", RentPerDay: "",
    driverAvailable: false, driverFee: "",
    contactName: "", contactNumber: "", DepositAmount: "0",
    drivingLicenseRequired: false, AadharCardRequired: false, DepositVehicle: false,
     insurance: false, insuranceExpiry: "",
    photoFront: null as File | null,
    photoBack: null as File | null,
    photoLeft: null as File | null,
    photoRight: null as File | null,
    photoInterior: null as File | null,
    pickupArea: "", pickupCity: "", pickupCityState: "",
    pickupCityPinCode: "", pickupCityCountry: "", pickupLatitude: "",
    pickupLongitude: "", gps: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const transmissionOptions = ["Manual", "Automatic", "AMT", "CVT", "DCT", "iMT"];

  // Brand, model and year are typed freely: new vehicles launch every year, so no fixed list.
  const vehicleNameFields = [
    { name: "CarBrand", label: "Car Brand", maxLength: 50, numeric: false },
    { name: "CarModel", label: "Car Model", maxLength: 50, numeric: false },
    { name: "CarYear", label: "Manufacturing Year", maxLength: 4, numeric: true },
  ] as const;

  const typeableFields = [
    { name: "Carseater", label: "Seating Capacity", options: carData?.seatingCapacity || [], placeholder: "Type seats..." },
    { name: "fuelType", label: "Fuel Type", options: carData?.fuelTypes || [], placeholder: "Type fuel type..." },
    { name: "transmissionType", label: "Transmission", options: transmissionOptions, placeholder: "Type transmission..." },
  ];

  const textFields = [
    { name: "CarNumber", label: "Car Number", placeholder: "AP12AB1234" },
    { name: "kmDriven", label: "KM Driven", placeholder: "15000" },
    { name: "RentPerHour", label: "Rent Per Hour (₹)", type: "number", placeholder: "500" },
    { name: "RentPerDay", label: "Rent Per Day (₹)", type: "number", placeholder: "5000" },
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
    { name: "Ac_available", label: "AC Available" },
    { name: "drivingLicenseRequired", label: "Driving License Required" },
    { name: "AadharCardRequired", label: "Aadhar Card Required" },
    { name: "DepositVehicle", label: "Deposit Vehicle Required" },
    { name: "gps", label: "GPS Tracking Available" },
  ];

  const pickupCoords = toPickupCoords(formData.pickupLatitude, formData.pickupLongitude);

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
      pickupLatitude: loc.latitude.toString(),
      pickupLongitude: loc.longitude.toString(),
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

  const handleCarNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData((prev) => ({ ...prev, CarNumber: value }));
    if (!carNumberRegex.test(value)) {
      setCarNumberError("Invalid format, e.g., AP12AB1234");
    } else {
      setCarNumberError("");
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
    { key: "photoInterior", label: "Interior" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!cleanVehicleText(formData.CarBrand)) errors.CarBrand = "Car brand is required";
    else if (!isValidVehicleText(formData.CarBrand)) errors.CarBrand = "Enter a valid car brand (2-50 letters/numbers)";
    if (!cleanVehicleText(formData.CarModel)) errors.CarModel = "Car model is required";
    else if (!isValidVehicleText(formData.CarModel)) errors.CarModel = "Enter a valid car model (2-50 letters/numbers)";
    if (!formData.CarYear.trim()) errors.CarYear = "Manufacturing year is required";
    else if (!isValidManufacturingYear(formData.CarYear))
      errors.CarYear = `Enter a valid year (${MIN_MANUFACTURING_YEAR}-${new Date().getFullYear() + 1})`;
    if (!formData.Carseater) errors.Carseater = "Seating capacity is required";

    if (!formData.fuelType) errors.fuelType = "Fuel type is required";
    if (!formData.transmissionType) errors.transmissionType = "Transmission type is required";
    if (!formData.CarNumber) {
      errors.CarNumber = "Car number is required";
    } else if (!carNumberRegex.test(formData.CarNumber.toUpperCase())) {
      errors.CarNumber = "Invalid format, e.g., AP12AB1234";
    }
    if (!formData.kmDriven.trim()) {
      errors.kmDriven = "KM driven is required";
    } else if (!isNonNegativeNumber(formData.kmDriven)) {
      errors.kmDriven = "Enter a valid KM driven (0 or more)";
    }
    if (!isPositiveNumber(formData.RentPerHour)) {
      errors.RentPerHour = "Valid rent per hour is required (greater than 0)";
    }
    if (!isPositiveNumber(formData.RentPerDay)) {
      errors.RentPerDay = "Valid rent per day is required (greater than 0)";
    }
    if (formData.driverAvailable && formData.driverFee.trim() && !isNonNegativeNumber(formData.driverFee)) {
      errors.driverFee = "Enter a valid driver fee";
    }
    if (formData.DepositVehicle && formData.DepositAmount.trim() && !isNonNegativeNumber(formData.DepositAmount)) {
      errors.DepositAmount = "Enter a valid deposit amount";
    }

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

    if (!toPickupCoords(formData.pickupLatitude, formData.pickupLongitude)) {
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

    const hasAtLeastOnePhoto = formData.photoFront || formData.photoBack || formData.photoLeft || formData.photoRight || formData.photoInterior;
    if (!hasAtLeastOnePhoto) {
      errors.photoFront = "At least one photo is required";
    }

    // Checkbox required validation
    if (!formData.AadharCardRequired) {
      errors.AadharCardRequired = "Aadhar Card is required";
    }
    if (!formData.drivingLicenseRequired) {
      errors.drivingLicenseRequired = "Driving License is required";
    }
    if (!formData.DepositVehicle) {
      errors.DepositVehicle = "Deposit Vehicle is required";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      scrollToFirstError();
      return;
    }

    if (!formData.userId || formData.userId.length !== 24 || !/^[a-f0-9]{24}$/i.test(formData.userId)) {
      alert("Invalid user ID format. Please log in again."); return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    const carFullName = `${cleanVehicleText(formData.CarBrand)} ${cleanVehicleText(formData.CarModel)}`;
    formDataToSend.append("userId", formData.userId.trim());
    formDataToSend.append("CarName", carFullName.trim());
    formDataToSend.append("CarModel", formData.CarYear);
    formDataToSend.append("CarNumber", formData.CarNumber.trim().toUpperCase());
    formDataToSend.append("Carseater", formData.Carseater);
    formDataToSend.append("fuelType", formData.fuelType);
    formDataToSend.append("transmissionType", formData.transmissionType);
    formDataToSend.append("kmDriven", formData.kmDriven);
    formDataToSend.append("Ac_available", formData.Ac_available ? "yes" : "no");
    formDataToSend.append("description", formData.description.trim());
    formDataToSend.append("RentPerHour", formData.RentPerHour);
    formDataToSend.append("RentPerDay", formData.RentPerDay);
    formDataToSend.append("contactName", formData.contactName.trim());
    formDataToSend.append("contactNumber", normalizeMobile(formData.contactNumber));
    formDataToSend.append("DepositAmount", formData.DepositAmount);
    formDataToSend.append("drivingLicenseRequired", formData.drivingLicenseRequired.toString());
    formDataToSend.append("AadharCardRequired", formData.AadharCardRequired.toString());
    formDataToSend.append("DepositVehicle", formData.DepositVehicle ? "yes" : "no");
    formDataToSend.append("pickupArea", formData.pickupArea.trim());
    formDataToSend.append("pickupCity", formData.pickupCity.trim());
    formDataToSend.append("pickupCityState", formData.pickupCityState.trim());
    formDataToSend.append("pickupCityPinCode", formData.pickupCityPinCode.trim());
    formDataToSend.append("pickupCityCountry", formData.pickupCityCountry.trim() || "India");
    formDataToSend.append("pickupLatitude", formData.pickupLatitude);
    formDataToSend.append("pickupLongitude", formData.pickupLongitude);
    formDataToSend.append("gps", formData.gps.toString());
    formDataToSend.append("driverAvailable", formData.driverAvailable.toString());
    if (formData.driverAvailable) {
      formDataToSend.append("driverFee", formData.driverFee || "0");
    }
    if (formData.photoFront) formDataToSend.append("carImages", formData.photoFront);
    if (formData.photoBack) formDataToSend.append("carImages", formData.photoBack);
    if (formData.photoLeft) formDataToSend.append("carImages", formData.photoLeft);
    if (formData.photoRight) formDataToSend.append("carImages", formData.photoRight);
    if (formData.photoInterior) formDataToSend.append("carImages", formData.photoInterior);

    try {
      const response = await apiService.car.createCar(formDataToSend);
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage = "Failed to post car. Please try again.";
      if (error?.response?.data?.message) errorMessage = error.response.data.message;
      else if (error?.response?.data?.error) errorMessage = error.response.data.error;
      else if (error?.message) errorMessage = error.message;
      if (errorMessage.includes("userId") || errorMessage.includes("ObjectId")) errorMessage = "Invalid user ID. Please log in again and try.";
      else if (errorMessage.includes("CarNumber")) errorMessage = "Invalid car number format. Please check and try again.";
      else if (errorMessage.includes("duplicate")) errorMessage = "This car is already listed. Please check the car number.";

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

  const handleModalClose = () => { setShowSuccessModal(false); window.location.href = "/listed"; };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">List your Car</h1>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      if (field.name === "CarNumber") {
                        handleCarNumberChange(e);
                      } else {
                        handleInputChange(e);
                      }
                      setFieldErrors((prev) => ({ ...prev, [field.name]: "" }));
                    }}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${fieldErrors[field.name] ? 'border-red-500 ring-2 ring-500' : 'border-gray-300'}`}
                    required
                  />
                  {fieldErrors[field.name] && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="driverAvailable"
                  checked={formData.driverAvailable}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Offer a with-driver option for this car</span>
              </label>
              {formData.driverAvailable && (
                <div className="mt-3" data-error={!!fieldErrors.driverFee}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver Fee (₹ per day)</label>
                  <input
                    type="number"
                    name="driverFee"
                    value={formData.driverFee}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFieldErrors((prev) => ({ ...prev, driverFee: "" }));
                    }}
                    placeholder="200"
                    min={0}
                    className={`w-full sm:w-64 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${fieldErrors.driverFee ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                  />
                  {fieldErrors.driverFee && (
                    <span className="text-red-500 text-xs mt-1 block">{fieldErrors.driverFee}</span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Charged per day of the trip when a customer books this car with a driver (e.g. a 3-day trip charges this amount × 3).</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500"></span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your car's condition, features, and any additional details..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Photos <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">Upload photos of your car from different angles (at least one photo required)</p>
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

            <div className="border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold text-gray-800">Additional Details</h2>
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

            {formData.DepositVehicle && (
              <div data-error={!!fieldErrors.DepositAmount}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount (₹)</label>
                <input
                  type="number"
                  name="DepositAmount"
                  value={formData.DepositAmount}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFieldErrors((prev) => ({ ...prev, DepositAmount: "" }));
                  }}
                  placeholder="10,000"
                  min={0}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${fieldErrors.DepositAmount ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                />
                {fieldErrors.DepositAmount && (
                  <span className="text-red-500 text-xs mt-1 block">{fieldErrors.DepositAmount}</span>
                )}
              </div>
            )}

            <div className="border-b pb-2 pt-4">
              <h2 className="text-lg font-semibold text-gray-800">Vehicle Pickup Address</h2>
            </div>

            <PickupLocationPicker
              value={pickupCoords}
              onChange={handlePickupLocationChange}
              required
              error={fieldErrors.pickupLocation}
            />

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
              Your car is now listed and visible to all users.
            </p>
            <button
              onClick={handleModalClose}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-md"
            >
              View Listed Cars
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListCarPage;