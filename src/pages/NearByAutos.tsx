// import React, { useState } from "react";
// import { Search } from "lucide-react";
// import AutoCard from "../components/ui/AutoCard";
// import { vehicles as vehicleData } from "./data/Vehicle";
// import FilterLogo from "../assets/icons/FilterLogo.png";
// import FilterCard from "../components/ui/FilterCard"; // ✅ import FilterCard
 
// const NearbyAutos: React.FC = () => {
//   const [searchText, setSearchText] = useState("");
//   const [autos] = useState(vehicleData.filter((v) => v.type === "auto"));
//   const [showFilter, setShowFilter] = useState(false); // ✅ Filter modal state
 
//   const filteredAutos = autos.filter(
//     (v) =>
//       v.name.toLowerCase().includes(searchText.toLowerCase()) ||
//       v.location?.toLowerCase().includes(searchText.toLowerCase())
//   );
 
//   return (
//     <>
//       <div
//         className={`bg-gray-50 min-h-screen p-6 flex flex-col transition-all duration-300 ${
//           showFilter ? "blur-sm" : ""
//         }`}
//       >
//         {/* Header with Search & Filter */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
//           <h2 className="text-2xl font-semibold text-gray-800">Nearby Autos</h2>
 
//           {/* Search + Filter Row */}
//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             {/* Search Bar */}
//             <div className="flex items-center bg-white border rounded-full px-3 py-2 w-full sm:w-64 shadow-sm">
//               <Search className="w-4 h-4 text-gray-500 mr-2" />
//               <input
//                 type="text"
//                 placeholder="Search by name or location..."
//                 className="flex-1 outline-none text-gray-700 text-sm"
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//               />
//             </div>
 
//             {/* Filter Button */}
//             <button
//               onClick={() => setShowFilter(true)} // ✅ opens modal
//               className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-semibold px-4 py-2 rounded-full shadow-sm hover:opacity-90 transition-all duration-200"
//             >
//               <img src={FilterLogo} alt="Filter" className="w-4 h-4" />
//               <span className="text-sm">Filter</span>
//             </button>
//           </div>
//         </div>
 
//         {/* Autos Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {filteredAutos.length > 0 ? (
//             filteredAutos.map((v) => <AutoCard key={v.id} vehicle={v} />)
//           ) : (
//             <p className="text-gray-500 col-span-full text-center">
//               No autos available.
//             </p>
//           )}
//         </div>
//       </div>
 
//       {/* ✅ Filter Modal */}
//       {showFilter && <FilterCard onApply={() => setShowFilter(false)} />}
//     </>
//   );
// };
 
// export default NearbyAutos;
 
 
export default {};