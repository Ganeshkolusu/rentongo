// components/BikeDetails/EditForm.tsx
import React from "react";
import { VehicleDetails } from "hooks/useBikeDetails"; // reuse types from hook file
import PickupLocationPicker, { PickupLocation } from "../../components/PickupLocationPicker";
import { toPickupCoords } from "../../utils/vehicleFormValidation";

interface Props {
  editOpen: boolean;
  setEditOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  editVehicle: VehicleDetails;
  preview: string | null;
  additionalImages: File[];
  existingImages: string[];
  removeExistingImage: (url: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBikeImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAdditionalImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAdditionalImage: (idx: number) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  isLoading: boolean;
  fieldErrors: Record<string, string>;
  handlePickupLocationChange: (loc: PickupLocation) => void;
}

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? <span className="text-red-500 text-xs mt-1 block">{message}</span> : null;

const EditForm: React.FC<Props> = ({
  editOpen,
  setEditOpen,
  editVehicle,
  preview,
  additionalImages,
  existingImages,
  removeExistingImage,
  handleChange,
  handleBikeImageChange,
  handleAdditionalImagesChange,
  removeAdditionalImage,
  handleSave,
  handleDelete,
  isLoading,
  fieldErrors,
  handlePickupLocationChange,
}) => {
  // Input classes with a red border when the field has an error.
  const inputCls = (field: string) =>
    `w-full border ${fieldErrors[field] ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"} rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`;

  return (
    <>
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-2xl font-semibold">Edit Bike Details</h2>

        <button
          onClick={() => setEditOpen((s: boolean) => !s)}
          type="button"
          aria-label={editOpen ? "Hide form" : "Show form"}
          className="w-auto px-3 h-8 flex items-center justify-center rounded-full text-white text-sm font-medium transition-colors bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] shadow-md hover:opacity-90"
        >
          {editOpen ? "Hide" : "Show"}
        </button>
      </div>

      {editOpen && (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <div data-error={!!fieldErrors.name}>
            <label className="block text-gray-700 font-medium mb-2">Bike Name </label>
            <input name="name" value={editVehicle.name} onChange={handleChange} className={inputCls("name")} required />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Bike Model</label>
            <input name="BikeModel" value={editVehicle.BikeModel} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea name="description" value={editVehicle.description} onChange={handleChange} placeholder="Describe your bike..." className="w-full border border-gray-300 rounded-lg p-2 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div data-error={!!fieldErrors.price}>
            <label className="block text-gray-700 font-medium mb-2">Price per KM </label>
            <input type="number" name="price" value={editVehicle.price} onChange={handleChange} placeholder="10" className={inputCls("price")} min="1" required />
            <FieldError message={fieldErrors.price} />
          </div>

          <div data-error={!!fieldErrors.contactName}>
            <label className="block text-gray-700 font-medium mb-2">Contact Name</label>
            <input name="contactName" value={editVehicle.contactName} onChange={handleChange} placeholder="John Doe" className={inputCls("contactName")} />
            <FieldError message={fieldErrors.contactName} />
          </div>

          <div data-error={!!fieldErrors.contactNumber}>
            <label className="block text-gray-700 font-medium mb-2">Contact Number</label>
            <input type="tel" name="contactNumber" value={editVehicle.contactNumber} onChange={handleChange} placeholder="9876543210" className={inputCls("contactNumber")} />
            <FieldError message={fieldErrors.contactNumber} />
          </div>

          <PickupLocationPicker
            key={editVehicle.id || "new"}
            value={toPickupCoords(editVehicle.latitude, editVehicle.longitude)}
            onChange={handlePickupLocationChange}
            required
            error={fieldErrors.pickupLocation}
            autoLocate={false}
          />

          <div data-error={!!fieldErrors.city}>
            <label className="block text-gray-700 font-medium mb-2">City</label>
            <input name="city" value={editVehicle.city} onChange={handleChange} placeholder="Hyderabad" className={inputCls("city")} />
            <FieldError message={fieldErrors.city} />
          </div>

          <div data-error={!!fieldErrors.street}>
            <label className="block text-gray-700 font-medium mb-2">Street/Area</label>
            <input name="street" value={editVehicle.street} onChange={handleChange} className={inputCls("street")} />
            <FieldError message={fieldErrors.street} />
          </div>

          <div data-error={!!fieldErrors.pincode}>
            <label className="block text-gray-700 font-medium mb-2">Pincode</label>
            <input name="pincode" value={editVehicle.pincode} onChange={handleChange} placeholder="500034" className={inputCls("pincode")} />
            <FieldError message={fieldErrors.pincode} />
          </div>

          <div data-error={!!fieldErrors.state}>
            <label className="block text-gray-700 font-medium mb-2">State</label>
            <input name="state" value={editVehicle.state} onChange={handleChange} placeholder="Telangana" className={inputCls("state")} />
            <FieldError message={fieldErrors.state} />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Country</label>
            <input name="country" value={editVehicle.country} onChange={handleChange} placeholder="India" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Required Documents</p>
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="requireDrivingLicense" checked={!!editVehicle.requireDrivingLicense} onChange={handleChange} className="rounded" />
              <span className="text-sm text-gray-700">Require Driving License</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="requireAadharCard" checked={!!editVehicle.requireAadharCard} onChange={handleChange} className="rounded" />
              <span className="text-sm text-gray-700">Require Aadhar Card</span>
            </label>
          </div>

          <div data-error={!!fieldErrors.depositMoney}>
            <label className="block text-gray-700 font-medium mb-2">Deposit Amount (₹)</label>
            <input type="number" name="depositMoney" value={editVehicle.depositMoney} onChange={handleChange} placeholder="3000" className={inputCls("depositMoney")} min="0" />
            <FieldError message={fieldErrors.depositMoney} />
          </div>

          {existingImages.length > 0 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Existing Photos</label>
              <div className="grid grid-cols-2 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={url} className="relative group">
                    <img src={url} alt={`Existing ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
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

          <div>
            <label className="block text-gray-700 font-medium mb-2">Main Bike Image</label>
            <div className="w-full h-[180px] border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center relative bg-gray-50 hover:bg-gray-100 transition">
              {preview ? <img src={preview} alt="Bike Preview" className="w-full h-full object-cover rounded-md" /> : (
                <div className="text-center">
                  <p className="text-gray-500">📷 Click to upload bike photo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleBikeImageChange} />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Additional Images (Max 4)
              {additionalImages.length > 0 && (
                <span className="text-xs text-gray-500 ml-2">({additionalImages.length}/4)</span>
              )}
            </label>
            <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
              <input type="file" accept="image/*" multiple className="w-full" onChange={handleAdditionalImagesChange} disabled={additionalImages.length >= 4} />
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={URL.createObjectURL(img)} alt={`Additional ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                      <button onClick={() => removeAdditionalImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition" type="button">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} disabled={isLoading} className="flex-1 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white py-3 rounded-[8px] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[14px]" type="button">
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={handleDelete} disabled={isLoading} className="px-6 bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white py-3 rounded-[8px] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[14px]" type="button">
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EditForm;
