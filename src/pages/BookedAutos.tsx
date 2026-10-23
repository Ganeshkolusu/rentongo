// import React, { useState, useRef, useEffect } from "react"; // <--- important
// import { useNavigate } from "react-router-dom";
// import { MoreVertical } from "lucide-react";
// import { useBookingStore } from "../store/booking.store";
// import { BookVehicleModal } from "../components/booking/BookVehicleModal";
// import BookingCard from "../components/BookingCard";
// import { Booking, VehicleType } from "../types/booking";
// import Auto from "../assets/images/Auto.png";

// const BookedAutos: React.FC = () => {
//   const navigate = useNavigate();
//   const { bookings, deleteBooking } = useBookingStore();
//   const [vehicleFilter, setVehicleFilter] = useState<"All" | "Car" | "Auto" | "Bike">("Auto");
//   const [showDeleteMenu, setShowDeleteMenu] = useState(false);
//   const [showBookingMenu, setShowBookingMenu] = useState<string | null>(null);
//   const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

//   const menuRef = useRef<HTMLDivElement>(null);
//   const bookingMenuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setShowDeleteMenu(false);
//       }
//       if (bookingMenuRef.current && !bookingMenuRef.current.contains(event.target as Node)) {
//         setShowBookingMenu(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);
  
//     const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//       const value = e.target.value as "All" | "Car" | "Auto" | "Bike";
//       setVehicleFilter(value);
  
//     switch (value) {
//       case "Car":
//         navigate("/booked-cars");
//         break;
//       case "Auto":
//         navigate("/booked-autos");
//         break;
//       case "Bike":
//         navigate("/booked-bikes");
//         break;
//       default:
//         navigate("/bookings");
//     }
//   };

//   const getStatusBadge = (status: string, onClick: () => void) => {
//     const baseClasses = "w-[120px] h-[35px] flex items-center justify-center rounded-lg font-semibold text-sm cursor-pointer transition";
//     switch (status) {
//       case "Booked":
//         return (
//           <button onClick={onClick} className={`${baseClasses} bg-green-100 text-green-700 hover:bg-green-200`}>
//             Booked
//           </button>
//         );
//       case "Cancelled":
//         return (
//           <button onClick={onClick} className={`${baseClasses} bg-red-100 text-red-700 hover:bg-red-200`}>
//             Cancelled
//           </button>
//         );
//       default:
//         return (
//           <button onClick={onClick} className={`${baseClasses} bg-gray-100 text-gray-700`}>
//             {status}
//           </button>
//         );
//     }
//   };

//   const filteredBookings =
//     vehicleFilter === "All"
//       ? bookings
//       : bookings.filter((b) => b.vehicleType === vehicleFilter);

//   const handleDeleteAll = () => {
//     if (!filteredBookings.length) {
//       alert("No bookings to delete");
//       return;
//     }
//     if (window.confirm(`Delete all ${filteredBookings.length} ${vehicleFilter} bookings?`)) {
//       filteredBookings.forEach((b) => deleteBooking(b.id!));
//       setShowDeleteMenu(false);
//       alert("Deleted successfully");
//     }
//   };

//   const handleDeleteBooking = (id: string, name: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (window.confirm(`Delete booking for ${name}?`)) {
//       deleteBooking(id);
//       setShowBookingMenu(null);
//       alert("Booking deleted successfully");
//     }
//   };

//   const handleViewDetails = (booking: Booking, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setShowBookingMenu(null);
//     alert(`Booking Details:\nVehicle: ${booking.vehicleName}\nPrice: ₹${booking.price}\nStart: ${booking.startDate} ${booking.startTime}\nEnd: ${booking.endDate || "N/A"} ${booking.endTime || ""}\nModel: ${booking.modelNo || "N/A"}\nStatus: ${booking.status}`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-semibold">Booked Vehicles</h2>

//         <div className="flex gap-3 items-center">
//           {/* Vehicle Filter Dropdown */}
//           <select value={vehicleFilter} onChange={handleVehicleChange} className="border rounded-md px-3 py-1">
//             <option value="All">All</option>
//             <option value="Car">Cars</option>
//             <option value="Auto">Autos</option>
//             <option value="Bike">Bikes</option>
//           </select>

//           {/* Delete All Dropdown */}
//           <div className="relative" ref={menuRef}>
//             <button className="p-2 rounded hover:bg-gray-100" onClick={() => setShowDeleteMenu(!showDeleteMenu)}>
//               <MoreVertical className="w-5 h-5 text-gray-600" />
//             </button>
//             {showDeleteMenu && (
//               <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
//                 <button onClick={handleDeleteAll} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg">
//                   Delete All {vehicleFilter === "All" ? "Bookings" : vehicleFilter}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Bookings List */}
//       <div className="flex flex-col gap-6">
//         {filteredBookings.length ? (
//           filteredBookings.map((booking) => (
//             <div
//               key={booking.id}
//               onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
//               className={`bg-white rounded-lg shadow flex gap-4 p-4 relative cursor-pointer ${selectedBooking === booking.id ? "ring-2 ring-blue-500" : ""}`}
//             >
//               <img src={booking.vehicleImage || Auto} alt={booking.vehicleName} className="w-32 h-32 object-cover rounded-lg" />

//               <div className="flex-1 flex flex-col justify-between relative">
//                 <div>
//                   <h3 className="text-lg font-semibold">{booking.vehicleName}</h3>
//                   <p className="text-blue-600 font-bold text-xl">₹{booking.price}</p>
//                   <p className="text-gray-600 text-sm">{booking.startDate} {booking.startTime} - {booking.endDate || "N/A"} {booking.endTime || ""}</p>
//                   <p className="text-gray-600 text-sm">Model: {booking.modelNo || "N/A"}</p>
//                 </div>

//                 {/* Status Toggle */}
//                 <div className="pt-2">
//                   {getStatusBadge(booking.status, () => {
//                     booking.status = booking.status === "Booked" ? "Cancelled" : "Booked";
//                     setSelectedBooking(booking.id + Math.random());
//                   })}
//                 </div>

//                 {/* Booking Dropdown */}
//                 <div className="absolute top-2 right-2" ref={bookingMenuRef}>
//                   <button onClick={(e) => { e.stopPropagation(); setShowBookingMenu(showBookingMenu === booking.id ? null : booking.id); }} className="p-1 hover:bg-gray-100 rounded">
//                     <MoreVertical className="w-5 h-5 text-gray-500" />
//                   </button>
//                   {showBookingMenu === booking.id && (
//                     <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-20">
//                       <button onClick={(e) => handleViewDetails(booking, e)} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">View Details</button>
//                       <button onClick={(e) => handleDeleteBooking(booking.id!, booking.vehicleName, e)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg border-t">Delete Booking</button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-gray-500">No {vehicleFilter === "All" ? "bookings" : vehicleFilter.toLowerCase()} found.</p>
//             <button onClick={() => navigate("/rental")} className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white px-6 py-3 rounded-lg mt-4 font-semibold hover:opacity-90 transition">
//               Browse Vehicles to Book
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// export default BookedAutos;
export default{};