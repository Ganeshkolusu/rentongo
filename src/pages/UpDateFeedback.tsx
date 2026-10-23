import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Edit2, Star, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// ============================================================
// INTERFACES
// ============================================================
interface Review {
  _id: string;
  userId: string;
  vehicleId: string;
  rating: number;
  review?: string;
  reviewText?: string;
  comment?: string;
  feedback?: string;
  userName?: string;
  createdAt?: string;
}

interface LocationState {
  reviewId?: string;
  vehicleId?: string;
  reviewText?: string;
  rating?: number;
  isEditing?: boolean;
  existingReview?: Review;
  mode?: 'edit' | 'create';
}

const UpDateFeedback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string>("");

  const stars = [1, 2, 3, 4, 5];

  // ============================================================
  // INITIALIZE DATA FROM NAVIGATION STATE
  // ============================================================
  useEffect(() => {
    console.log("📋 Feedback page loaded with state:", state);

    if (state) {
      // Check if we're in edit mode
      if (state.isEditing || state.mode === 'edit' || state.existingReview) {
        setIsEditMode(true);
        
        // Set review ID
        const revId = state.reviewId || state.existingReview?._id;
        if (revId) {
          setReviewId(revId);
          console.log("✏️ Edit mode - Review ID:", revId);
        }

        // Set vehicle ID
        const vId = state.vehicleId || state.existingReview?.vehicleId;
        if (vId) {
          setVehicleId(vId);
        }

        // Set existing rating
        const existingRating = state.rating || state.existingReview?.rating;
        if (existingRating) {
          setRating(existingRating);
          console.log("⭐ Setting rating:", existingRating);
        }

        // Set existing feedback text
        const existingText = state.reviewText || 
                            state.existingReview?.review || 
                            state.existingReview?.reviewText || 
                            state.existingReview?.comment || 
                            state.existingReview?.feedback || 
                            "";
        setFeedback(existingText);
        console.log("📝 Setting feedback:", existingText);
      } else {
        // Create mode
        setIsEditMode(false);
        if (state.vehicleId) {
          setVehicleId(state.vehicleId);
        }
      }
    }
  }, [state]);

  // ============================================================
  // RATING MESSAGE HELPER
  // ============================================================
  const getRatingMessage = (rating: number): string => {
    if (rating === 5) return "Excellent! 🌟";
    if (rating === 4) return "Very Good! 👍";
    if (rating === 3) return "Good 😊";
    if (rating === 2) return "Could be better 😐";
    if (rating === 1) return "Needs improvement 😞";
    return "";
  };

  // ============================================================
  // SUBMIT HANDLER (CREATE NEW REVIEW)
  // ============================================================
  const handleSubmitNewReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting", {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please write your feedback before submitting", {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }

    if (!vehicleId) {
      toast.error("Vehicle ID is missing", {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("📤 Creating new review...");
      console.log("Vehicle ID:", vehicleId);
      console.log("Rating:", rating);
      console.log("Feedback:", feedback);

      // TODO: ADD YOUR API CALL HERE
      // Example:
      // const response = await fetch('https://api.rentongovehicle.com/createReview', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     vehicleId: vehicleId,
      //     rating: rating,
      //     review: feedback,
      //     userId: localStorage.getItem('userId'),
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("✅ Review submitted successfully!", {
        duration: 2000,
        position: 'top-right',
      });

      // Navigate back to vehicle details page
      setTimeout(() => {
        navigate(`/book-now/${vehicleId}`);
      }, 500);

    } catch (error: any) {
      console.error("❌ Error submitting review:", error);
      toast.error(`Error: ${error.message}`, {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // UPDATE HANDLER (EDIT EXISTING REVIEW)
  // ============================================================
  const handleUpdateReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating", {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please write your feedback", {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }

    if (!reviewId) {
      toast.error("Review ID is missing", {
        duration: 2000,
        position: 'top-right',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("✏️ Updating review...");
      console.log("Review ID:", reviewId);
      console.log("Rating:", rating);
      console.log("Feedback:", feedback);

      // TODO: ADD YOUR API CALL HERE
      // Example:
      // const myHeaders = new Headers();
      // myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      //
      // const urlencoded = new URLSearchParams();
      // urlencoded.append("review", feedback);
      // urlencoded.append("rating", rating.toString());
      //
      // const response = await fetch(
      //   `https://api.rentongovehicle.com/updateReview/${reviewId}`,
      //   {
      //     method: "PUT",
      //     headers: myHeaders,
      //     body: urlencoded,
      //   }
      // );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("✅ Review updated successfully!", {
        duration: 2000,
        position: 'top-right',
      });

      // Navigate back to vehicle details page
      setTimeout(() => {
        navigate(`/book-now/${vehicleId}`);
      }, 500);

    } catch (error: any) {
      console.error("❌ Error updating review:", error);
      toast.error(`Error: ${error.message}`, {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // MAIN SUBMIT HANDLER
  // ============================================================
  const handleSubmit = () => {
    if (isEditMode) {
      handleUpdateReview();
    } else {
      handleSubmitNewReview();
    }
  };

  // ============================================================
  // CANCEL HANDLER
  // ============================================================
  const handleCancel = () => {
    if (vehicleId) {
      navigate(`/book-now/${vehicleId}`);
    } else {
      navigate(-1);
    }
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* Feedback Box */}
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 relative">
          {/* Mode Indicator */}
          <div className="mb-4">
            {isEditMode ? (
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                ✏️ Edit Mode
              </div>
            ) : (
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✨ New Review
              </div>
            )}
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">
            {isEditMode ? "Edit Your Review" : "We value your feedback"}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-2">
            {isEditMode ? "Update your experience" : "Rate your experience with this vehicle"}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Your feedback helps other users make better decisions
          </p>

          {/* Star Rating */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Your Rating</p>
            <div className="flex items-center gap-2 mb-4">
              {stars.map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  disabled={isSubmitting}
                  className={`text-5xl sm:text-6xl transition-all ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  } hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Rating Message */}
            {rating > 0 && (
              <p className="text-base font-medium text-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-lg border border-yellow-200">
                {getRatingMessage(rating)}
              </p>
            )}
          </div>

          {/* Feedback Textarea */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Your Feedback</p>
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isSubmitting}
                className="w-full border-2 border-gray-300 rounded-xl p-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={6}
                placeholder="Share your experience with this vehicle. What did you like? What could be improved?"
              />
              {/* Edit button attached to textarea */}
              <button
                className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
                onClick={() => document.querySelector('textarea')?.focus()}
                disabled={isSubmitting}
              >
                <Edit2 size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {feedback.length}/500 characters
            </p>
          </div>

          {/* Encouragement Text */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-xl">💡</span>
              <span>
                Tell us about your experience - the more detail you provide, 
                the more helpful your review will be to others!
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 text-base font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || !feedback.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-base font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{isEditMode ? "Updating..." : "Submitting..."}</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Review" : "Submit Feedback"}</span>
              )}
            </button>
          </div>

          {/* Debug Info (Remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs font-mono">
              <p className="font-bold mb-2">🔍 Debug Info:</p>
              <p>Mode: {isEditMode ? 'Edit' : 'Create'}</p>
              <p>Review ID: {reviewId || 'N/A'}</p>
              <p>Vehicle ID: {vehicleId || 'N/A'}</p>
              <p>Rating: {rating}</p>
              <p>Feedback Length: {feedback.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpDateFeedback;