// pages/BikeDetails/index.tsx
import React from "react";
import { useParams, useLocation } from "react-router-dom";
// import ImageCarousel from "../../pages/BikeDetails/ImageCarousel";
import ImageCarousel from "./ImageCarousel";
import EditForm from "./EditForm";
// import useBikeDetails from "../../hooks/useBikeDetails";
import useBikeDetails from "../../hooks/useBikeDetails";


const BikeDetailsPage: React.FC = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const location = useLocation();
  const { bikeData, openEditForm } = (location && (location as any).state) || {};

  const {
    editVehicle,
    originalVehicle,
    isLoading,
    isFetching,
    preview,
    additionalImages,
    existingImages,
    removeExistingImage,
    currentImageIndex,
    carouselImages,
    editOpen,
    setEditOpen,
    setCurrentImageIndex,
    handleBikeImageChange,
    handleAdditionalImagesChange,
    removeAdditionalImage,
    handleChange,
    handlePickupLocationChange,
    fieldErrors,
    handleSave,
    handleDelete,
  } = useBikeDetails({ bikeId, bikeData, openEditForm });

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-700 font-medium">Loading bike details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left: Vehicle info */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <ImageCarousel
              images={carouselImages}
              currentIndex={currentImageIndex}
              onPrev={() => setCurrentImageIndex((p) => (p === 0 ? carouselImages.length - 1 : p - 1))}
              onNext={() => setCurrentImageIndex((p) => (p === carouselImages.length - 1 ? 0 : p + 1))}
              onSelectIndex={(i) => setCurrentImageIndex(i)}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h1
                  className="text-[32px] font-bold text-[#000000] leading-tight cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2 transition-all"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}
                >
                  {editVehicle.name}
                </h1>
              </div>

              {editVehicle.BikeNumber && (
                <div className="mt-2">
                  <p className="text-lg text-gray-600 font-medium">{editVehicle.BikeNumber}</p>
                </div>
              )}

              {editVehicle.BikeModel && (
                <div className="mt-1">
                  <p className="text-md text-gray-500">Model: {editVehicle.BikeModel}</p>
                </div>
              )}

              <div className="flex items-baseline mt-2 cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2">
                <span className="text-3xl font-bold">₹{editVehicle.price}</span>
                <span className="text-gray-500 ml-2 text-sm">/km</span>
              </div>

              {/* features & description (kept inline for simplicity) */}
              <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden bg-white mb-4 mt-4 cursor-pointer hover:border-[#0066FF] hover:border-2 transition-all duration-200">
                <div className="flex items-center gap-0">
                  <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
                    <img src={require("../../assets/icons/BikeCC.png")} className="w-6 h-6 mb-1.5" alt="engine" />
                    <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: "Inter, sans-serif" }}>
                      {editVehicle.engineCapacity} CC
                    </span>
                  </div>
                  <div className="w-[1px] h-12 bg-[#E5E5E5]" />
                  <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
                    <img src={require("../../assets/icons/AutomaticLogo.png")} className="w-6 h-6 mb-1.5" alt="transmission" />
                    <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: "Inter, sans-serif" }}>
                      {editVehicle.transmission}
                    </span>
                  </div>
                  <div className="w-[1px] h-12 bg-[#E5E5E5]" />
                  <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
                    <img src={require("../../assets/icons/Petrol.png")} className="w-6 h-6 mb-1.5" alt="fuel" />
                    <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: "Inter, sans-serif" }}>
                      {editVehicle.fuel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-[#E5E5E5] rounded-[10px] p-4 bg-white mb-4 cursor-pointer hover:border-[#0066FF] hover:border-2 transition-all duration-200">
                <h2 className="text-[18px] font-bold text-[#000000] mb-2 cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2 transition-all" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}>
                  Description
                </h2>
                <p className="text-[#666666] text-[14px] leading-[1.6] min-h-[40px]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {editVehicle.description}
                </p>
              </div>
            </div>
          </div>

          {editVehicle.street && editVehicle.city && (
            <div className="flex items-start gap-2">
              <img src={require("../../assets/icons/Location.png")} className="w-5 h-5 mt-0.5" alt="location" />
              <span className="text-[14px] text-[#666666]" style={{ fontFamily: "Inter, sans-serif" }}>
                {editVehicle.street}, {editVehicle.city}
                {editVehicle.pincode && `, ${editVehicle.pincode}`}
              </span>
            </div>
          )}
        </div>

        {/* Right: Edit Form */}
        <aside className="md:w-[380px]">
          <div className="sticky top-6 bg-white p-6 rounded-2xl shadow-lg">
            <EditForm
              editOpen={editOpen}
              setEditOpen={setEditOpen}
              editVehicle={editVehicle}
              preview={preview}
              additionalImages={additionalImages}
              existingImages={existingImages}
              removeExistingImage={removeExistingImage}
              handleChange={handleChange}
              handleBikeImageChange={handleBikeImageChange}
              handleAdditionalImagesChange={handleAdditionalImagesChange}
              removeAdditionalImage={removeAdditionalImage}
              handleSave={handleSave}
              handleDelete={handleDelete}
              isLoading={isLoading}
              fieldErrors={fieldErrors}
              handlePickupLocationChange={handlePickupLocationChange}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BikeDetailsPage;
