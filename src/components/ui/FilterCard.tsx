// import React, { useState } from "react";
// import carData from "../../pages/data/carData.json";
// import bikeData from "../../pages/data/bikeData.json";

// export interface FilterState {
//   vehicleType: "cars" | "bikes";
//   priceRange: [number, number];
//   distance: number;
//   selectedVehicles: string[];
//   fuelType: string;
//   transmission: string;
// }

// interface FilterCardProps {
//   onApply: (filters: FilterState) => void;
//   onClose?: () => void;
//   initialFilters?: Partial<FilterState>;
// }

// const FilterCard: React.FC<FilterCardProps> = ({
//   onApply,
//   onClose,
//   initialFilters = {},
// }) => {
//   const [filters, setFilters] = useState<FilterState>({
//     vehicleType: "cars",
//     priceRange: [500, 5000],
//     distance: 10,
//     selectedVehicles: [],
//     fuelType: "All",
//     transmission: "All",
//     ...initialFilters,
//   });

//   const [selectedName, setSelectedName] = useState("");
//   const [error, setError] = useState<string | null>(null);

//   // Create vehicle names object from imported data
//   const vehicleNames = {
//     cars: carData.carBrands,
//     bikes: bikeData.bikeBrands,
//   };

//   const getNameOptions = () => {
//     return vehicleNames[filters.vehicleType] || [];
//   };

//   const handleFilterChange = <K extends keyof FilterState>(
//     key: K,
//     value: FilterState[K]
//   ) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   // Change vehicle type and clear only the vehicle name selection
//   const handleVehicleTypeChange = (type: "cars" | "bikes") => {
//     setFilters((prev) => ({
//       ...prev,
//       vehicleType: type,
//       selectedVehicles: [], // Clear selected vehicle since it's no longer valid for the new type
//     }));
//     setSelectedName(""); // Clear the dropdown selection
//   };

//   const validateFilters = () => {
//     if (filters.priceRange[0] >= filters.priceRange[1]) {
//       setError("Invalid price range");
//       return false;
//     }

//     setError(null);
//     return true;
//   };

//   const handleApply = () => {
//     if (!validateFilters()) return;

//     onApply(filters);
//     if (onClose) onClose();
//   };

//   const handleReset = () => {
//     setFilters({
//       vehicleType: "cars",
//       priceRange: [500, 5000],
//       distance: 10,
//       selectedVehicles: [],
//       fuelType: "All",
//       transmission: "All",
//     });
//     setSelectedName("");
//     setError(null);
//   };

//   const handleClose = () => {
//     if (onClose) {
//       onClose();
//     }
//   };

//   return (
//     <>
//       {/* Overlay - Click to close */}
//       <div
//         className="fixed inset-0 bg-black/40 z-40"
//         onClick={handleClose}
//       ></div>

//       {/* Right Side Drawer with Gap */}
//       <div
//         className="fixed bg-white shadow-lg rounded-xl z-50 overflow-y-auto p-6 border"
//         style={{
//           top: '80px',
//           right: '20px',
//           width: '375px',
//           height: '655px'
//         }}
//       >

//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
//           <button
//             onClick={handleClose}
//             className="text-gray-500 hover:text-gray-700 text-xl font-bold transition-colors"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Vehicle Type */}
//         <div className="mb-6">
//           <p className="font-medium mb-2">Vehicle Type</p>

//           <div className="flex gap-3">
//             {(["cars", "bikes"] as const).map((type) => (
//               <label key={type} className="flex items-center text-sm">
//                 <input
//                   type="radio"
//                   name="vehicleType"
//                   checked={filters.vehicleType === type}
//                   onChange={() => handleVehicleTypeChange(type)}
//                   className="mr-2"
//                 />
//                 {type.toUpperCase()}
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Price Range */}
//         <div className="mb-6">
//           <p className="font-medium mb-2">Price Range</p>

//           <input
//             type="range"
//             min={50}
//             max={20000}
//             value={filters.priceRange[1]}
//             onChange={(e) =>
//               handleFilterChange("priceRange", [
//                 50,
//                 Number(e.target.value),
//               ])
//             }
//             className="w-full accent-blue-600"
//           />

//           <div className="flex justify-between text-sm text-gray-600 mt-1">
//             <span>₹50</span>
//             <span>₹{filters.priceRange[1]}</span>
//           </div>
//         </div>

//         {/* Distance */}
//         <div className="mb-6">
//           <p className="font-medium mb-2">Distance</p>

//           <input
//             type="range"
//             min={1}
//             max={50}
//             value={filters.distance}
//             onChange={(e) =>
//               handleFilterChange("distance", Number(e.target.value))
//             }
//             className="w-full accent-blue-600"
//           />

//           <div className="flex justify-between text-sm text-gray-600 mt-1">
//             <span>1 km</span>
//             <span>{filters.distance} km</span>
//           </div>
//         </div>

//         {/* Names Dropdown */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Vehicle Name</label>

//           <select
//             className="w-full border rounded-md px-3 py-2 text-sm"
//             value={selectedName}
//             onChange={(e) => {
//               setSelectedName(e.target.value);
//               handleFilterChange("selectedVehicles", [e.target.value]);
//             }}
//           >
//             <option value="">Select</option>
//             {getNameOptions().map((name) => (
//               <option key={name} value={name}>{name}</option>
//             ))}
//           </select>
//         </div>

//         {/* Fuel */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Fuel</label>
//           <select
//             className="w-full border rounded-md px-3 py-2 text-sm"
//             value={filters.fuelType}
//             onChange={(e) => handleFilterChange("fuelType", e.target.value)}
//           >
//             <option>All</option>
//             <option>Petrol</option>
//             <option>Diesel</option>
//             <option>Electric</option>
//             <option>CNG</option>
//             <option>Hybrid</option>
//           </select>
//         </div>

//         {/* Transmission */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Transmission</label>
//           <select
//             className="w-full border rounded-md px-3 py-2 text-sm"
//             value={filters.transmission}
//             onChange={(e) =>
//               handleFilterChange("transmission", e.target.value)
//             }
//           >
//             <option>All</option>
//             <option>Manual</option>
//             <option>Automatic</option>
//           </select>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 text-red-600 text-sm">
//             {error}
//           </div>
//         )}

//         {/* Apply Button */}
//         <button
//           onClick={handleApply}
//           className="w-full bg-gradient-to-r from-blue-900 to-blue-400 text-white py-2 rounded-md font-medium hover:opacity-90 transition"
//         >
//           Apply
//         </button>

//         {/* Reset */}
//         <button
//           onClick={handleReset}
//           className="w-full mt-3 text-blue-600 font-medium hover:underline"
//         >
//           Reset Filters
//         </button>

//         {/* Current Filter Display */}
//         <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
//           <p className="font-semibold mb-2">Current Filters:</p>
//           <p>Type: {filters.vehicleType.toUpperCase()}</p>
//           <p>Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</p>
//           <p>Distance: {filters.distance} km</p>
//           <p>Vehicle: {selectedName || "None"}</p>
//           <p>Fuel: {filters.fuelType}</p>
//           <p>Transmission: {filters.transmission}</p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default FilterCard;










import React, { useState, useEffect, useRef } from "react";
import carData from "../../pages/data/carData.json";
import bikeData from "../../pages/data/bikeData.json";

export interface FilterState {
  vehicleType: "cars" | "bikes";
  priceRange: [number, number];
  distance: number;
  selectedVehicles: string[];
  fuelType: string;
  transmission: string;
}

interface FilterCardProps {
  onApply: (filters: FilterState) => void;
  onClose?: () => void;
  initialFilters?: Partial<FilterState>;
}

const FilterCard: React.FC<FilterCardProps> = ({
  onApply,
  onClose,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<FilterState>({
    vehicleType: "cars",
    priceRange: [500, 5000],
    distance: 10,
    selectedVehicles: [],
    fuelType: "All",
    transmission: "All",
    ...initialFilters,
  });

  const [selectedName, setSelectedName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create vehicle names object from imported data
  const vehicleNames = {
    cars: carData.carBrands,
    bikes: bikeData.bikeBrands,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (onClose) onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const getNameOptions = () => {
    return vehicleNames[filters.vehicleType] || [];
  };

  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleVehicleTypeChange = (type: "cars" | "bikes") => {
    setFilters((prev) => ({
      ...prev,
      vehicleType: type,
      selectedVehicles: [],
    }));
    setSelectedName("");
  };

  const validateFilters = () => {
    if (filters.priceRange[0] >= filters.priceRange[1]) {
      setError("Invalid price range");
      return false;
    }

    setError(null);
    return true;
  };

  const handleApply = () => {
    if (!validateFilters()) return;

    onApply(filters);
    if (onClose) onClose();
  };

  const handleReset = () => {
    setFilters({
      vehicleType: "cars",
      priceRange: [500, 5000],
      distance: 10,
      selectedVehicles: [],
      fuelType: "All",
      transmission: "All",
    });
    setSelectedName("");
    setError(null);
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg z-50 border border-gray-200 animate-fadeIn"
    >
      {/* Mobile bottom sheet overlay */}
      <div className="sm:hidden fixed inset-0 bg-black/40 -z-10" onClick={onClose}></div>

      {/* Scrollable content container */}
      <div className="max-h-[80vh] sm:max-h-[600px] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filter</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Vehicle Type */}
        <div className="mb-6">
          <p className="font-medium mb-2">Vehicle Type</p>
          <div className="flex gap-3">
            {(["cars", "bikes"] as const).map((type) => (
              <label key={type} className="flex items-center text-sm">
                <input
                  type="radio"
                  name="vehicleType"
                  checked={filters.vehicleType === type}
                  onChange={() => handleVehicleTypeChange(type)}
                  className="mr-2"
                />
                {type.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <p className="font-medium mb-2">Price Range</p>
          <input
            type="range"
            min={50}
            max={20000}
            value={filters.priceRange[1]}
            onChange={(e) =>
              handleFilterChange("priceRange", [50, Number(e.target.value)])
            }
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>₹50</span>
            <span>₹{filters.priceRange[1]}</span>
          </div>
        </div>

        {/* Distance */}
        <div className="mb-6">
          <p className="font-medium mb-2">Distance</p>
          <input
            type="range"
            min={1}
            max={70}
            value={filters.distance}
            onChange={(e) =>
              handleFilterChange("distance", Number(e.target.value))
            }
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>1 km</span>
            <span>{filters.distance} km</span>
          </div>
        </div>

        {/* Names Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Vehicle Name</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={selectedName}
            onChange={(e) => {
              setSelectedName(e.target.value);
              handleFilterChange("selectedVehicles", [e.target.value]);
            }}
          >
            <option value="">Select</option>
            {getNameOptions().map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Fuel</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={filters.fuelType}
            onChange={(e) => handleFilterChange("fuelType", e.target.value)}
          >
            <option>All</option>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Electric</option>
            <option>CNG</option>
            <option>Hybrid</option>
          </select>
        </div>

        {/* Transmission */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Transmission</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={filters.transmission}
            onChange={(e) => handleFilterChange("transmission", e.target.value)}
          >
            <option>All</option>
            <option>Manual</option>
            <option>Automatic</option>
          </select>
        </div>

        {/* Error Message */}
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full bg-gradient-to-r from-blue-900 to-blue-400 text-white py-2 rounded-md font-medium hover:opacity-90 transition"
        >
          Apply
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full mt-3 text-blue-600 font-medium hover:underline"
        >
          Reset Filters
        </button>

        {/* Current Filter Display */}
        {/* <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <p className="font-semibold mb-2">Current Filters:</p>
          <p>Type: {filters.vehicleType.toUpperCase()}</p>
          <p>
            Price: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
          </p>
          <p>Distance: {filters.distance} km</p>
          <p>Vehicle: {selectedName || "None"}</p>
          <p>Fuel: {filters.fuelType}</p>
          <p>Transmission: {filters.transmission}</p>
        </div> */}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @media (max-width: 640px) {
          .animate-fadeIn {
            position: fixed !important;
            bottom: 0 !important;
            top: auto !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 1rem 1rem 0 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FilterCard;