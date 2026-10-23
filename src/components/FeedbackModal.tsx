import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useReviewStore } from '../store/review.store';
import Portal from './Portal';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleName = 'your booking'
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { addReview } = useReviewStore();

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;

    addReview({
      vehicleId,
      userName: "User", // In real app, get from auth store
      rating,
      location: "Kakinada", // In real app, get from location store
      comment: feedback,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
          {/* Header with close button */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-gray-900">Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h3 className="text-base font-semibold mb-1">
            We Value Your Feedback
          </h3>
          <p className="text-sm text-gray-600">
            Rate Your Experience With {vehicleName}
          </p>

          {/* Star Rating */}
          <div className="flex items-center justify-start gap-3 my-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none"
              >
                <svg 
                  className={`w-7 h-7 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                  viewBox="0 0 24 24"
                  fill={rating >= star ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </button>
            ))}
          </div>

          {/* Feedback Text Area */}
          <div className="mb-6 relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell Us About Experience..."
              className="w-full h-28 p-4 border border-gray-200 rounded-xl resize-none text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
            />
            <button className="absolute top-4 right-4 text-gray-400">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16 2H4C3 2 2 3 2 4V16C2 17 3 18 4 18H16C17 18 18 17 18 16V4C18 3 17 2 16 2ZM8 14H6V12L12 6L14 8L8 14ZM14 8L12 6L13.5 4.5L15.5 6.5L14 8Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* Submit Button or Success Message */}
          {showSuccess ? (
            <div className="flex items-center justify-center text-green-600 font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Feedback submitted successfully!
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full py-3 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white font-medium text-base rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
};

export default FeedbackModal;