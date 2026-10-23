
import React, { useEffect } from "react";

import { Routes, Route } from "react-router-dom";
import { useNotificationStore } from "./store/notification.store";

// Layout
import Navbar from "./components/layout/NavBar";

// Pages
import Rental from "./pages/Rental";
import ChangeLocation from "./pages/ChangeLocation";
import ListCarPage from "./pages/ListCarPage";
import ListBikePage from "./pages/ListBikePage";
import Nearbycars from "./pages/NearByCars";
import NearbyBikes from "./pages/NearByBikes";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import VehicleHistory from "./pages/VehicleHistory";
import EditCarDetails from "./pages/EditCarDetails";
import BookNow from "./pages/BookNow";
import NotificationPage from "./features/profile/pages/notification";
import ProfilePage from "./features/profile/pages/profile";
import MyProfile from "./pages/MyProfile";
import MyBookings from "./pages/MyBookings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import Help from "./pages/Help";
import Feedback from "./pages/Feedback";
import Calendar from "./pages/Calendar";
import CalendarScreen from "./pages/CalendarScreen";

import CarDetails from "./pages/CarDetails";

import BikeDetails from "./pages/BikeDetails";

import ListedCars from "./pages/ListedCars";
import SubscriptionPage from "./pages/SubscriptionPage";
import ListedBikes from "./pages/ListedBikes";
import BookingDetail from "pages/BookingHistory";
import Register from "pages/Register";
import { useLocation } from "react-router-dom";
// import OwnerDashboard from "pages/OwnerDashboard";
// import { BookingProvider } from "./components/ui/BookingAcceptance";
// import BookingAcceptanceWithAPI from "./components/ui/BookingAcceptanceWrapper";
import SupportTicketsPage from "./components/ui/SupportTickets";
import RaiseTicketPage from "./components/ui/RaiseTicketPage";
import GlobalBookingModals from "./components/ui/GlobalBookingModals";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminVehicleApproval from "./pages/admin/AdminVehicleApproval";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";

const App: React.FC = () => {
  const location = useLocation();
  const { initializeSocket, disconnectSocket, fetchNotifications } = useNotificationStore();

  // Initialize notification socket when user is logged in
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      console.log('🔔 App: Initializing notification system for user:', userId);
      initializeSocket(userId);
      fetchNotifications(userId);
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [initializeSocket, disconnectSocket, fetchNotifications]);

  // Pages where navbar should NOT show
  const hideNavbarPaths = ["/", "/register"];

  const hideNavbar = hideNavbarPaths.includes(location.pathname) || location.pathname.startsWith("/admin");

  return (
    // <BookingProvider>
    <div className="min-h-screen bg-[#f8fafc]">


      {!hideNavbar && <Navbar />}


      <Routes>
        {/* Home & Rental */}
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />

        {/* <Route path="/" element={<Rental />} /> */}
        <Route path="/rental" element={<Rental />} />
        {/* <Route path="/owner-dashboard" element={<OwnerDashboard />} /> */}
        {/* List Vehicles */}
        <Route path="/list-car" element={<ProtectedRoute><ListCarPage /></ProtectedRoute>} />
        <Route path="/list-bike" element={<ProtectedRoute><ListBikePage /></ProtectedRoute>} />



        {/* Nearby Vehicles */}
        <Route path="/nearby-cars" element={<Nearbycars />} />
        <Route path="/nearby-bikes" element={<NearbyBikes />} />

        {/* Vehicle Details */}
        <Route path="/vehicle-details/:id" element={<VehicleDetailsPage />} />

        {/* Edit Vehicle Details */}
        <Route path="/Car-Details/:carId" element={<CarDetails />} />
        {/* <Route path="/Bike-Details/:bikeId" element={<BikeDetails />} /> */}
        <Route path="/Bike-Details/:bikeId" element={<BikeDetails />} />


        {/* Vehicle History & Booking */}
        <Route path="/vehicle-history/:vehicleName" element={<ProtectedRoute><VehicleHistory /></ProtectedRoute>} />
        <Route path="/vehicle-details/:vehicleName/edit/:bookingId" element={<ProtectedRoute><EditCarDetails /></ProtectedRoute>} />

        {/* Booking */}
        <Route path="/book-now/:id" element={<ProtectedRoute><BookNow /></ProtectedRoute>} />
        <Route path="/booking-detail/:vehicleId" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />

        {/* Profile & User */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/mybookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

        {/* Notifications & Feedback */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

        {/* Location */}
        <Route path="/change-location" element={<ProtectedRoute><ChangeLocation /></ProtectedRoute>} />

        {/* Support & Info */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/help" element={<Help />} />


        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />

        {/* Superadmin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminVehicleApproval />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
        </Route>
        <Route path="/listed" element={<ProtectedRoute><ListedCars /></ProtectedRoute>} />
        <Route path="/listed-bike" element={<ProtectedRoute><ListedBikes /></ProtectedRoute>} />



        <Route path="/Support-Ticket" element={<ProtectedRoute><SupportTicketsPage /></ProtectedRoute>} />
        <Route path="/Raise-Ticket" element={<ProtectedRoute><RaiseTicketPage /></ProtectedRoute>} />


        {/* <Route path="/notifications" element={<Notifications />} /> */}
        {/* <Route path="/reviews/:id" element={<VehicleReviews />} /> */}

        {/* Calendar */}
        <Route path="/calendar" element={<ProtectedRoute><Calendar onConfirm={() => console.log("Confirmed!")} /></ProtectedRoute>} />
        <Route path="/calendar-screen" element={<ProtectedRoute><CalendarScreen /></ProtectedRoute>} />
      </Routes>

      {/* Global Booking Modals - Shows on all screens */}
      <GlobalBookingModals />
    </div>
    // </BookingProvider>
  );
};

export default App;