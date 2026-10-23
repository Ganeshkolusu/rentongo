// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { MoreVertical } from "lucide-react";

// import AutoImage from "../assets/images/Auto.png";
// import CarLogo from "../assets/icons/CarLogo.png";
// import AutoLogo from "../assets/icons/AutoLogo.png";
// import BikeLogo from "../assets/icons/BikeLogo.png";
// import DriverLogo from "../assets/icons/DriverLogo.png";
// import FilterLogo from "../assets/icons/FilterLogo.png";
// import AvailabilityDateTimeModal from "../components/AvailabilityDateTimeModal";
// import { Vehicle } from "../types/Vehicle";
// import { useListedAutosStore } from "../store/listedAutos.store";
// import { useLocation } from "../store/location.context";
// import Petrol from "../assets/icons/Petrol.png";
// import Location from "../assets/icons/Location.png";
// import Search from "../assets/icons/Search.png";
// import FilterCard from "../components/ui/FilterCard";

// // Default autos
// const initialAutos: Vehicle[] = [
//   { id: "1", name: "Bajaj RE", price: 150, transmission: "Manual", fuel: "CNG", seats: 3, location: "Kakinada, Main Road", rating: 4.0, available: true, image: AutoImage, type: "auto", description: "A compact auto perfect for city rides." },
//   { id: "2", name: "Piaggio Ape", price: 160, transmission: "Manual", fuel: "Diesel", seats: 3, location: "Rajahmundry, Kotipalli Bus Stand", rating: 4.3, available: true, image: AutoImage, type: "auto", description: "A compact auto perfect for city rides." },
//   { id: "3", name: "TVS King", price: 155, transmission: "Manual", fuel: "CNG", seats: 3, location: "Vijayawada, MG Road", rating: 4.1, available: true, image: AutoImage, type: "auto", description: "A compact auto perfect for city rides." },
//   { id: "4", name: "Mahindra Alfa", price: 165, transmission: "Manual", fuel: "Diesel", seats: 3, location: "Visakhapatnam, Dwaraka Nagar", rating: 4.4, available: true, image: AutoImage, type: "auto", description: "A compact auto perfect for city rides." },
// ];

// const ListedAutos: React.FC = () => {
//   const [showCalendarModal, setShowCalendarModal] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

//   const navigate = useNavigate();
//   const { currentCity } = useLocation();
//   const { autos: userAutos, deleteAuto } = useListedAutosStore();

//   const [autos, setAutos] = useState<Vehicle[]>(initialAutos);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedList, setSelectedList] = useState<"cars" | "autos" | "bikes">("autos");
//   const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
//   const [showFilter, setShowFilter] = useState(false);

//   // ✅ Merge default + user autos
//   const allAutos = useMemo(() => {
//     const userAutosFormatted: Vehicle[] = userAutos.map((auto) => ({
//       id: auto.id,
//       name: `Auto ${auto.vehicleNumber}`,
//       price: parseFloat(auto.farePrice) || 0,
//       transmission: (auto as any).transmission || "Manual",
//       fuel: (auto as any).fuel || "CNG",
//       seats: 3,
//       location: `${(auto as any).city || "Unknown"}, ${(auto as any).street || "Unknown"}`,
//       rating: auto.rating || 0,
//       available: true,
//       image: auto.photos?.[0] || AutoImage,
//       type: "auto",
//       description: (auto as any).description || "No description available",
//     }));

//     const allVehicles = [...userAutosFormatted, ...autos];

//     return allVehicles.filter((vehicle) => {
//       const vehicleCity = vehicle.location?.split(",")[0].trim() || "";
//       return vehicleCity.toLowerCase() === currentCity.toLowerCase();
//     });
//   }, [userAutos, autos, currentCity]);

//   const filteredAutos = allAutos.filter((auto) =>
//     auto.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const dropdownIcon =
//     selectedList === "cars" ? CarLogo : selectedList === "autos" ? AutoLogo : BikeLogo;

//   // ✅ FIXED handleStatusChange
//   const handleStatusChange = (index: number, value: string) => {
//     const updatedAutos = [...autos];
//     const vehicle = updatedAutos[index];
//     const isNowAvailable = value === "Available";

//     vehicle.available = isNowAvailable;
//     setAutos(updatedAutos);

//     if (!isNowAvailable) {
//       // ✅ Show calendar when "Not Available" selected
//       setSelectedVehicle(vehicle);
//       setShowCalendarModal(true);
//     }
//   };

//   const handleEdit = (vehicle: Vehicle) => {
//     navigate("/Car-Details", {
//       state: {
//         carData: vehicle,
//         openEditForm: true,
//       },
//     });
//     setMenuOpenIndex(null);
//   };

//   const handleDeleteVehicle = (vehicle: Vehicle) => {
//     const confirmDelete = window.confirm(`Delete ${vehicle.name}?`);
//     if (confirmDelete) {
//       if (vehicle.id) deleteAuto(vehicle.id);
//       else setAutos(autos.filter((a) => a.name !== vehicle.name));
//       alert(`${vehicle.name} deleted.`);
//     }
//     setMenuOpenIndex(null);
//   };

//   const handleMenuToggle = (index: number) =>
//     setMenuOpenIndex(menuOpenIndex === index ? null : index);

//   const handleAutoClick = (vehicle: Vehicle) =>
//     navigate(`/vehicle-details/${vehicle.name.toLowerCase().replace(/\s+/g, "-")}`);

//   return (
//     <>
//       <div
//         className={`p-4 sm:p-6 bg-gray-50 min-h-screen transition-all duration-300 ${
//           showCalendarModal ? "blur-sm" : ""
//         }`}
//       >
//         {/* Top Controls */}
//         <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
//           <div className="flex items-center w-full md:w-[300px] h-[50px] border rounded-lg px-3">
//             <img src={dropdownIcon} alt="Dropdown Icon" className="w-[24px] h-[24px]" />
//             <select
//               className="flex-1 ml-2 border-none outline-none text-sm"
//               value={selectedList}
//               onChange={(e) => {
//                 const value = e.target.value as "cars" | "autos" | "bikes";
//                 setSelectedList(value);
//                 if (value === "cars") navigate("/listed");
//                 else if (value === "autos") navigate("/listed-autos");
//                 else navigate("/listed-bikes");
//               }}
//             >
//               <option value="cars">Listed Cars</option>
//               <option value="autos">Listed Autos</option>
//               <option value="bikes">Listed Bikes</option>
//             </select>
//           </div>

//           {/* Search + Filter */}
//           <div className="flex gap-2 w-full md:w-auto">
//             <div className="relative flex-1 md:w-[300px] h-[40px]">
//               <img
//                 src={Search}
//                 alt="Search"
//                 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
//               />
//               <input
//                 type="text"
//                 placeholder="Search"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full h-full rounded-full border pl-12 pr-4 focus:outline-none"
//               />
//             </div>

//             <button
//               onClick={() => setShowFilter(true)}
//               className="flex items-center gap-2 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-semibold px-4 py-1 rounded-md hover:opacity-100 transition-all"
//             >
//               <img src={FilterLogo} alt="Filter" className="w-6 h-6" />
//               Filter
//             </button>
//           </div>
//         </div>

//         <h2 className="text-3xl font-semibold mb-6">Listed Autos in {currentCity}</h2>

//         <div className="flex flex-col gap-6">
//           {filteredAutos.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500 text-lg mb-2">No autos listed in {currentCity}</p>
//               <p className="text-gray-400 text-sm">Try changing your location to see more vehicles</p>
//             </div>
//           ) : (
//             filteredAutos.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col lg:flex-row justify-between items-start bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition w-full max-w-full lg:max-w-[800px] cursor-pointer"
//                 onClick={() => handleAutoClick(item)}
//               >
//                 {/* Image */}
//                 <div className="w-full sm:w-[270px] h-[150px] sm:h-[200px] overflow-hidden rounded-lg flex-shrink-0">
//                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
//                 </div>

//                 {/* Details */}
//                 <div className="flex-1 mt-3 sm:mt-0 sm:ml-4">
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                     <h3 className="font-semibold text-lg sm:text-xl">{item.name}</h3>
//                     <span className="flex items-center justify-center w-[72px] h-[32px] text-gray-700 text-sm">
//                       ⭐ {item.rating}
//                     </span>
//                   </div>

//                   <p className="font-bold text-blue-600 text-2xl sm:text-3xl mt-2">₹{item.price}/km</p>

//                   <div className="flex flex-col gap-2 mt-4 text-gray-600 text-sm">
//                     <div className="flex items-center gap-2">
//                       <img src={DriverLogo} alt="Seats" className="w-[25px] h-[25px]" />
//                       <span>{item.seats} Seater</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <img src={Petrol} alt="Fuel" className="w-[25px] h-[25px]" />
//                       <span>{item.fuel}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <img src={Location} alt="Location" className="w-[25px] h-[25px]" />
//                       <span>{item.location}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Menu + Status */}
//                 <div className="flex flex-col items-end w-full lg:w-auto mt-3 lg:mt-0">
//                   <div className="flex items-center gap-2 justify-end">
//                     <select
//                       className={`text-sm font-medium px-2 py-1 rounded-lg border ${
//                         item.available
//                           ? "bg-green-100 text-green-700 border-green-300"
//                           : "bg-red-100 text-red-700 border-red-300"
//                       }`}
//                       value={item.available ? "Available" : "Not Available"}
//                       onChange={(e) => {
//                         e.stopPropagation();
//                         handleStatusChange(index, e.target.value);
//                       }}
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <option value="Available">Available</option>
//                       <option value="Not Available">Not Available</option>
//                     </select>

//                     <div className="relative">
//                       <button
//                         className="p-2 rounded hover:bg-gray-100"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleMenuToggle(index);
//                         }}
//                       >
//                          <MoreVertical className="w-5 h-5 text-gray-600" />
//                                               </button>
                        
//                                               {menuOpenIndex === index && (
//                                                 <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg border border-gray-100 z-10">
//                                                  <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleEdit(item);
//                             }}
//                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                           >
//                             Edit
//                           </button>

//                                                   <button
//                                                     onClick={(e) => {
//                                                       e.stopPropagation();
//                                                       handleDeleteVehicle(item);
//                                                     }}
//                                                     className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                                                   >
//                                                     Delete
//                                                   </button>
//                                                 </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

    //   {/* ✅ Calendar modal shows on "Not Available" */}
    //   {showCalendarModal && selectedVehicle && (
    //     <AvailabilityDateTimeModal
    //       isOpen={showCalendarModal}
    //       onClose={() => setShowCalendarModal(false)}
    //       onConfirm={(startDate, endDate, startTime, endTime) => {
    //         console.log("Unavailable period for:", selectedVehicle.name, {
    //           startDate,
    //           endDate,
    //           startTime,
    //           endTime,
    //         });
    //         setShowCalendarModal(false);
    //       }}
    //     />
    //   )}

//       {showFilter && <FilterCard onApply={() => setShowFilter(false)} />}
//     </>
//   );
// };

// export default ListedAutos;
export{};
