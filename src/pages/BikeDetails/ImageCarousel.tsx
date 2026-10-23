// components/BikeDetails/ImageCarousel.tsx
import React from "react";

interface Props {
  images: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (i: number) => void;
}

const ImageCarousel: React.FC<Props> = ({ images, currentIndex, onPrev, onNext, onSelectIndex }) => {
  return (
    <div className="relative w-300px md:w-[420px] h-[300px] flex-shrink-0 rounded-[10px] border-2 border-transparent hover:border-[#0066FF] transition-all duration-200">
      <img src={images[currentIndex]} alt={`image-${currentIndex}`} className="w-full h-full object-cover transition-all duration-500 rounded-[10px]" />

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20 transition-all cursor-pointer border border-gray-200"
        type="button"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6 text-gray-800 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-2xl z-20 transition-all cursor-pointer border border-gray-200"
        type="button"
        aria-label="Next image"
      >
        <svg className="w-6 h-6 text-gray-800 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelectIndex(idx)}
            className={`h-2 rounded-full transition-all ${idx === currentIndex ? "bg-[#0066FF] w-6" : "bg-gray-700 w-2"}`}
            aria-label={`Select image ${idx + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
