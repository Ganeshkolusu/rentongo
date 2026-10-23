import React, { useState } from "react";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { MapPin, Menu, X } from "lucide-react";
import { useLocation } from "../../store/location.context";
import { useNotificationStore } from "../../store/notification.store";
import SelectVehicleModal from "../../components/ui/selectvehiclemodal"; // adjust path

import RentOnGoLogo from "../../assets/icons/RentOnGoLogo.png";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { currentCity } = useLocation();
  const { unreadCount } = useNotificationStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = localStorage.getItem("role") === "admin";

  const navItems = [
    { name: "Rental", path: "/rental" },
    { name: "Listed", path: "/listed" },
    { name: "MyBookings", path: "/mybookings" },
    { name: "Profile", path: "/profile" },
    { name: "Notifications", path: "/notifications" },
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  // const handleVehicleSelect = (type: "car" | "auto" | "bike") => {
  const handleVehicleSelect = (type: "car" | "bike") => {
    setIsModalOpen(false);
    if (type === "car") navigate("/list-car");
    // else if (type === "auto") navigate("/list-auto");
    else if (type === "bike") navigate("/list-bike");
  };

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleNavigate("/rental")}
        >
          <img
            src={RentOnGoLogo}
            alt="RentOnGo Logo"
            className="object-contain w-[180px] sm:w-[214px] h-[48px] sm:h-[64px]"
          />
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <div
            className="flex items-center gap-1 text-gray-700 cursor-pointer hover:text-blue-600"
            onClick={() => handleNavigate("/change-location")}
          >
            <MapPin size={18} />
            <span className="text-sm font-medium">{currentCity}</span>
          </div>

          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigate(item.path)}
              className={`relative text-sm font-medium transition-all flex items-center gap-1 ${routerLocation.pathname === item.path
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
                }`}
            >
              {item.name}
              {item.name === "Notifications" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {routerLocation.pathname === item.path && (
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-600 rounded-full"></span>
              )}
            </button>
          ))}

          {/* Listing Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-all"
          >
            Listing +
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex items-center text-gray-700 hover:text-blue-600 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-white shadow-md border-t border-gray-100 px-6 py-4 animate-slide-down">
          <div
            className="flex items-center gap-2 mb-4 text-gray-700 cursor-pointer"
            onClick={() => handleNavigate("/change-location")}
          >
            <MapPin size={18} />
            <span className="text-sm font-medium">{currentCity}</span>
          </div>

          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.path)}
                className={`text-left text-sm font-medium flex items-center gap-2 ${routerLocation.pathname === item.path
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                  }`}
              >
                {item.name}
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={() => {
                setMenuOpen(false);
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-all w-fit"
            >
              Listing +
            </button>
          </div>
        </div>
      )}

      {/* Select Vehicle Modal */}
      <SelectVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleVehicleSelect}
      />
    </nav>
  );
};

export default Navbar;
