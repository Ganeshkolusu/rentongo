import React, { useState } from "react";
import BlackCar from "../assets/images/BlackCar.png";

interface CarImageCarouselProps {
  mainImage: string;
  vehicleName: string;
  existingImages?: string[];
  additionalImages: File[];
}

const CarImageCarousel: React.FC<CarImageCarouselProps> = ({
  mainImage,
  vehicleName,
  existingImages,
  additionalImages,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = existingImages && existingImages.length > 0
    ? [...existingImages, ...additionalImages.map((img) => URL.createObjectURL(img))]
    : additionalImages.length > 0
      ? [mainImage || BlackCar, ...additionalImages.map((img) => URL.createObjectURL(img))]
      : [mainImage || BlackCar];

  const safeIndex = currentImageIndex < carouselImages.length ? currentImageIndex : 0;

  return (
    <div className="relative w-300px md:w-[420px] h-[300px] flex-shrink-0 rounded-[10px] border-2 border-transparent hover:border-[#0066FF] transition-all duration-200">
      <img
        src={carouselImages[safeIndex]}
        alt={vehicleName}
        className="w-full h-full object-cover transition-all duration-500 rounded-[10px]"
      />

      {/* Left Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20 transition-all cursor-pointer border border-gray-200"
        type="button"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6 text-gray-800 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20 transition-all cursor-pointer border border-gray-200"
        type="button"
        aria-label="Next image"
      >
        <svg className="w-6 h-6 text-gray-800 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
        {carouselImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImageIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === safeIndex
                ? "bg-[#0066FF] w-6"
                : "bg-gray-700 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarImageCarousel;