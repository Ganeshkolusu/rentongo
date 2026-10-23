

import { useNavigate } from "react-router-dom";

interface BookingRejectModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onReject?: (reason: string) => void | Promise<void>;
}

const BookingRejectModal: React.FC<BookingRejectModalProps> = ({ isOpen, onClose, onReject }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = () => {
    navigate("/rental"); // ✅ navigates to Rental.tsx (make sure this route exists in App.tsx)
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-8 text-center transform transition-all duration-300">
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 bg-gradient-to-b from-[#0B0E92] to-[#69A6F0] rounded-full flex items-center justify-center">
            <span className="text-white text-6xl">☹️</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-snug">
          Sorry! your request was not accepted
        </h2>

        <button
          onClick={handleNavigate}
          className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold text-lg py-4 rounded-xl shadow-lg transition-all duration-200 active:scale-95"
        >
          Okay
        </button>
      </div>
    </div>


  );
};

export default BookingRejectModal;

