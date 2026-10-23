
// import React, { useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Edit2, Star } from "lucide-react";
// import { useReviewStore } from "../store/review.store";
// import { useNotificationStore } from "../store/notification.store";


// const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl max-w-md w-full p-6">
//         <h2 className="text-xl font-semibold mb-4">Give Feedback</h2>


//         <div className="mb-4">
//           <p className="text-sm text-gray-600 mb-2">Rate your experience</p>
//           <div className="flex gap-2">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <button
//                 key={star}
//                 onClick={() => setRating(star)}
//                 className="text-3xl"
//               >
//                 {star <= rating ? "⭐" : "☆"}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Comment box */}
//         <div className="mb-6">
//           <p className="text-sm text-gray-600 mb-2">Comments</p>
//           <textarea
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
//             placeholder="Share your experience..."
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               onSubmit(rating, comment);
//               onClose();
//             }}
//             className="flex-1 py-2.5 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white rounded-lg font-medium"
//           >
//             Submit
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ✅ Main Feedback Page with Average Rating
// const Feedback = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { addReview } = useReviewStore();
//   const { deleteNotification } = useNotificationStore();

//   const vehicleId = searchParams.get("vehicleId") || "6901e279fc4e029e07c5f575";
//   const vehicleName = searchParams.get("vehicleName") || "Vehicle";
//   const vehicleType = searchParams.get("vehicleType") || "Car";
//   const reviewId = "6909e329d9c06ae981fa0965";

//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [existingReview, setExistingReview] = useState(null);

//   // ✅ NEW: Average Rating State
//   const [averageRating, setAverageRating] = useState(0);
//   const [totalReviews, setTotalReviews] = useState(0);
//   const [avgLoading, setAvgLoading] = useState(true);

//   // ✅ NEW: Fetch Average Rating
//   React.useEffect(() => {
//     const fetchAverageRating = async () => {
//       try {
//         setAvgLoading(true);
//         console.log("🔍 Fetching average rating...");
//         console.log("➡️ Vehicle ID:", vehicleId);
//         console.log("➡️ Vehicle Type:", vehicleType);

//       const requestOptions: RequestInit = {
//   method: "GET",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ rating, feedback }),
//   redirect: "follow",
// };

//         const url = `${API_BASE_URL}/getAverageRating?vechileType=${vehicleType}&vechileId=${vehicleId}`;
//         console.log("➡️ Average Rating API:", url);

//         const response = await fetch(url, requestOptions);
//         const data = await response.json();

//         console.log("📊 Average Rating Response Status:", response.status);

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const resultText = await response.text();
//         console.log("📦 Average Rating Raw Response:", resultText);

//         try {
//           const result = JSON.parse(resultText);
//           console.log("✅ Parsed Average Rating:", result);

//           // Handle different API response structures
//           if (result.averageRating !== undefined) {
//             setAverageRating(parseFloat(result.averageRating) || 0);
//             setTotalReviews(result.totalReviews || result.reviewCount || 0);
//           } else if (result.rating !== undefined) {
//             setAverageRating(parseFloat(result.rating) || 0);
//             setTotalReviews(result.count || 0);
//           } else {
//             setAverageRating(0);
//             setTotalReviews(0);
//           }
//         } catch (parseError) {
//           console.error("❌ JSON Parse Error:", parseError);
//         }
//       } catch (error) {
//         console.error("❌ Error fetching average rating:", error);
//       } finally {
//         setAvgLoading(false);
//       }
//     };

//     if (vehicleId) {
//       fetchAverageRating();
//     }
//   }, [vehicleId, vehicleType]);

//   // ✅ Fetch existing review on component mount
//   React.useEffect(() => {
//     const fetchReviewById = async () => {
//       try {
//         console.log("🔍 Fetching review by ID...");
//         console.log("➡️ Review ID:", reviewId);

//         const response = await fetch(
//           `https://api.rentongovehicle.com/getReviewById/${reviewId}`,
//           {
//             method: "GET",
//             redirect: "follow",
//           }
//         );

//         console.log("📊 API Response Status:", response.status);
//         console.log("📊 API Response OK:", response.ok);

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const resultText = await response.text();
//         console.log("📦 Raw API Response:", resultText);

//         try {
//           const result = JSON.parse(resultText);
//           console.log("✅ Parsed Review Data:", result);
//           setExistingReview(result);

//           if (result && result.rating) {
//             setRating(result.rating);
//             console.log("⭐ Pre-filled rating:", result.rating);
//           }
//           if (result && result.review) {
//             setFeedback(result.review);
//             console.log("💬 Pre-filled feedback:", result.review);
//           }
//         } catch (parseError) {
//           console.log("📄 Response is not JSON:", resultText);
//           console.log("⚠️ Parse Error:", parseError.message);
//         }
//       } catch (error) {
//         console.error("❌ Error fetching review:", error);
//         console.error("❌ Error message:", error.message);
//         console.error("❌ Error stack:", error.stack);
//       }
//     };

//     fetchReviewById();
//   }, [reviewId]);

//   // ✅ Handle modal submit
//   const handleModalSubmit = (modalRating, modalComment) => {
//     console.log("📝 Modal Submit:", { modalRating, modalComment });
//     setRating(modalRating);
//     setFeedback(modalComment);
//   };

//   // ✅ API Call Function
//   const handleSubmit = async () => {
//     console.log("🚀 Submit button clicked");
//     console.log("➡️ Current rating:", rating);
//     console.log("➡️ Current feedback:", feedback);

//     if (rating === 0) {
//       console.warn("⚠️ Validation failed: No rating selected");
//       alert("Please select a rating before submitting");
//       return;
//     }
//     if (!feedback.trim()) {
//       console.warn("⚠️ Validation failed: Empty feedback");
//       alert("Please write your feedback before submitting");
//       return;
//     }

//     setLoading(true);
//     console.log("⏳ Loading state: true");

//     try {
//       const myHeaders = new Headers();
//       myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

//       const urlencoded = new URLSearchParams();
//       urlencoded.append("userId", localStorage.getItem("userId") || "6901dcf9fc4e029e07c5f54e");
//       urlencoded.append("vechileType", vehicleType);
//       urlencoded.append("VechileId", vehicleId);
//       urlencoded.append("BookingId", localStorage.getItem("bookingId") || "68fe3755db13aaf8e5dcdd56");
//       urlencoded.append("review", feedback);
//       urlencoded.append("rating", rating.toString());

//       console.log("📤 Sending feedback to API...");
//       console.log("➡️ Payload:", Object.fromEntries(urlencoded.entries()));
//       console.log("➡️ API Endpoint: https://api.rentongovehicle.com/addReview");

//       const response = await fetch(`${API_BASE_URL}/addReview`, {
//         method: "POST",
//         headers: myHeaders,
//         body: urlencoded,
//         redirect: "follow",
//       });

//       console.log("📊 Submit Response Status:", response.status);
//       console.log("📊 Submit Response OK:", response.ok);

//       const resultText = await response.text();
//       console.log("📦 Submit API Response:", resultText);

//       if (response.ok) {
//         console.log("✅ Feedback submitted successfully!");
//         alert("✅ Feedback submitted successfully!");

//         addReview({
//           vehicleId,
//           userName: "User",
//           rating,
//           location: "Kakinada",
//           comment: feedback,
//         });

//         console.log("📍 Navigating to /notifications");
//         navigate("/notifications");
//       } else {
//         console.error("❌ API returned error status:", response.status);
//         alert("❌ Failed to submit feedback. Please try again.");
//       }
//     } catch (error) {
//       console.error("⚠️ Error submitting review:", error);
//       console.error("⚠️ Error message:", error.message);
//       console.error("⚠️ Error stack:", error.stack);
//       alert("Something went wrong while submitting feedback.");
//     } finally {
//       setLoading(false);
//       console.log("⏳ Loading state: false");
//     }
//   };

//   // ✅ NEW: Render Stars Function
//   const renderStars = () => {
//     const stars = [];
//     const fullStars = Math.floor(averageRating);
//     const hasHalfStar = averageRating % 1 >= 0.5;

//     for (let i = 1; i <= 5; i++) {
//       if (i <= fullStars) {
//         stars.push(<Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />);
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         stars.push(
//           <div key={i} className="relative inline-block">
//             <Star size={20} className="text-gray-300" />
//             <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
//               <Star size={20} className="fill-yellow-400 text-yellow-400" />
//             </div>
//           </div>
//         );
//       } else {
//         stars.push(
//           <Star key={i} size={20} className="text-gray-300" />
//         );
//       }
//     }
//     return stars;
//   };

//   return (
//     <div className="max-w-2xl mx-auto mt-10 px-4">
//       <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 relative">
//         {/* ✅ NEW: Average Rating Section */}
//         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-sm font-semibold text-gray-700 mb-1">
//                 Current Average Rating
//               </h3>
//               {avgLoading ? (
//                 <div className="animate-pulse">
//                   <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
//                   <div className="h-4 bg-gray-200 rounded w-32"></div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex items-center gap-2">
//                     <span className="text-3xl font-bold text-gray-800">
//                       {averageRating.toFixed(1)}
//                     </span>
//                     <div className="flex gap-0.5">
//                       {renderStars()}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-600 mt-1">
//                     Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
//                   </p>
//                 </>
//               )}
//             </div>
//             <div className="text-right">
//               <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
//                 <Star size={32} className="fill-yellow-400 text-yellow-400" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <h1 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">
//           We value your feedback
//         </h1>
//         <p className="text-base text-gray-600 mb-2">
//           Rate your experience with {vehicleName}
//         </p>
//         <p className="text-xs text-gray-500 mb-6">
//           Your feedback helps other users make better decisions
//         </p>

//         {/* Debug info - remove in production */}
//         {existingReview && (
//           <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
//             <p className="font-semibold text-blue-800">Existing Review Loaded</p>
//             <p className="text-blue-600">Review ID: {reviewId}</p>
//           </div>
//         )}

//         {/* Stars */}
//         <div className="flex items-center mb-6 justify-start">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               type="button"
//               className="absolute top-3 right-3 bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:bg-blue-700 transition"
//               onClick={() => setIsModalOpen(true)}
//             >
//               <Edit2 size={18} />
//             </button>
//           ))}
//         </div>

//         {/* Feedback textarea */}
//         <div className="relative mb-4">
//           <textarea
//             value={feedback}
//             onChange={(e) => setFeedback(e.target.value)}
//             className="w-full border border-gray-300 rounded-md p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-sm sm:text-base"
//             rows={4}
//             placeholder="Type your feedback here..."
//           />
//           <button
//             className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md hover:bg-blue-700 transition"
//             onClick={() => setIsModalOpen(true)}
//           >
//             <Edit2 size={16} />
//           </button>
//         </div>

//         <p className="text-gray-600 text-left mb-4 text-xs sm:text-sm">
//           Tell us about your experience
//         </p>

//         <div className="flex justify-center gap-3">
//           <button
//             onClick={() => navigate(`/book-now/${vehicleId}`, { state: { vehicleType } })}
//             className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-all shadow-md disabled:opacity-50"
//           >
//             {loading ? "Submitting..." : "Submit Feedback"}
//           </button>
//         </div>
//       </div>

//       {/* Feedback Modal */}
//       <FeedbackModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={handleModalSubmit}
//       />
//     </div>
//   );
// };

// export default Feedback;




// // import React, { useState, useEffect } from "react";
// // import { Edit2, Star, X, AlertCircle } from "lucide-react";

// // // ============================================
// // // FEEDBACK PAGE COMPONENT
// // // ============================================
// // const FeedbackPage = () => {
// //   const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));
// //   const [rating, setRating] = useState(0);
// //   const [feedback, setFeedback] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [existingReview, setExistingReview] = useState(null);
// //   const [averageRating, setAverageRating] = useState(0);
// //   const [totalReviews, setTotalReviews] = useState(0);
// //   const [avgLoading, setAvgLoading] = useState(true);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [userName, setUserName] = useState("User");
// //   const [showToast, setShowToast] = useState(false);
// //   const [toastMessage, setToastMessage] = useState("");

// //   // Get params from URL
// //   const vehicleId = searchParams.get("vehicleId") || "6901e279fc4e029e07c5f575";
// //   const vehicleName = searchParams.get("vehicleName") || "Vehicle";
// //   const vehicleType = searchParams.get("vehicleType") || "Car";
// //   const reviewId = searchParams.get("reviewId"); // Used to detect edit mode
// //   const isEditing = !!reviewId;

// //   // Fetch user profile name
// //   useEffect(() => {
// //     const fetchUserProfile = async () => {
// //       try {
// //         const userId = localStorage.getItem("userId") || "6901dcf9fc4e029e07c5f54e";
// //         const response = await fetch(`https://api.rentongovehicle.com/getUserProfile/${userId}`);
// //         if (response.ok) {
// //           const data = await response.json();
// //           setUserName(data.name || data.userName || "User");
// //         }
// //       } catch (error) {
// //         console.error("Error fetching user profile:", error);
// //       }
// //     };
// //     fetchUserProfile();
// //   }, []);

// //   // Fetch average rating
// //   useEffect(() => {
// //     const fetchAverageRating = async () => {
// //       try {
// //         setAvgLoading(true);
// //         const url = `${API_BASE_URL}/getAverageRating?vechileType=${vehicleType}&vechileId=${vehicleId}`;
// //         const response = await fetch(url);

// //         if (response.ok) {
// //           const result = await response.json();
// //           setAverageRating(parseFloat(result.averageRating || result.rating || 0));
// //           setTotalReviews(result.totalReviews || result.reviewCount || result.count || 0);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching average rating:", error);
// //       } finally {
// //         setAvgLoading(false);
// //       }
// //     };

// //     if (vehicleId) {
// //       fetchAverageRating();
// //     }
// //   }, [vehicleId, vehicleType]);

// //   // Fetch existing review for editing
// //   useEffect(() => {
// //     const fetchReviewById = async () => {
// //       if (!reviewId) return;

// //       try {
// //         const response = await fetch(`https://api.rentongovehicle.com/getReviewById/${reviewId}`);

// //         if (response.ok) {
// //           const result = await response.json();
// //           setExistingReview(result);
// //           setRating(result.rating || 0);
// //           setFeedback(result.review || result.reviewText || "");
// //         }
// //       } catch (error) {
// //         console.error("Error fetching review:", error);
// //       }
// //     };

// //     fetchReviewById();
// //   }, [reviewId]);

// //   // Toast notification helper
// //   const showToastNotification = (message) => {
// //     setToastMessage(message);
// //     setShowToast(true);
// //     setTimeout(() => setShowToast(false), 3000);
// //   };

// //   // Handle form submission - Works for BOTH create and update
// //   const handleSubmit = async () => {
// //     console.log("🚀 Submit clicked - Mode:", isEditing ? "UPDATE" : "CREATE");

// //     if (rating === 0) {
// //       alert("⚠️ Please select a rating before submitting");
// //       return;
// //     }
// //     if (!feedback.trim()) {
// //       alert("⚠️ Please write your feedback before submitting");
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       if (isEditing && reviewId) {
// //         // ========================================
// //         // UPDATE EXISTING REVIEW (PUT)
// //         // ========================================
// //         console.log("🔄 Updating review ID:", reviewId);

// //         const formdata = new FormData();

// //         // Set vehicle ID based on type
// //         if (vehicleType.toLowerCase() === "car") {
// //           formdata.append("CarId", vehicleId);
// //           formdata.append("AutoId", "");
// //           formdata.append("BikeId", "");
// //         } else if (vehicleType.toLowerCase() === "bike") {
// //           formdata.append("BikeId", vehicleId);
// //           formdata.append("AutoId", "");
// //           formdata.append("CarId", "");
// //         } else if (vehicleType.toLowerCase() === "auto") {
// //           formdata.append("AutoId", vehicleId);
// //           formdata.append("BikeId", "");
// //           formdata.append("CarId", "");
// //         }

// //         formdata.append("reviewText", feedback);
// //         formdata.append("rating", rating.toString());

// //         const response = await fetch(`https://api.rentongovehicle.com/updateReview/${reviewId}`, {
// //           method: "PUT",
// //           body: formdata,
// //         });

// //         console.log("📊 Update response:", response.status);

// //         if (response.ok) {
// //           console.log("✅ Review updated successfully");
// //           showToastNotification("✅ Review updated successfully!");
// //           setTimeout(() => {
// //             window.location.href = `/book/${vehicleId}?updated=${reviewId}`;
// //           }, 1000);
// //         } else {
// //           console.error("❌ Update failed:", response.status);
// //           alert("❌ Failed to update review. Please try again.");
// //         }
// //       } else {
// //         // ========================================
// //         // CREATE NEW REVIEW (POST)
// //         // ========================================
// //         console.log("➕ Creating new review");

// //         const myHeaders = new Headers();
// //         myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

// //         const urlencoded = new URLSearchParams();
// //         urlencoded.append("userId", localStorage.getItem("userId") || "6901dcf9fc4e029e07c5f54e");
// //         urlencoded.append("vechileType", vehicleType);
// //         urlencoded.append("VechileId", vehicleId);
// //         urlencoded.append("BookingId", "68fe3755db13aaf8e5dcdd56");
// //         urlencoded.append("review", feedback);
// //         urlencoded.append("rating", rating.toString());

// //         const response = await fetch(`${API_BASE_URL}/addReview`, {
// //           method: "POST",
// //           headers: myHeaders,
// //           body: urlencoded,
// //         });

// //         console.log("📊 Create response:", response.status);

// //         if (response.ok) {
// //           console.log("✅ Review created successfully");
// //           showToastNotification("✅ Feedback submitted successfully!");
// //           setTimeout(() => {
// //             window.location.href = `/book/${vehicleId}`;
// //           }, 1000);
// //         } else {
// //           console.error("❌ Create failed:", response.status);
// //           alert("❌ Failed to submit feedback. Please try again.");
// //         }
// //       }
// //     } catch (error) {
// //       console.error("❌ Error submitting review:", error);
// //       alert("❌ Something went wrong. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Render stars for average rating
// //   const renderStars = () => {
// //     const stars = [];
// //     const fullStars = Math.floor(averageRating);
// //     const hasHalfStar = averageRating % 1 >= 0.5;

// //     for (let i = 1; i <= 5; i++) {
// //       if (i <= fullStars) {
// //         stars.push(<Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />);
// //       } else if (i === fullStars + 1 && hasHalfStar) {
// //         stars.push(
// //           <div key={i} className="relative inline-block">
// //             <Star size={20} className="text-gray-300" />
// //             <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
// //               <Star size={20} className="fill-yellow-400 text-yellow-400" />
// //             </div>
// //           </div>
// //         );
// //       } else {
// //         stars.push(<Star key={i} size={20} className="text-gray-300" />);
// //       }
// //     }
// //     return stars;
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto mt-10 px-4 pb-10">
// //       <div className="bg-white shadow-md rounded-xl p-6 relative">
// //         {/* Average Rating Section */}
// //         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h3 className="text-sm font-semibold text-gray-700 mb-1">
// //                 Current Average Rating
// //               </h3>
// //               {avgLoading ? (
// //                 <div className="animate-pulse">
// //                   <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
// //                   <div className="h-4 bg-gray-200 rounded w-32"></div>
// //                 </div>
// //               ) : (
// //                 <>
// //                   <div className="flex items-center gap-2">
// //                     <span className="text-3xl font-bold text-gray-800">
// //                       {averageRating.toFixed(1)}
// //                     </span>
// //                     <div className="flex gap-0.5">{renderStars()}</div>
// //                   </div>
// //                   <p className="text-xs text-gray-600 mt-1">
// //                     Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
// //                   </p>
// //                 </>
// //               )}
// //             </div>
// //             <div className="text-right">
// //               <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
// //                 <Star size={32} className="fill-yellow-400 text-yellow-400" />
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Header - Simple, no mode indication */}
// //         <h1 className="text-2xl font-semibold mb-2 text-gray-800">
// //           📝 We value your feedback
// //         </h1>
// //         <p className="text-base text-gray-600 mb-2">
// //           Rate your experience with {vehicleName}
// //         </p>
// //         <p className="text-xs text-gray-500 mb-6">
// //           Your feedback helps other users make better decisions
// //         </p>

// //         {/* Rating Stars */}
// //         <div className="mb-6">
// //           <p className="text-sm font-medium text-gray-700 mb-3">Your Rating</p>
// //           <div className="flex items-center gap-2">
// //             {[1, 2, 3, 4, 5].map((star) => (
// //               <button
// //                 key={star}
// //                 type="button"
// //                 onClick={() => setRating(star)}
// //                 className={`text-5xl ${
// //                   rating >= star ? "text-yellow-400" : "text-gray-300"
// //                 } transition-all hover:scale-110 active:scale-95`}
// //               >
// //                 ★
// //               </button>
// //             ))}
// //             {rating > 0 && (
// //               <span className="ml-2 text-lg font-semibold text-gray-700">
// //                 {rating}.0
// //               </span>
// //             )}
// //           </div>
// //         </div>

// //         {/* Feedback Textarea */}
// //         <div className="mb-4">
// //           <label className="text-sm font-medium text-gray-700 mb-2 block">
// //             Your Review
// //           </label>
// //           <div className="relative">
// //             <textarea
// //               value={feedback}
// //               onChange={(e) => setFeedback(e.target.value)}
// //               className="w-full border-2 border-gray-300 rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
// //               rows={5}
// //               placeholder="Share your experience with this vehicle..."
// //             />
// //             <button
// //               type="button"
// //               className="absolute top-3 right-3 bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md hover:bg-blue-700 transition"
// //               onClick={() => setIsModalOpen(true)}
// //             >
// //               <Edit2 size={18} />
// //             </button>
// //           </div>
// //           <p className="text-xs text-gray-500 mt-2">
// //             {feedback.length}/500 characters
// //           </p>
// //         </div>

// //         {/* Action Buttons - Same button label for both modes */}
// //         <div className="flex gap-3 mt-6">
// //           <button
// //             onClick={() => window.location.href = `/book/${vehicleId}`}
// //             className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-all"
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             onClick={handleSubmit}
// //             disabled={loading}
// //             className="flex-1 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
// //           >
// //             {loading ? "Submitting..." : "Submit Feedback"}
// //           </button>
// //         </div>
// //       </div>

// //       {/* Toast Notification */}
// //       {showToast && (
// //         <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideIn z-50">
// //           {toastMessage}
// //         </div>
// //       )}

// //       {/* Edit Modal */}
// //       {isModalOpen && (
// //         <FeedbackModal
// //           isOpen={isModalOpen}
// //           onClose={() => setIsModalOpen(false)}
// //           initialRating={rating}
// //           initialComment={feedback}
// //           onSubmit={(newRating, newComment) => {
// //             setRating(newRating);
// //             setFeedback(newComment);
// //             setIsModalOpen(false);
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // // ============================================
// // // FEEDBACK MODAL COMPONENT
// // // ============================================
// // const FeedbackModal = ({ isOpen, onClose, initialRating, initialComment, onSubmit }) => {
// //   const [rating, setRating] = useState(initialRating || 0);
// //   const [comment, setComment] = useState(initialComment || "");

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //       <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
// //         <div className="flex justify-between items-center mb-4">
// //           <h2 className="text-xl font-semibold">Edit Feedback</h2>
// //           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
// //             <X size={24} />
// //           </button>
// //         </div>

// //         {/* Star Rating */}
// //         <div className="mb-4">
// //           <p className="text-sm text-gray-600 mb-2">Rate your experience</p>
// //           <div className="flex gap-2">
// //             {[1, 2, 3, 4, 5].map((star) => (
// //               <button
// //                 key={star}
// //                 onClick={() => setRating(star)}
// //                 className="text-4xl transition-all hover:scale-110"
// //               >
// //                 {star <= rating ? "⭐" : "☆"}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Comment box */}
// //         <div className="mb-6">
// //           <p className="text-sm text-gray-600 mb-2">Comments</p>
// //           <textarea
// //             value={comment}
// //             onChange={(e) => setComment(e.target.value)}
// //             className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             placeholder="Share your experience..."
// //           />
// //         </div>

// //         {/* Buttons */}
// //         <div className="flex gap-3">
// //           <button
// //             onClick={onClose}
// //             className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             onClick={() => onSubmit(rating, comment)}
// //             className="flex-1 py-2.5 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white rounded-lg font-medium hover:opacity-90"
// //           >
// //             Save Changes
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ============================================
// // // BOOK NOW PAGE COMPONENT (with Reviews)
// // // ============================================
// // const BookNowPage = () => {
// //   const [reviews, setReviews] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [highlightedReviewId, setHighlightedReviewId] = useState(null);
// //   const [menuOpen, setMenuOpen] = useState(null);

// //   const vehicleId = "6901e279fc4e029e07c5f575"; // Example vehicle ID
// //   const vehicleType = "Car";
// //   const vehicleName = "Toyota Camry";
// //   const currentUserId = localStorage.getItem("userId") || "6901dcf9fc4e029e07c5f54e";

// //   // Fetch reviews
// //   useEffect(() => {
// //     const fetchReviews = async () => {
// //       try {
// //         setLoading(true);
// //         const response = await fetch(
// //           `https://api.rentongovehicle.com/getReviews?vechileType=${vehicleType}&vechileId=${vehicleId}`
// //         );

// //         if (response.ok) {
// //           const data = await response.json();
// //           setReviews(data.reviews || []);

// //           // Check if coming from feedback page (updated review)
// //           const urlParams = new URLSearchParams(window.location.search);
// //           const updatedReviewId = urlParams.get('updated');
// //           if (updatedReviewId) {
// //             setHighlightedReviewId(updatedReviewId);
// //             setTimeout(() => {
// //               setHighlightedReviewId(null);
// //               // Clean URL
// //               window.history.replaceState({}, '', `/book/${vehicleId}`);
// //             }, 3000);
// //           }
// //         }
// //       } catch (error) {
// //         console.error("Error fetching reviews:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchReviews();
// //   }, [vehicleId, vehicleType]);

// //   const handleEditReview = (review) => {
// //     window.location.href = `/feedback?reviewId=${review._id}&vehicleId=${vehicleId}&vehicleName=${vehicleName}&vehicleType=${vehicleType}`;
// //   };

// //   const renderStars = (rating) => {
// //     return [...Array(5)].map((_, i) => (
// //       <Star
// //         key={i}
// //         size={16}
// //         className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
// //       />
// //     ));
// //   };

// //   return (
// //     <div className="max-w-4xl mx-auto p-6">
// //       <h1 className="text-3xl font-bold mb-6">Book {vehicleName}</h1>

// //       {/* Vehicle details would go here */}

// //       {/* Reviews Section */}
// //       <div className="mt-8">
// //         <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

// //         {loading ? (
// //           <div className="space-y-4">
// //             {[1, 2, 3].map((i) => (
// //               <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
// //                 <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
// //                 <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
// //                 <div className="h-3 bg-gray-300 rounded w-1/2"></div>
// //               </div>
// //             ))}
// //           </div>
// //         ) : reviews.length === 0 ? (
// //           <div className="bg-gray-50 rounded-lg p-8 text-center">
// //             <p className="text-gray-600">No reviews yet. Be the first to review!</p>
// //           </div>
// //         ) : (
// //           <div className="space-y-4">
// //             {reviews.map((review) => {
// //               const isCurrentUser = review.userId?._id === currentUserId;
// //               const isHighlighted = review._id === highlightedReviewId;

// //               return (
// //                 <div
// //                   key={review._id}
// //                   className={`bg-white rounded-lg p-5 shadow-md border-2 transition-all duration-500 ${
// //                     isHighlighted 
// //                       ? 'border-green-400 bg-green-50 shadow-green-200' 
// //                       : 'border-gray-200'
// //                   }`}
// //                 >
// //                   <div className="flex justify-between items-start mb-3">
// //                     <div className="flex items-center gap-3">
// //                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
// //                         {(review.userId?.name || review.userName || "U").charAt(0).toUpperCase()}
// //                       </div>
// //                       <div>
// //                         <h3 className="font-semibold text-gray-800">
// //                           {review.userId?.name || review.userName || "User"}
// //                           {isCurrentUser && (
// //                             <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
// //                               You
// //                             </span>
// //                           )}
// //                         </h3>
// //                         <div className="flex items-center gap-2 mt-1">
// //                           <div className="flex gap-0.5">
// //                             {renderStars(review.rating)}
// //                           </div>
// //                           <span className="text-sm text-gray-600">
// //                             {review.rating}.0
// //                           </span>
// //                         </div>
// //                       </div>
// //                     </div>

// //                     {/* Three-dot menu for current user's review */}
// //                     {isCurrentUser && (
// //                       <div className="relative">
// //                         <button
// //                           onClick={() => setMenuOpen(menuOpen === review._id ? null : review._id)}
// //                           className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
// //                         >
// //                           <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
// //                             <circle cx="10" cy="4" r="1.5"/>
// //                             <circle cx="10" cy="10" r="1.5"/>
// //                             <circle cx="10" cy="16" r="1.5"/>
// //                           </svg>
// //                         </button>

// //                         {/* Dropdown Menu */}
// //                         {menuOpen === review._id && (
// //                           <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10">
// //                             <button
// //                               onClick={() => handleEditReview(review)}
// //                               className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
// //                             >
// //                               <Edit2 size={14} />
// //                               Edit Review
// //                             </button>
// //                           </div>
// //                         )}
// //                       </div>
// //                     )}
// //                   </div>

// //                   <p className="text-gray-700 leading-relaxed">
// //                     {review.review || review.reviewText}
// //                   </p>

// //                   <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
// //                     <span>📍 {review.location || "Kakinada"}</span>
// //                     <span>📅 {new Date(review.createdAt).toLocaleDateString()}</span>
// //                     {isHighlighted && (
// //                       <span className="text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full animate-pulse">
// //                         ✓ Updated
// //                       </span>
// //                     )}
// //                   </div>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // // ============================================
// // // DEMO APP
// // // ============================================
// // export default function App() {
// //   const [currentPage, setCurrentPage] = useState("book");

// //   // Close menu when clicking outside
// //   useEffect(() => {
// //     const handleClickOutside = () => {
// //       const menus = document.querySelectorAll('[data-menu]');
// //       menus.forEach(menu => menu.classList.add('hidden'));
// //     };
// //     document.addEventListener('click', handleClickOutside);
// //     return () => document.removeEventListener('click', handleClickOutside);
// //   }, []);

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* Navigation */}
// //       <div className="bg-white shadow-sm border-b">
// //         <div className="max-w-6xl mx-auto px-6 py-4 flex gap-4">
// //           <button
// //             onClick={() => setCurrentPage("book")}
// //             className={`px-4 py-2 rounded-lg font-medium transition-all ${
// //               currentPage === "book"
// //                 ? "bg-blue-600 text-white"
// //                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
// //             }`}
// //           >
// //             Book Now Page
// //           </button>
// //           <button
// //             onClick={() => setCurrentPage("feedback")}
// //             className={`px-4 py-2 rounded-lg font-medium transition-all ${
// //               currentPage === "feedback"
// //                 ? "bg-blue-600 text-white"
// //                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
// //             }`}
// //           >
// //             Feedback Page
// //           </button>
// //         </div>
// //       </div>

// //       {/* Page Content */}
// //       {currentPage === "book" ? <BookNowPage /> : <FeedbackPage />}

// //       {/* Add CSS for animations */}
// //       <style>{`
// //         @keyframes slideIn {
// //           from { transform: translateX(100%); opacity: 0; }
// //           to { transform: translateX(0); opacity: 1; }
// //         }
// //         .animate-slideIn {
// //           animation: slideIn 0.3s ease-out;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }


















// // import React, { useState, useEffect } from "react";
// // import { useNavigate, useLocation, useSearchParams } from "react-router-dom";


// // import { Edit2, Star } from "lucide-react";
// // import { useReviewStore } from "../store/review.store";
// // import apiService from "../services/api.service";

// // // ✅ FeedbackModal Component
// // interface FeedbackModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   onSubmit: (rating: number, comment: string) => void;
// // }

// // const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
// //   const [rating, setRating] = useState(0);
// //   const [comment, setComment] = useState("");

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //       <div className="bg-white rounded-2xl max-w-md w-full p-6">
// //         <h2 className="text-xl font-semibold mb-4">Give Feedback</h2>

// //         {/* Star Rating */}
// //         <div className="mb-4">
// //           <p className="text-sm text-gray-600 mb-2">Rate your experience</p>
// //           <div className="flex gap-2">
// //             {[1, 2, 3, 4, 5].map((star) => (
// //               <button
// //                 key={star}
// //                 onClick={() => setRating(star)}
// //                 className="text-3xl"
// //               >
// //                 {star <= rating ? "⭐" : "☆"}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Comment box */}
// //         <div className="mb-6">
// //           <p className="text-sm text-gray-600 mb-2">Comments</p>
// //           <textarea
// //             value={comment}
// //             onChange={(e) => setComment(e.target.value)}
// //             className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
// //             placeholder="Share your experience..."
// //           />
// //         </div>

// //         {/* Buttons */}
// //         <div className="flex gap-3">
// //           <button
// //             onClick={onClose}
// //             className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium"
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             onClick={() => {
// //               onSubmit(rating, comment);
// //               onClose();
// //             }}
// //             className="flex-1 py-2.5 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white rounded-lg font-medium"
// //           >
// //             Submit
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ✅ Main Feedback Page with Average Rating
// // const Feedback: React.FC = () => {
// //   const navigate = useNavigate();
// //   const [searchParams] = useSearchParams();
// //   const { addReview } = useReviewStore();

// //   // Get params from URL
// //   const vehicleId = searchParams.get("vehicleId") || "6901e279fc4e029e07c5f575";
// //   const vehicleName = searchParams.get("vehicleName") || "Vehicle";
// //   const vehicleType = searchParams.get("vehicleType") || "Car";
// //   const userId = searchParams.get("userId") || "6901dcf9fc4e029e07c5f54e";

// //   // State management
// //   const [rating, setRating] = useState(0);
// //   const [feedback, setFeedback] = useState("");
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [existingReview, setExistingReview] = useState<any>(null);

// //   // Average Rating State
// //   const [averageRating, setAverageRating] = useState(0);
// //   const [totalReviews, setTotalReviews] = useState(0);
// //   const [avgLoading, setAvgLoading] = useState(true);

// //    const location = useLocation();
// // const bookingId = location.state?.bookingId;


// //   // ✅ Fetch Average Rating using API service
// //   useEffect(() => {
// //     const fetchAverageRating = async () => {
// //       if (!vehicleId) return;

// //       try {
// //         setAvgLoading(true);
// //         console.log("🔍 Fetching average rating...");
// //         console.log("➡️ Vehicle ID:", vehicleId);
// //         console.log("➡️ Vehicle Type:", vehicleType);


// // const result = await apiService.review.getAverageRating(vehicleId, vehicleType);
// // console.log("✅ Average Rating Response:", result);

// // // Normalize possible shapes of API response
// // const data = result?.data || result;

// // if (data?.averageRating !== undefined) {
// //   setAverageRating(parseFloat(data.averageRating) || 0);
// //   setTotalReviews(data.totalReviews || data.reviewCount || 0);
// // } else if (data?.rating !== undefined) {
// //   setAverageRating(parseFloat(data.rating) || 0);
// //   setTotalReviews(data.count || 0);
// // } else {
// //   setAverageRating(0);
// //   setTotalReviews(0);
// // }

// //       } catch (error) {
// //         console.error("❌ Error fetching average rating:", error);
// //         // Set defaults on error
// //         setAverageRating(0);
// //         setTotalReviews(0);
// //       } finally {
// //         setAvgLoading(false);
// //       }
// //     };

// //     fetchAverageRating();
// //   }, [vehicleId, vehicleType]);

// //   // ✅ Fetch existing review using API service
// //   useEffect(() => {
// //     const fetchReviewById = async () => {
// //       if (!vehicleId || !vehicleType) return;

// //       try {
// //         console.log("🔍 Fetching reviews for vehicle...");
// //         console.log("➡️ Vehicle ID:", vehicleId);
// //         console.log("➡️ Vehicle Type:", vehicleType);

// //         const result = await apiService.review.getReviewsByVehicle(vehicleId, vehicleType);

// //         console.log("✅ Fetched Reviews:", result);

// //         if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
// //           // Get the most recent review or user's review
// //           const userReview = result.data.find((r: any) => r.userId === userId);
// //           const reviewToUse = userReview || result.data[0];

// //           setExistingReview(reviewToUse);

// //           if (reviewToUse.rating) {
// //             setRating(reviewToUse.rating);
// //             console.log("⭐ Pre-filled rating:", reviewToUse.rating);
// //           }
// //           if (reviewToUse.review) {
// //             setFeedback(reviewToUse.review);
// //             console.log("💬 Pre-filled feedback:", reviewToUse.review);
// //           }
// //         }
// //       } catch (error) {
// //         console.error("❌ Error fetching review:", error);
// //       }
// //     };

// //     fetchReviewById();
// //   }, [vehicleId, vehicleType, userId]);

// //   // ✅ Handle modal submit
// //   const handleModalSubmit = (modalRating: number, modalComment: string) => {
// //     console.log("📝 Modal Submit:", { modalRating, modalComment });
// //     setRating(modalRating);
// //     setFeedback(modalComment);
// //   };

// //   // ✅ Submit review using API service
// //   const handleSubmit = async () => {
// //     console.log("🚀 Submit button clicked");
// //     console.log("➡️ Current rating:", rating);
// //     console.log("➡️ Current feedback:", feedback);
// //   if (!bookingId) {
// //   alert("Missing booking ID. Please try submitting feedback from your booking history.");
// //   return;
// // }

// //     // Validation
// //     if (rating === 0) {
// //       console.warn("⚠️ Validation failed: No rating selected");
// //       alert("Please select a rating before submitting");
// //       return;
// //     }
// //     if (!feedback.trim()) {
// //       console.warn("⚠️ Validation failed: Empty feedback");
// //       alert("Please write your feedback before submitting");
// //       return;
// //     }

// //     setLoading(true);
// //     console.log("⏳ Loading state: true");

// //     try {
// //  const reviewData = {
// //   userId,
// //   vehicleId,
// //   vehicleType,
// //   rating,
// //   comment: feedback,
// //   bookingId, // ✅ add this
// // };



// //       console.log("📤 Submitting review with data:", reviewData);

// //       const result = await apiService.review.createReview(reviewData);

// //       console.log("✅ Review submitted successfully:", result);
// //       alert("✅ Feedback submitted successfully!");

// //       // Update store
// //       addReview({
// //         vehicleId,
// //         userName: "User",
// //         rating,
// //         location: "Kakinada",
// //         comment: feedback,
// //       });

// //       console.log("📍 Navigating to /notifications");
// //       navigate("/notifications");
// //     } catch (error: any) {
// //       console.error("❌ Error submitting review:", error);
// //       alert(error.message || "Something went wrong while submitting feedback.");
// //     } finally {
// //       setLoading(false);
// //       console.log("⏳ Loading state: false");
// //     }
// //   };

// //   // ✅ Render Stars Function
// //   const renderStars = () => {
// //     const stars = [];
// //     const fullStars = Math.floor(averageRating);
// //     const hasHalfStar = averageRating % 1 >= 0.5;

// //     for (let i = 1; i <= 5; i++) {
// //       if (i <= fullStars) {
// //         stars.push(
// //           <Star
// //             key={i}
// //             size={20}
// //             className="fill-yellow-400 text-yellow-400"
// //           />
// //         );
// //       } else if (i === fullStars + 1 && hasHalfStar) {
// //         stars.push(
// //           <div key={i} className="relative inline-block">
// //             <Star size={20} className="text-gray-300" />
// //             <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
// //               <Star size={20} className="fill-yellow-400 text-yellow-400" />
// //             </div>
// //           </div>
// //         );
// //       } else {
// //         stars.push(
// //           <Star key={i} size={20} className="text-gray-300" />
// //         );
// //       }
// //     }
// //     return stars;
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto mt-10 px-4">
// //       <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 relative">
// //         {/* ✅ Average Rating Section */}
// //         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
// //           <div className="flex items-center justify-between">
// //             <div>
// //               <h3 className="text-sm font-semibold text-gray-700 mb-1">
// //                 Current Average Rating
// //               </h3>
// //               {avgLoading ? (
// //                 <div className="animate-pulse">
// //                   <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
// //                   <div className="h-4 bg-gray-200 rounded w-32"></div>
// //                 </div>
// //               ) : (
// //                 <>
// //                   <div className="flex items-center gap-2">
// //                     <span className="text-3xl font-bold text-gray-800">
// //                       {averageRating.toFixed(1)}
// //                     </span>
// //                     <div className="flex gap-0.5">
// //                       {renderStars()}
// //                     </div>
// //                   </div>
// //                   <p className="text-xs text-gray-600 mt-1">
// //                     Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
// //                   </p>
// //                 </>
// //               )}
// //             </div>
// //             <div className="text-right">
// //               <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
// //                 <Star size={32} className="fill-yellow-400 text-yellow-400" />
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <h1 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">
// //           We value your feedback
// //         </h1>
// //         <p className="text-sm sm:text-base text-gray-600 mb-2">
// //           Rate your experience with {vehicleName}
// //         </p>
// //         <p className="text-xs text-gray-500 mb-6">
// //           Your feedback helps other users make better decisions
// //         </p>

// //         {/* Debug info - remove in production */}
// //         {existingReview && (
// //           <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
// //             <p className="font-semibold text-blue-800">Existing Review Loaded</p>
// //             <p className="text-blue-600">Vehicle ID: {vehicleId}</p>
// //           </div>
// //         )}

// //         {/* Stars */}
// //         <div className="flex items-center mb-6 justify-start">
// //           {[1, 2, 3, 4, 5].map((star) => (
// //             <button
// //               key={star}
// //               type="button"
// //               onClick={() => setRating(star)}
// //               className={`text-4xl sm:text-5xl ${
// //                 rating >= star ? "text-yellow-400" : "text-gray-300"
// //               } transition-colors mx-0.5 sm:mx-1 hover:scale-110`}
// //             >
// //               ★
// //             </button>
// //           ))}
// //         </div>

// //         {/* Feedback textarea */}
// //         <div className="relative mb-4">
// //           <textarea
// //             value={feedback}
// //             onChange={(e) => setFeedback(e.target.value)}
// //             className="w-full border border-gray-300 rounded-md p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-sm sm:text-base"
// //             rows={4}
// //             placeholder="Type your feedback here..."
// //           />
// //           <button
// //             className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md hover:bg-blue-700 transition"
// //             onClick={() => setIsModalOpen(true)}
// //           >
// //             <Edit2 size={16} />
// //           </button>
// //         </div>

// //         <p className="text-gray-600 text-left mb-4 text-xs sm:text-sm">
// //           Tell us about your experience
// //         </p>

// //         <div className="flex justify-center gap-3">
// //           <button
// //             onClick={() => navigate("/notifications")}
// //             className="bg-white border-2 border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-50 transition-all"
// //           >
// //             Cancel
// //           </button>
// //           <button
// //             onClick={handleSubmit}
// //             disabled={loading}
// //             className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-all shadow-md disabled:opacity-50"
// //           >
// //             {loading ? "Submitting..." : "Submit Feedback"}
// //           </button>
// //         </div>
// //       </div>

// //       {/* Feedback Modal */}
// //       <FeedbackModal
// //         isOpen={isModalOpen}
// //         onClose={() => setIsModalOpen(false)}
// //         onSubmit={handleModalSubmit}
// //       />
// //     </div>
// //   );
// // };

// // export default Feedback;








import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useReviewStore } from "../store/review.store";
import { useNotificationStore } from "../store/notification.store";
import { API_BASE_URL, authHeader } from "../services/api.service";

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addReview } = useReviewStore();
  const { markFeedbackGiven } = useNotificationStore();

  // ✅ Get data from URL params (sent from notification)
  const vehicleId = searchParams.get("vehicleId");
  const vehicleName = decodeURIComponent(searchParams.get("vehicleName") || "Vehicle");
  const bookingId = searchParams.get("bookingId");
  const vehicleType = searchParams.get("vehicleType") || "Car";

  // States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Average Rating States
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgLoading, setAvgLoading] = useState(true);

  // Existing Review State
  const [existingReview, setExistingReview] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // ✅ Validation: Redirect if missing required params
  useEffect(() => {
    if (!vehicleId || !bookingId) {
      console.error("❌ Missing required params:", { vehicleId, bookingId });
      alert("Missing vehicle or booking information. Redirecting to notifications.");
      navigate("/notifications");
    }
  }, [vehicleId, bookingId, navigate]);

  // ✅ Fetch Average Rating
  useEffect(() => {
    const fetchAverageRating = async () => {
      if (!vehicleId) return;

      try {
        setAvgLoading(true);
        console.log("🔍 Fetching average rating for:", vehicleId);

        const url = `${API_BASE_URL}/getAverageRating?vechileType=${vehicleType}&vechileId=${vehicleId}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          console.log("⚠️ Average rating not available");
          setAverageRating(0);
          setTotalReviews(0);
          return;
        }

        const result = await response.json();
        console.log("✅ Average Rating Response:", result);

        // Handle different response structures
        if (result.averageRating !== undefined) {
          setAverageRating(parseFloat(result.averageRating) || 0);
          setTotalReviews(result.totalReviews || result.reviewCount || 0);
        } else if (result.rating !== undefined) {
          setAverageRating(parseFloat(result.rating) || 0);
          setTotalReviews(result.count || 0);
        }
      } catch (error) {
        console.error("❌ Error fetching average rating:", error);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        setAvgLoading(false);
      }
    };

    fetchAverageRating();
  }, [vehicleId, vehicleType]);

  // ✅ Check for existing review for this booking
  useEffect(() => {
    const checkExistingReview = async () => {
      if (!bookingId) return;

      try {
        setCheckingExisting(true);
        console.log("🔍 Checking for existing review for booking:", bookingId);

        const response = await fetch(
          `${API_BASE_URL}/getReviewByBookingId/${bookingId}`,
          { method: "GET" }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Existing review found:", result);

          setExistingReview(result);
          setRating(result.rating || 0);
          setFeedback(result.review || "");
        } else {
          console.log("📝 No existing review found");
          setExistingReview(null);
        }
      } catch (error) {
        console.error("❌ Error checking existing review:", error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingReview();
  }, [bookingId]);

  // ✅ Handle Submit
  const handleSubmit = async () => {
    console.log("🚀 Submitting feedback...");

    // Validation
    if (rating === 0) {
      alert("⭐ Please select a rating before submitting");
      return;
    }
    if (!feedback.trim()) {
      alert("💬 Please write your feedback before submitting");
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("❌ User not logged in. Please log in and try again.");
        setLoading(false);
        return;
      }

      const urlencoded = new URLSearchParams();
      urlencoded.append("userId", userId);
      urlencoded.append("vechileType", vehicleType);
      urlencoded.append("VechileId", vehicleId);
      urlencoded.append("BookingId", bookingId);
      urlencoded.append("review", feedback.trim());
      urlencoded.append("rating", rating.toString());

      console.log("📤 Payload:", Object.fromEntries(urlencoded.entries()));

      const response = await fetch(`${API_BASE_URL}/addReview`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", ...authHeader() },
        body: urlencoded,
      });

      console.log("📊 Response Status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Feedback submitted successfully!", result);

        // ✅ Add to local review store
        addReview({
          vehicleId,
          userName: "User",
          rating,
          location: "Kakinada",
          comment: feedback,
        });

        // ✅ CRITICAL: Mark feedback as given in notification store
        if (bookingId) {
          console.log("🎯 Marking feedback as given for booking:", bookingId);
          await markFeedbackGiven(bookingId);
        }

        // Show success state
        setSubmitSuccess(true);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/notifications");
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        alert("❌ Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("⚠️ Error submitting review:", error);
      alert("⚠️ Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render Stars for Average Rating
  const renderAverageStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star size={20} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={20} className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={20} className="text-gray-300" />);
      }
    }
    return stars;
  };

  // ✅ Show success screen
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to notifications...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Show loading screen while checking existing review
  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/notifications")}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {existingReview ? "Update Feedback" : "Give Feedback"}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Vehicle Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Feedback for</p>
              <h2 className="text-lg font-bold text-gray-800">{vehicleName}</h2>
            </div>
          </div>

          {/* Average Rating Section */}
          {avgLoading ? (
            <div className="animate-pulse p-4 bg-gray-50 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          ) : averageRating > 0 ? (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Current Average Rating
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-800">
                      {averageRating.toFixed(1)}
                    </span>
                    <div className="flex gap-0.5">{renderAverageStars()}</div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Star size={32} className="fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Existing Review Alert */}
        {existingReview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                You've already reviewed this booking
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can update your review below
              </p>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Rate Your Experience
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Your feedback helps other users make better decisions
          </p>

          {/* Star Rating */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              How would you rate this vehicle?
            </p>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-semibold text-gray-700">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              rows={5}
              placeholder="Tell us what you liked or what could be improved..."
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Help others by sharing your detailed experience
              </p>
              <p className="text-xs text-gray-400">
                {feedback.length}/500
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/notifications")}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || rating === 0 || !feedback.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  {existingReview ? "Update Feedback" : "Submit Feedback"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center">
            💡 Your review will be visible to other users and help improve the service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;