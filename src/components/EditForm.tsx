import React from "react";
import { VehicleWithImage } from "../hooks/useCarDetails";
import PickupLocationPicker, { PickupLocation } from "./PickupLocationPicker";
import { toPickupCoords } from "../utils/vehicleFormValidation";

interface EditFormProps {
  editOpen: boolean;
  setEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editVehicle: VehicleWithImage;
  isLoading: boolean;
  preview: string | null;
  additionalImages: File[];
  existingImages: string[];
  removeExistingImage: (url: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCarImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAdditionalImagesChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeAdditionalImage: (index: number) => void;
  handleSave: () => void;
  handleDelete: () => void;
  setEditVehicle: React.Dispatch<React.SetStateAction<VehicleWithImage>>;
  fieldErrors: Record<string, string>;
  handlePickupLocationChange: (loc: PickupLocation) => void;
}

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <span className="text-red-500 text-xs mt-1 block">{message}</span> : null;

const EditForm: React.FC<EditFormProps> = ({
  editOpen,
  setEditOpen,
  editVehicle,
  isLoading,
  preview,
  additionalImages,
  existingImages,
  removeExistingImage,
  handleChange,
  handleCarImageChange,
  handleAdditionalImagesChange,
  removeAdditionalImage,
  handleSave,
  handleDelete,
  setEditVehicle,
  fieldErrors,
  handlePickupLocationChange,
}) => {
  // Red border for a field with an error, otherwise the field's normal border colour.
  const borderCls = (field: string, normal: string) =>
    fieldErrors[field] ? "border-red-500 ring-1 ring-red-500" : normal;

  return (
    <aside className="md:w-[380px]">
      <div className="sticky top-6 bg-white p-6 rounded-[12px] shadow-lg border border-[#E5E5E5]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-semibold text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            Edit Car Details
          </h2>
          <button
            onClick={() => setEditOpen((s) => !s)}
            type="button"
            aria-label={editOpen ? "Hide form" : "Show form"}
            className="w-auto px-3 h-8 flex items-center justify-center rounded-full text-white text-sm font-medium transition-colors 
                       bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] shadow-md hover:opacity-90"
          >
            {editOpen ? "Hide" : "Show"}
          </button>
        </div>
        {editOpen && (
  <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E5E5E5 transparent' }}>

    {/* Car Name */}
    <div data-error={!!fieldErrors.name}>
      <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        Car Name
      </label>
      <input
        name="name"
        value={editVehicle.name}
        onChange={handleChange}
        className={`w-full border ${borderCls("name", "border-gray-300")} rounded-lg p-2 text-[14px] focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        required
      />
      <FieldError message={fieldErrors.name} />
    </div>

    {/* Car Model */}
    <div>
      <label className="block text-gray-700 font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        Car Model
      </label>
      <input
        name="CarModel"
        value={editVehicle.CarModel || ""}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg p-2 text-[14px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* AC Available Toggle */}
    <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-[8px] border border-[#E5E5E5]">
      <label className="text-[14px] font-medium text-[#333333]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
        AC Available
      </label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name="ac"
          checked={editVehicle.ac?.toLowerCase() === "ac"}
          onChange={(e) => {
            const checked = e.target.checked;
            setEditVehicle((prev) => ({ ...prev, ac: checked ? "AC" : "Non-AC" }));
          }}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0A0747] peer-checked:to-[#4EC8FF]"></div>
      </label>
    </div>

            {/* Description */}
            <div>
              <label className="block text-[14px] font-medium text-[#000000] mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Description
              </label>
              <textarea
                name="description"
                value={editVehicle.description}
                onChange={handleChange}
                placeholder="Car Description"
                className="w-full border border-[#E5E5E5] rounded-[8px] p-3 h-20 resize-none text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Price */}
            <div data-error={!!fieldErrors.price}>
              <label className="block text-[14px] font-medium text-[#000000] mb-2" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Price
              </label>
              <div className="space-y-2">
                <label className="block text-[13px] text-[#666666]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Rent Price (per hour / per DAY)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" style={{ fontFamily: 'Inter, sans-serif' }}>₹</span>
                    <input
                      type="number"
                      name="price"
                      value={editVehicle.price}
                      onChange={handleChange}
                      placeholder="250"
                      className={`w-full border ${borderCls("price", "border-[#E5E5E5]")} rounded-[8px] pl-7 pr-3 py-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      min="1"
                      required
                    />
                  </div>
                  <select className="border border-[#E5E5E5] rounded-[8px] px-3 py-2.5 text-[14px] text-[#333333] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <option>Hour</option>
                    <option>Day</option>
                  </select>
                </div>
                <FieldError message={fieldErrors.price} />
              </div>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                Transmission
              </label>
              <select
                name="transmission"
                value={editVehicle.transmission}
                onChange={handleChange}
                className="w-full border border-[#E5E5E5] rounded-[8px] p-2.5 text-[14px] text-[#333333] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                Fuel Type
              </label>
              <select
                name="fuel"
                value={editVehicle.fuel}
                onChange={handleChange}
                className="w-full border border-[#E5E5E5] rounded-[8px] p-2.5 text-[14px] text-[#333333] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Seats */}
            <div>
              <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                Seating Capacity
              </label>
              <input
                type="number"
                name="seats"
                value={editVehicle.seats.toString().replace(/[^\d]/g, '')}
                onChange={handleChange}
                placeholder="5"
                className="w-full border border-[#E5E5E5] rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                style={{ fontFamily: 'Inter, sans-serif' }}
                min="1"
                max="20"
              />
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-[14px] font-semibold text-[#000000] mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Your Contact Information
              </h3>
              <div className="space-y-3">
                <div data-error={!!fieldErrors.contactName}>
                  <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Name
                  </label>
                  <input
                    name="contactName"
                    value={editVehicle.contactName}
                    onChange={handleChange}
                    placeholder="Manoj Kumar"
                    className={`w-full border ${borderCls("contactName", "border-[#E5E5E5]")} rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <FieldError message={fieldErrors.contactName} />
                </div>
                <div data-error={!!fieldErrors.contactNumber}>
                  <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editVehicle.contactNumber}
                    onChange={handleChange}
                    placeholder="1234567898"
                    className={`w-full border ${borderCls("contactNumber", "border-[#E5E5E5]")} rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <FieldError message={fieldErrors.contactNumber} />
                </div>
              </div>
            </div>

            {/* Customer Required Documents */}
            <div>
              <h3 className="text-[14px] font-semibold text-[#000000] mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Customer Required Documents
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-[8px] border border-[#E5E5E5]">
                  <label className="text-[13px] text-[#333333]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Driving License
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="requireDrivingLicense"
                      checked={editVehicle.requireDrivingLicense}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E5E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0A0747] peer-checked:to-[#4EC8FF]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-[8px] border border-[#E5E5E5]">
                  <label className="text-[13px] text-[#333333]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Aadhar Card
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="requireAadharCard"
                      checked={editVehicle.requireAadharCard}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E5E5E5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#0A0747] peer-checked:to-[#4EC8FF]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Deposit Vehicle */}
            <div>
              <h3 className="text-[14px] font-semibold text-[#000000] mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Deposit Vehicle
              </h3>
              <div className="mt-3" data-error={!!fieldErrors.depositMoney}>
                <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Deposit Money
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" style={{ fontFamily: 'Inter, sans-serif' }}>₹</span>
                  <input
                    type="number"
                    name="depositMoney"
                    value={editVehicle.depositMoney}
                    onChange={handleChange}
                    placeholder="16300"
                    className={`w-full border ${borderCls("depositMoney", "border-[#E5E5E5]")} rounded-[8px] pl-7 pr-3 py-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    min="0"
                  />
                </div>
                <FieldError message={fieldErrors.depositMoney} />
              </div>
            </div>

            {/* Vehicle Pickup Address */}
            <div>
              <h3 className="text-[14px] font-semibold text-[#000000] mb-3" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Vehicle Pickup Address
              </h3>
              <PickupLocationPicker
                key={editVehicle.id || "new"}
                value={toPickupCoords(editVehicle.latitude, editVehicle.longitude)}
                onChange={handlePickupLocationChange}
                required
                error={fieldErrors.pickupLocation}
                autoLocate={false}
              />
              <div className="space-y-3">
                <div>
                  <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Place
                  </label>
                  <input
                    name="doorName"
                    value={editVehicle.doorName}
                    onChange={handleChange}
                    placeholder="Door Name"
                    className="w-full border border-[#E5E5E5] rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div data-error={!!fieldErrors.city}>
                  <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    City
                  </label>
                  <input
                    name="city"
                    value={editVehicle.city}
                    onChange={handleChange}
                    placeholder="Hyderabad"
                    className={`w-full border ${borderCls("city", "border-[#E5E5E5]")} rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <FieldError message={fieldErrors.city} />
                </div>
                <div data-error={!!fieldErrors.state}>
                  <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    State
                  </label>
                  <input
                    name="state"
                    value={editVehicle.state}
                    onChange={handleChange}
                    placeholder="Telangana"
                    className={`w-full border ${borderCls("state", "border-[#E5E5E5]")} rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <FieldError message={fieldErrors.state} />
                </div>
                <div data-error={!!fieldErrors.pincode}>
                  <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Pincode
                  </label>
                  <input
                    name="pincode"
                    value={editVehicle.pincode}
                    onChange={handleChange}
                    placeholder="500064"
                    className={`w-full border ${borderCls("pincode", "border-[#E5E5E5]")} rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <FieldError message={fieldErrors.pincode} />
                </div>
                <div data-error={!!fieldErrors.street}>
                  <label className="block text-[13px] text-[#666666] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Street
                  </label>
                  <input
                    name="street"
                    value={editVehicle.street}
                    onChange={handleChange}
                    className={`w-full border ${borderCls("street", "border-[#E5E5E5]")} rounded-[8px] p-2.5 text-[14px] text-[#333333] placeholder-[#999999] focus:ring-2 focus:ring-[#0066FF] focus:border-transparent`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <FieldError message={fieldErrors.street} />
                </div>
              </div>
            </div>

            {/* Existing Photos */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Photos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt={`Existing ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-[8px]"
                      />
                      <button
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                        type="button"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Photos */}
            <div>
              <button
                onClick={() => document.getElementById('main-image-upload')?.click()}
                className="w-full border-2 border-dashed border-[#E5E5E5] rounded-[8px] p-6 flex flex-col items-center justify-center hover:border-[#0066FF] transition-all bg-[#F8F9FA]"
                type="button"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-[14px] font-medium text-[#333333] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Add photos
                </p>
                <p className="text-[12px] text-[#999999] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Please, first Choose your car image will add supporting pictures to verify your details
                </p>
              </button>
              <input
                id="main-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCarImageChange}
              />
              
              {preview && (
                <div className="mt-3 relative">
                  <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-[8px]" />
                </div>
              )}

              {additionalImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Additional ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-[8px]"
                      />
                      <button
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {additionalImages.length < 4 && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="w-full text-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    onChange={handleAdditionalImagesChange}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white py-3 rounded-[8px] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[14px]"
                style={{ fontFamily: 'Inter, sans-serif' }}
                type="button"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white py-3 rounded-[8px] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[14px]"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default EditForm;