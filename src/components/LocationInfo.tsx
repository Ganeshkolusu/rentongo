import React from "react";
import Location from "../assets/icons/Location.png";

interface LocationInfoProps {
  street?: string;
  city?: string;
  pincode?: string;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ street, city, pincode }) => {
  if (!street || !city) return null;

  return (
    <div className="flex items-start gap-2">
      <img src={Location} className="w-5 h-5 mt-0.5" alt="location" />
      <span className="text-[14px] text-[#666666]" style={{ fontFamily: 'Inter, sans-serif' }}>
        {street}, {city}
        {pincode && `, ${pincode}`}
      </span>
    </div>
  );
};

export default LocationInfo;