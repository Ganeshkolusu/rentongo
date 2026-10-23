import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeedbackModal from '../../components/FeedbackModal';

interface RideCompletionNotificationProps {
  rideId: string;
  vehicleName?: string;
  timePassed?: string;
}

const RideCompletionNotification: React.FC<RideCompletionNotificationProps> = ({
  rideId,
  vehicleName,
  timePassed = '6 min ago'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleGiveFeedback = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          <Car className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-900">
              Your Ride as been completed please give feedback.
            </h3>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{timePassed}</span>
          </div>
          <button
            onClick={handleGiveFeedback}
            className="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm text-center font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Give Feedback
          </button>
        </div>
      </div>

      {/* Feedback Modal - Mounted at root level */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicleId={rideId}
        vehicleName={vehicleName}
      />
    </div>
  );
};

export default RideCompletionNotification;