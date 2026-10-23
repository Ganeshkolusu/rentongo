import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
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
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-4">Last updated: October 21, 2025</p>
            <p className="text-gray-700 leading-relaxed">
              At RentOnGo Vehicle, we are committed to protecting your privacy and ensuring the
              security of your personal information. This Privacy Policy explains how we collect,
              use, and safeguard your data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Name, email address, and phone number</li>
              <li>Vehicle preferences and booking history</li>
              <li>Payment information (processed securely)</li>
              <li>Location data for nearby vehicle searches</li>
              <li>Reviews and feedback you provide</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>To process your vehicle bookings and reservations</li>
              <li>To communicate with you about your bookings</li>
              <li>To improve our services and user experience</li>
              <li>To send you important updates and notifications</li>
              <li>To prevent fraud and ensure platform security</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your personal information.
              Your data is encrypted during transmission and stored securely. We regularly review
              and update our security practices to maintain the highest level of protection.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data,
              please contact us at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 font-semibold">RentOnGo Vehicle Support</p>
              <p className="text-gray-700">Email: privacy@rentongo.com</p>
              <p className="text-gray-700">Phone: +91 1800-123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;