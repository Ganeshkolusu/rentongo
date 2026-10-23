import React from "react";
import Modal from "../../components/ui/modal"; // wrapper component
// any icons you use
import ProfileOption from "../../features/profile/components/profileOption";
// import Auto  from "../../assets/icons/Auto.png";
import Car from "../../assets/icons/Car.png";
import bike from "../../assets/icons/sportbike.png";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  // onSelect: (type: "car" | "auto" | "bike") => void;
  onSelect: (type: "car" |"bike") => void;
}

const selectvehiclemodal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Select Vehicle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">×</button>
        </div>
        {/* Vehicle options */}
        <div className="space-y-4">
          {/* Car Option */}
          <div
            className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onSelect("car")}
          >
            <div className="bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] p-3 rounded mr-4 flex items-center justify-center w-14 h-14">
              <img src={Car} alt="Car" className="w-8 h-8 object-contain filter brightness-0 invert" />
            </div>
            <span className="text-lg font-medium">Car</span>
            <span className="ml-auto text-gray-400">›</span>
          </div>

          {/* Auto Option */}
          {/* <div
            className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onSelect("auto")}
          >
            <div className="bg-gradient-to-r from-indigo-500 to-blue-400 p-3 rounded mr-4 flex items-center justify-center w-14 h-14">
              <img src={Auto} alt="Auto" className="w-8 h-8 object-contain filter brightness-0 invert" />
            </div>
            <span className="text-lg font-medium">Auto</span>
            <span className="ml-auto text-gray-400">›</span>
          </div> */}
            {/* Bike Option */}
          <div
            className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onSelect("bike")}
          >
            <div className="bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] p-3 rounded mr-4 flex items-center justify-center w-14 h-14">
              <img src={bike} alt="Bike" className="w-8 h-8 object-contain filter brightness-0 invert" />
            </div>
            <span className="text-lg font-medium">Bike</span>
            <span className="ml-auto text-gray-400">›</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default selectvehiclemodal;