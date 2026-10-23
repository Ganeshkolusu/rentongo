import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Users, Award, MapPin } from "lucide-react";

const AboutUs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">About Us</h1>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] rounded-xl shadow-lg p-6 sm:p-8 mb-6 text-white">
          <h2 className="text-3xl font-bold mb-4">RentOnGo Vehicle</h2>
          <p className="text-lg opacity-90">
            Your trusted partner for vehicle rentals - connecting vehicle owners with riders
            since 2024.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              At RentOnGo Vehicle, we're revolutionizing the way people access transportation.
              Our mission is to make vehicle rentals simple, affordable, and accessible to
              everyone while empowering vehicle owners to earn from their unused assets.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Car className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Wide Selection</h3>
                <p className="text-sm text-gray-600">
                  From economy cars to luxury vehicles and autos for every need
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Users className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Community Driven</h3>
                <p className="text-sm text-gray-600">
                  Connecting local vehicle owners with riders in your community
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Award className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Verified Quality</h3>
                <p className="text-sm text-gray-600">
                  All vehicles verified and rated by our community
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <MapPin className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">24/7 Service</h3>
                <p className="text-sm text-gray-600">
                  Book anytime, anywhere with instant confirmation
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded in 2024, RentOnGo Vehicle was born from a simple observation: many vehicle
              owners have cars and autos sitting idle while countless people need affordable
              transportation. We created a platform that bridges this gap, making it easy for
              owners to list their vehicles and for riders to find the perfect ride.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Today, we're proud to serve thousands of users across multiple cities, facilitating
              thousands of rides every month. Our platform has helped vehicle owners earn extra
              income while providing riders with convenient, cost-effective transportation options.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Why Choose Us?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">✓</span>
                <span className="text-gray-700">
                  <strong>Transparent Pricing:</strong> No hidden fees, see exact costs upfront
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">✓</span>
                <span className="text-gray-700">
                  <strong>Secure Payments:</strong> Protected transactions with multiple payment options
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">✓</span>
                <span className="text-gray-700">
                  <strong>Customer Support:</strong> Dedicated support team available 24/7
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">✓</span>
                <span className="text-gray-700">
                  <strong>Flexible Bookings:</strong> Hourly, daily, or long-term rentals available
                </span>
              </li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">📧 Email: support@rentongo.com</p>
              <p className="text-gray-700">📞 Phone: +91 1800-123-4567</p>
              <p className="text-gray-700">📍 Address: Kakinada, Andhra Pradesh, India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;