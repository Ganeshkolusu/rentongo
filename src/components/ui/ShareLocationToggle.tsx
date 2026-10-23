import React from "react";
import { Navigation, X } from "lucide-react";
import { useTrackingStore } from "../../store/tracking.store";

interface ShareLocationToggleProps {
  bookingId: string;
  ownerId: string;
}

const ShareLocationToggle: React.FC<ShareLocationToggleProps> = ({ bookingId, ownerId }) => {
  const { isSharing, sharingBookingId, startSharing, stopSharing, error } = useTrackingStore();
  const activeHere = isSharing && sharingBookingId === bookingId;

  const handleClick = () => {
    if (activeHere) {
      stopSharing();
    } else {
      startSharing(bookingId, ownerId, "renterApp");
    }
  };

  return (
    <div className="flex-1">
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-full font-semibold transition-colors ${
          activeHere
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white"
        }`}
      >
        {activeHere ? <X size={18} /> : <Navigation size={18} />}
        <span>{activeHere ? "Stop Sharing Location" : "Share My Location"}</span>
      </button>
      {error && <p className="text-xs text-red-500 mt-1 text-center">{error}</p>}
    </div>
  );
};

export default ShareLocationToggle;
