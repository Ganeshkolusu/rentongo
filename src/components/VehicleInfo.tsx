import React from "react";
import AutomaticLogo from "../assets/icons/AutomaticLogo.png";
import seats from "../assets/icons/seats.jpeg";
import Petrol from "../assets/icons/Petrol.png";
import AClogo from "../assets/icons/ac.png";
import { VehicleDetails } from "../utils/mapCarData";

interface VehicleInfoProps {
  vehicle: VehicleDetails;
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicle }) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 
              className="text-[32px] font-bold text-[#000000] leading-tight cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2 transition-all"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
            >
              {vehicle.name}
            </h1>
          </div>
          {vehicle.CarNumber && (
            <p className="text-[16px] text-[#666666] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {vehicle.CarNumber}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-3 w-fit cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2 transition-all">
        <span className="text-[32px] font-bold text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
          ₹{vehicle.price}
        </span>
        <span className="text-base text-[#666666]" style={{ fontFamily: 'Inter, sans-serif' }}>/hr</span>
      </div>

      <div className="border border-[#E5E5E5] rounded-[10px] overflow-hidden bg-white mb-4 cursor-pointer hover:border-[#0066FF] hover:border-2 transition-all duration-200">
        <div className="flex items-center gap-0">
          <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
            <img src={AutomaticLogo} className="w-6 h-6 mb-1.5" alt="transmission" />
            <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              {vehicle.transmission}
            </span>
          </div>
          
          <div className="w-[1px] h-12 bg-[#E5E5E5]"></div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
            <img src={seats} className="w-6 h-6 mb-1.5" alt="seats" />
            <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              {vehicle.seats} Seaters
            </span>
          </div>
          
          <div className="w-[1px] h-12 bg-[#E5E5E5]"></div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
            <img src={Petrol} className="w-6 h-6 mb-1.5" alt="fuel" />
            <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              {vehicle.fuel}
            </span>
          </div>
          
          <div className="w-[1px] h-12 bg-[#E5E5E5]"></div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
            <img src={AClogo} className="w-6 h-6 mb-1.5" alt="ac" />
            <span className="text-[13px] text-[#333333] font-medium whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
              {vehicle.ac}
            </span>
          </div>
        </div>
      </div>

      <div className="border border-[#E5E5E5] rounded-[10px] p-4 bg-white mb-4 cursor-pointer hover:border-[#0066FF] hover:border-2 transition-all duration-200 w-full">
        <h2 className="text-[18px] font-bold text-[#000000] mb-2 cursor-pointer hover:underline hover:decoration-[#0066FF] hover:decoration-2 transition-all" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
          Description
        </h2>
        <p className="text-[#666666] text-[14px] leading-[1.6] min-h-[40px] break-words overflow-wrap-anywhere" style={{ fontFamily: 'Inter, sans-serif', wordBreak: 'break-word' }}>
          {vehicle.description}
        </p>
      </div>
    </div>
  );
};

export default VehicleInfo;