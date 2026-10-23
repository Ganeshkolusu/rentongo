import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Book,
  List,
  Globe,
  Download,
  Shield,
  Info,
  HelpCircle,
} from "lucide-react";

type Props = {
  selected?: string;
  onSelect?: (section: string) => void;
};

const ProfilePage: React.FC<Props> = ({ selected, onSelect }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "myProfile",
      icon: <User size={18} />,
      label: "My Profile",
      route: "/profile/my-profile",
    },
    { id: "myBookings", icon: <Book size={18} />, label: "My Bookings" },
    {
      id: "listingBookings",
      icon: <List size={18} />,
      label: "My Listing Bookings",
    },
    { id: "changeLanguage", icon: <Globe size={18} />, label: "Change Language" },
    { id: "downloadApp", icon: <Download size={18} />, label: "Download Our App" },
  ];

  const supportItems = [
    { id: "privacy", icon: <Shield size={18} />, label: "Privacy Policy" },
    { id: "about", icon: <Info size={18} />, label: "About Us" },
    { id: "help", icon: <HelpCircle size={18} />, label: "Help" },
  ];

  const handleClick = (item: { id?: string; route?: string }) => {
    if (item.route) {
      navigate(item.route);
      return;
    }
    if (item.id && onSelect) onSelect(item.id);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f8fafc] px-4">
      <div className="bg-white w-full max-w-[380px] rounded-2xl shadow-lg border border-gray-100 p-2">
        <h2 className="text-base font-semibold text-gray-800 mb-0">Profile</h2>

        {/* Menu Items */}
        <div className="divide-y divide-gray-100 mt-1">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 cursor-pointer transition ${
                selected === item.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-gray-800">
                <div className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white p-1.5 rounded-md">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-gray-400 text-lg">&gt;</span>
            </div>
          ))}
        </div>

        {/* Support & Settings */}
        <h3 className="mt-3 mb-1 text-xs font-semibold text-gray-500">
          Support & Settings
        </h3>

        <div className="divide-y divide-gray-100">
          {supportItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className="flex items-center justify-between py-2 px-5 rounded-lg hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-2 text-gray-800">
                <div className="bg-gradient-to-r from-[#0B0E92] to-[#69A6F0] text-white p-1.5 rounded-md">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-gray-400 text-lg">&gt;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
