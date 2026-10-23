import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, Phone } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I book a vehicle?",
      answer:
        "Browse available vehicles on our Rental page, select your preferred vehicle, click 'Book Now', and follow the booking process. You can chat with the owner or call them directly to confirm your booking.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment gateway.",
    },
    {
      question: "How do I list my vehicle?",
      answer:
        "Click the 'Listing +' button in the navigation bar, select whether you want to list a car or auto, fill in the vehicle details, upload photos, and submit. Your listing will be live immediately.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, you can cancel your booking by contacting the vehicle owner directly. Cancellation policies may vary by owner. We recommend discussing cancellation terms before confirming your booking.",
    },
    {
      question: "How do I contact the vehicle owner?",
      answer:
        "Once you click 'Book Now' on a vehicle, you'll see chat and call options to contact the owner directly. You can discuss availability, pricing, and pickup details with them.",
    },
    {
      question: "Are the vehicles insured?",
      answer:
        "Vehicle insurance coverage varies by owner. We recommend discussing insurance details with the owner before booking. Many owners provide basic insurance coverage.",
    },
    {
      question: "What if I have an issue during my ride?",
      answer:
        "Contact our 24/7 support team immediately via phone or email. We're here to help resolve any issues quickly. You can also reach out to the vehicle owner directly.",
    },
    {
      question: "How do I change my language preference?",
      answer:
        "Click the language icon (globe) in the navigation bar and select your preferred language from the dropdown menu. The app supports English, Spanish, French, and German.",
    },
    {
      question: "How do reviews work?",
      answer:
        "After completing a ride, you'll receive a notification to give feedback. Your review helps other users make informed decisions and helps maintain quality on our platform.",
    },
    {
      question: "What are the requirements to list a vehicle?",
      answer:
        "You need valid vehicle registration, your contact information, photos of the vehicle, and rental pricing details. Additional documents like driving license and Aadhar card may be requested.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          <HelpCircle className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Help & Support</h1>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <a
            href="tel:+911800123456"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="p-3 bg-green-100 rounded-lg">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Call Us</p>
              <p className="font-semibold text-gray-900">1800-123-456</p>
            </div>
          </a>

          <a
            href="mailto:support@rentongo.com"
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Us</p>
              <p className="font-semibold text-gray-900">Support</p>
            </div>
          </a>

          <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Live Chat</p>
              <p className="font-semibold text-gray-900">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still need help?
          </h3>
          <p className="text-gray-700 mb-4">
            Our support team is available 24/7 to assist you with any questions or issues.
            Feel free to reach out via phone, email, or wait for our live chat feature.
          </p>
          <p className="text-sm text-gray-600">
            Average response time: <strong className="text-gray-900">Under 2 hours</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;