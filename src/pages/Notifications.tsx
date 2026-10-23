import React from "react";
import { useNavigate } from "react-router-dom";
import carLogo from "../assets/icons/CarLogo.png";
import automaticLogo from "../assets/icons/automatic.jpeg";
import driverLogo from "../assets/icons/DriverLogo.png";
const Notifications: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Notifications</h1>

      {/* Feedback Notification */}
      <div className="bg-white border rounded-xl shadow-sm p-5 mb-5 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-4">
          <img src={carLogo} alt="Car Logo" className="w-12 h-12 rounded-md object-cover" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-gray-800 font-medium">
                Your Ride has been completed. Please give feedback.
              </p>
              <span className="text-sm text-gray-400">6 min ago</span>
            </div>
            <button
              onClick={() => navigate("/feedback")}
              className="mt-4 bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-all"
            >
              Give Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Booking Notification */}
      <div className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-4">
          <img src={carLogo} alt="Car Logo" className="w-12 h-12 rounded-md object-cover" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-gray-800 font-medium">Your car has been booked?</p>
              <span className="text-sm text-gray-400">6 min ago</span>
            </div>

            <div className="mt-3 text-gray-600">
              <p className="font-semibold text-gray-800 mb-3">Hyundai Verna</p>

              {/* Vehicle Details Icons - Vertical Layout */}
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <img src={automaticLogo} alt="Automatic" className="w-5 h-5" />
                  <span>Automatic</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={driverLogo} alt="Driver" className="w-5 h-5" />
                  <span>5 Seaters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⛽ Petrol</span>
                </div>
              </div>
            </div>

            {/* Buttons with same gradient color */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => navigate("/feedback")}
                className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-all"
              >
                ✓ Yes
              </button>
              <button
                className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-all"
              >
                ✗ No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;








