// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useListedAutosStore } from "../store/listedAutos.store";

// const ListAutoPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { addAuto } = useListedAutosStore();
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [formData, setFormData] = useState({
//     vehicleNumber: "",
//     ownerName: "",
//     contactNumber: "",
//     farePrice: "",
//     description: "",
//     photos: [] as File[],
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files);
//       setFormData((prev) => ({ ...prev, photos: filesArray }));
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validate required fields
//     if (!formData.vehicleNumber || !formData.ownerName || !formData.contactNumber || !formData.farePrice) {
//       alert("Please fill in all required fields");
//       return;
//     }
    
//     // Convert photos to URLs (in real app, upload to server)
//     const photoUrls = formData.photos.map((file) => URL.createObjectURL(file));
    
//     // Add auto to store
//     addAuto({
//       vehicleNumber: formData.vehicleNumber,
//       ownerName: formData.ownerName,
//       contactNumber: formData.contactNumber,
//       farePrice: formData.farePrice,
//       description: formData.description,
//       photos: photoUrls,
//     });
    
//     setShowSuccessModal(true);
//   };

//   const handleModalClose = () => {
//     setShowSuccessModal(false);
//     navigate("/auto");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl mx-auto">
//         <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
//             List your Auto
//           </h1>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Vehicle Number */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Vehicle Number
//               </label>
//               <input
//                 type="text"
//                 name="vehicleNumber"
//                 value={formData.vehicleNumber}
//                 onChange={handleInputChange}
//                 placeholder="AP05G634"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                 required
//               />
//             </div>

//             {/* Your Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Your Name
//               </label>
//               <input
//                 type="text"
//                 name="ownerName"
//                 value={formData.ownerName}
//                 onChange={handleInputChange}
//                 placeholder="Manoj Kumar"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                 required
//               />
//             </div>

//             {/* Contact Number */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Contact Number
//               </label>
//               <input
//                 type="tel"
//                 name="contactNumber"
//                 value={formData.contactNumber}
//                 onChange={handleInputChange}
//                 placeholder="123456797"
//                 pattern="[0-9]{10}"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                 required
//               />
//             </div>

//             {/* Fare Price */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Fare Price
//               </label>
//               <p className="text-xs text-gray-500 mb-2">
//                 Fare Price (per km / per ride)
//               </p>
//               <input
//                 type="number"
//                 name="farePrice"
//                 value={formData.farePrice}
//                 onChange={handleInputChange}
//                 placeholder="250"
//                 min="0"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                 required
//               />
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Description
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 placeholder="Auto Description"
//                 rows={4}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
//               />
//             </div>

//             {/* Add Photos */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Add Photos
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer">
//                 <input
//                   type="file"
//                   id="photo-upload"
//                   multiple
//                   accept="image/*"
//                   onChange={handlePhotoUpload}
//                   className="hidden"
//                 />
//                 <label
//                   htmlFor="photo-upload"
//                   className="cursor-pointer flex flex-col items-center"
//                 >
//                   <svg
//                     className="w-12 h-12 text-gray-400 mb-3"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                     />
//                   </svg>
//                   <span className="text-blue-600 font-medium">Add photos</span>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Photos: 0/4. Select a main image and add supporting pictures to highlight your Auto.
//                   </p>
//                 </label>
//               </div>
//               {formData.photos.length > 0 && (
//                 <p className="text-sm text-green-600 mt-2">
//                   {formData.photos.length} photo(s) selected
//                 </p>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg"
//             >
//               Post Now
//             </button>
//           </form>
//         </div>
//       </div>

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
//           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-auto text-center animate-scale-in">
//             <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
//               <svg
//                 className="w-10 h-10 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={3}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               Posted Successfully
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Your Listed cars will be visible to all users
//             </p>
//             <button
//               onClick={handleModalClose}
//               className="w-full bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all shadow-md"
//             >
//               Done
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ListAutoPage;
export default {};