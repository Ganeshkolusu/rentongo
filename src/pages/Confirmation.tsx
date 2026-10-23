// src/pages/Confirmation.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { vehicles } from "./data/Vehicle";
import { Vehicle } from "../types/Vehicle";
import Button from "../components/ui/Button";
import CallModal from "../components/models/CallModel";
import { Star } from "lucide-react";

interface Review {
  user: string;
  rating: number;
  comment: string;
}

const dummyReviews: Review[] = [
  { user: "Manoj Kumar", rating: 5, comment: "Excellent vehicle and service!" },
  { user: "Rajeswari", rating: 4, comment: "Very comfortable ride." },
  { user: "Anil Sharma", rating: 3, comment: "Good, but could be better." },
];

const Confirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehicle: Vehicle | undefined = vehicles.find((v) => v.id === id);

  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  if (!vehicle) return <p className="p-8">Vehicle not found!</p>;

  const handleCall = () => {
    alert("Calling owner...");
  };

  return (
    <div className="relative">
      {/* Apply blur when modal is open */}
      <div
        className={`max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 transition duration-300 ${
          isCallModalOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {/* Left - Vehicle Image */}
        <div className="lg:col-span-1">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="rounded-xl w-full mb-4"
          />
          <div className="flex justify-center space-x-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
          </div>
        </div>

        {/* Middle - Info */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold">{vehicle.name}</h2>
          <p className="text-gray-600 text-lg mt-1">₹{vehicle.price}/hr</p>

          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex flex-col items-center p-2 border rounded-lg">
              <span>⚙️</span>
              <span className="text-sm mt-1">Automatic</span>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-lg">
              <span>🧍‍♂️</span>
              <span className="text-sm mt-1">5 Seaters</span>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-lg">
              <span>⛽</span>
              <span className="text-sm mt-1">Petrol</span>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-lg">
              <span>❄️</span>
              <span className="text-sm mt-1">AC</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-600 text-sm">
              Lorem ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <Button gradient onClick={() => setIsCallModalOpen(true)}>
              Call
            </Button>
            <Button variant="white" onClick={() => alert("Opening chat...")}>
              Chat
            </Button>
          </div>
        </div>

        {/* Right - Reviews */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold mb-4">Reviews</h3>
          <div className="space-y-4">
            {dummyReviews.map((review, idx) => (
              <div key={idx} className="border p-4 rounded-lg">
                <div className="flex justify-between font-semibold">
                  <span>{review.user}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        onCall={handleCall}
        vehicleName={vehicle.name}
      />
    </div>
  );
};

export default Confirmation;
