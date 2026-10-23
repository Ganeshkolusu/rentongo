import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useCarDetails } from "../../hooks/useCarDetails";
import CarImageCarousel from "../../components/CarImageCarousel";
import VehicleInfo from "../../components/VehicleInfo";
import LocationInfo from "../../components/LocationInfo";
import EditForm from "../../components/EditForm";

const CarDetails: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const location = useLocation();
  const { carData, openEditForm } = (location && (location as any).state) || {};
  
  const [editOpen, setEditOpen] = useState<boolean>(true);

  const {
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
  } = useCarDetails(carId, carData);

  useEffect(() => {
    if (openEditForm) {
      setEditOpen(true);
    }
  }, [openEditForm]);

  if (isFetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading car details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-6 sm:py-10">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <CarImageCarousel
              mainImage={preview || editVehicle.image}
              vehicleName={editVehicle.name}
              existingImages={existingImages}
              additionalImages={additionalImages}
            />
            <VehicleInfo vehicle={editVehicle} />
          </div>
          <LocationInfo
            street={editVehicle.street}
            city={editVehicle.city}
            pincode={editVehicle.pincode}
          />
        </div>
        
        <EditForm
          editOpen={editOpen}
          setEditOpen={setEditOpen}
          editVehicle={editVehicle}
          isLoading={isLoading}
          preview={preview}
          additionalImages={additionalImages}
          existingImages={existingImages}
          removeExistingImage={removeExistingImage}
          handleChange={handleChange}
          handleCarImageChange={handleCarImageChange}
          handleAdditionalImagesChange={handleAdditionalImagesChange}
          removeAdditionalImage={removeAdditionalImage}
          handleSave={handleSave}
          handleDelete={handleDelete}
          setEditVehicle={setEditVehicle}
          fieldErrors={fieldErrors}
          handlePickupLocationChange={handlePickupLocationChange}
        />
      </div>
    </div>
  );
};

export default CarDetails;