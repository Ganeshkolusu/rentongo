
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   User,
//   CalendarDays,
//   ListChecks,
//   Languages,
//   Download,
//   Info,
//   Shield,
//   HelpCircle,
//   X,
//   Globe,
//   Ticket,
//   CoinsIcon,
//   LogInIcon,
// } from "lucide-react";
// import ProfileOption from "../components/profileOption";
// import ProfileCard from "../components/profilecard";

// import { useLanguageStore, Language } from "../../../store/languageStore";
// import Feedback from "pages/Feedback";

// const Profile: React.FC = () => {
//   const navigate = useNavigate();
//   const { currentLanguage, setLanguage } = useLanguageStore();

//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [showLanguageModal, setShowLanguageModal] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   const modalRef = useRef<HTMLDivElement | null>(null);
//   const triggerRef = useRef<HTMLButtonElement | null>(null);

//   const languages = [
//     { code: "en" as Language, name: "English" },
//     { code: "es" as Language, name: "Español" },
//     { code: "fr" as Language, name: "Français" },
//     { code: "de" as Language, name: "Deutsch" },
//     { code: "hi" as Language, name: "हिंदी" },
//     { code: "tel" as Language, name: "తెలుగు" },
//     { code: "tm" as Language, name: "தமிழ்" },
//     { code: "kn" as Language, name: "ಕನ್ನಡ" },
//   ];

//   // Close modals on ESC
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setShowProfileModal(false);
//         setShowLanguageModal(false);
//         setShowLogoutModal(false);
//       }
//     };
//     if (showProfileModal || showLanguageModal || showLogoutModal)
//       document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [showProfileModal, showLanguageModal, showLogoutModal]);

//   // Return focus to trigger after close
//   useEffect(() => {
//     if (!showProfileModal && triggerRef.current) triggerRef.current.focus();
//   }, [showProfileModal]);

//   const openProfile = (btn?: HTMLButtonElement | null) => {
//     if (btn) triggerRef.current = btn;
//     setShowProfileModal(true);
//   };

//   const handleLanguageChange = (lang: Language) => {
//     setLanguage(lang);
//     setShowLanguageModal(false);
//   };

//   const handleDownloadApp = () => {
//     const userAgent = navigator.userAgent || navigator.vendor;

//     if (/iPad|iPhone|iPod/.test(userAgent)) {
//       window.open("https://apps.apple.com/app/rentongo", "_blank");
//     } else if (/android/i.test(userAgent)) {
//       window.open(
//         "https://play.google.com/store/apps/details?id=com.rentongo",
//         "_blank"
//       );
//     } else {
//       alert(
//         "📱 Download our mobile app from:\n\n🍎 App Store (iOS)\n🤖 Google Play Store (Android)\n\nComing soon!"
//       );
//     }
//   };

//   const handleLogout = () => {
//     setShowLogoutModal(false);
//     navigate("/");
//   };

//   return (
//     <>
//       <div className="max-w-md mx-auto bg-white shadow-md rounded-xl mt-6 overflow-hidden">
//         <div className="px-4 py-3 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
//         </div>

//         <div className="divide-y divide-gray-100">
//           {/* Main Section */}
//           <ProfileOption
//             icon={User}
//             label="My Profile"
//             onClick={(e?: React.MouseEvent) => {
//               const btn = (e?.currentTarget as unknown) as HTMLButtonElement | null;
//               openProfile(btn);
//             }}
//           />

//           {/* <ProfileOption
//             icon={CalendarDays}
//             label="My Bookings"
//             onClick={() => navigate("/my-bookings")}
//           /> */}

//           {/* <ProfileOption
//             icon={ListChecks}
//             label="My Listing Bookings"
//             onClick={() => navigate("/my-listing-bookings")}
//           /> */}

//           <ProfileOption
//             icon={Languages}
//             label="Change Language"
//             onClick={() => setShowLanguageModal(true)}
//           />

//           <ProfileOption
//             icon={Download}
//             label="Download Our App"
//             onClick={handleDownloadApp}
//           />

//           {/* Subheader */}
//           <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
//             Support & Settings
//           </div>

//           {/* Support Section */}
//           <ProfileOption
//             icon={Shield}
//             label="Privacy Policy"
//             onClick={() => navigate("/privacy-policy")}
//           />

//           <ProfileOption
//             icon={Info}
//             label="About Us"
//             onClick={() => navigate("/about-us")}
//           />

//           <ProfileOption
//             icon={Ticket}
//             label="Support"
//             onClick={() => navigate("/Support-Ticket")}
//           />

//           <ProfileOption
//             icon={HelpCircle}
//             label="Help"
//             onClick={() => navigate("/help")}
//           />

//           <ProfileOption
//             icon={LogInIcon}
//             label="LogOut"
//             onClick={() => setShowLogoutModal(true)}
//           />
//         </div>
//       </div>

//       {/* Profile Modal */}
//       {showProfileModal && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           aria-labelledby="profile-modal-title"
//           className="fixed inset-0 z-50 flex items-center justify-center px-4"
//         >
//           <div
//             className="fixed inset-0 bg-black/40"
//             onClick={() => setShowProfileModal(false)}
//             aria-hidden="true"
//           />
//           <div
//             ref={modalRef}
//             className="relative z-10 max-w-md w-full mx-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <ProfileCard onClose={() => setShowProfileModal(false)} />
//           </div>
//         </div>
//       )}

//       {/* Language Selection Modal */}
//       {showLanguageModal && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           className="fixed inset-0 z-50 flex items-center justify-center px-4"
//         >
//           <div
//             className="fixed inset-0 bg-black/40"
//             onClick={() => setShowLanguageModal(false)}
//             aria-hidden="true"
//           />
//           <div
//             className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//               <div className="flex items-center gap-2">
//                 <Globe className="w-6 h-6 text-blue-600" />
//                 <h3 className="text-lg font-semibold text-gray-900">Change Language</h3>
//               </div>
//               <button
//                 onClick={() => setShowLanguageModal(false)}
//                 className="p-2 rounded-lg hover:bg-gray-100 transition"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="p-4 space-y-2">
//               {languages.map((lang) => (
//                 <button
//                   key={lang.code}
//                   onClick={() => handleLanguageChange(lang.code)}
//                   className={`w-full text-left px-4 py-3 rounded-lg transition ${currentLanguage === lang.code
//                     ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-semibold"
//                     : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700"
//                     }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <span>{lang.name}</span>
//                     {currentLanguage === lang.code && (
//                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                         <path
//                           fillRule="evenodd"
//                           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Logout Confirmation Modal */}
//       {showLogoutModal && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           className="fixed inset-0 z-50 flex items-center justify-center px-4"
//         >
//           <div
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm"
//             onClick={() => setShowLogoutModal(false)}
//             aria-hidden="true"
//           />
//           <div
//             className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="p-6">
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">Logout</h3>
//               <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
//               <div className="flex gap-3 justify-end">
//                 <button
//                   onClick={() => setShowLogoutModal(false)}
//                   className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
//                 >
//                   CANCEL
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="px-6 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition"
//                 >
//                   LOGOUT
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Profile;





import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  CalendarDays,
  ListChecks,
  Languages,
  Download,
  Info,
  Shield,
  HelpCircle,
  X,
  Globe,
  Ticket,
  CoinsIcon,
  LogInIcon,
} from "lucide-react";
import ProfileOption from "../components/profileOption";
import ProfileCard from "../components/profilecard";

import { useLanguageStore, Language } from "../../../store/languageStore";
// import { useTranslation } from "../../../lib/useTranslation";
import Feedback from "pages/Feedback";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentLanguage, setLanguage } = useLanguageStore();
  // const t = useTranslation();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const languages = [
    { code: "en" as Language, name: "English" },
    { code: "hi" as Language, name: "हिंदी" },
    { code: "tel" as Language, name: "తెలుగు" },
   
  ];

  // Close modals on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowProfileModal(false);
        setShowLanguageModal(false);
        setShowLogoutModal(false);
      }
    };
    if (showProfileModal || showLanguageModal || showLogoutModal)
      document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showProfileModal, showLanguageModal, showLogoutModal]);

  // Return focus to trigger after close
  useEffect(() => {
    if (!showProfileModal && triggerRef.current) triggerRef.current.focus();
  }, [showProfileModal]);

  const openProfile = (btn?: HTMLButtonElement | null) => {
    if (btn) triggerRef.current = btn;
    setShowProfileModal(true);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const handleDownloadApp = () => {
    const userAgent = navigator.userAgent || navigator.vendor;

    // Android Play Store Link
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.anonymous.rentongovehicle&pcampaignid=web_share";
    
    // iOS App Store Link (update this when iOS app is available)
    const appStoreUrl = "https://apps.apple.com/app/rentongovehicle"; // Update with actual App Store ID when available

    if (/iPad|iPhone|iPod/.test(userAgent)) {
      // iOS device - open App Store
      window.open(appStoreUrl, "_blank");
    } else if (/android/i.test(userAgent)) {
      // Android device - open Play Store
      window.open(playStoreUrl, "_blank");
    } else {
      // Desktop/other - open Play Store by default (most common)
      window.open(playStoreUrl, "_blank");
    }
  };

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Or clear specific items if you want to keep some data
    // localStorage.removeItem("userProfile");
    // localStorage.removeItem("userName");
    // localStorage.removeItem("userEmail");
    // localStorage.removeItem("contactNumber");
    // localStorage.removeItem("userId");
    // localStorage.removeItem("googleId");
    
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <>
      <div className="max-w-md mx-auto bg-white shadow-md rounded-xl mt-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">profile</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Main Section */}
          <ProfileOption
            icon={User}
            label='My Profile'
            onClick={(e?: React.MouseEvent) => {
              const btn = (e?.currentTarget as unknown) as HTMLButtonElement | null;
              openProfile(btn);
            }}
          />

          {/* <ProfileOption
            icon={CalendarDays}
            label={t('profile.myBookings')}
            onClick={() => navigate("/my-bookings")}
          /> */}

          {/* <ProfileOption
            icon={ListChecks}
            label={t('profile.myListingBookings')}
            onClick={() => navigate("/my-listing-bookings")}
          /> */}

          <ProfileOption
            icon={Languages}
            label='change Language'
            onClick={() => setShowLanguageModal(true)}
          />

          <ProfileOption
            icon={Download}
            label='download App'
            onClick={handleDownloadApp}
          />

          {/* Subheader */}
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
            support Settings
          </div>

          {/* Support Section */}
          <ProfileOption
            icon={Shield}
            label='privacy Policy'
            onClick={() => navigate("/privacy-policy")}
          />

          <ProfileOption
            icon={Info}
            label='about Us'
            onClick={() => navigate("/about-us")}
          />

          <ProfileOption
            icon={Ticket}
            label='support'
            onClick={() => navigate("/Support-Ticket")}
          />

          <ProfileOption
            icon={HelpCircle}
            label='help'
            onClick={() => navigate("/help")}
          />

          <ProfileOption
            icon={LogInIcon}
            label='logout'
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowProfileModal(false)}
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            className="relative z-10 max-w-md w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileCard onClose={() => setShowProfileModal(false)} />
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowLanguageModal(false)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">'profile.changeLanguage'</h3>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${currentLanguage === lang.code
                    ? "bg-blue-50 border-2 border-blue-500 text-blue-700 font-semibold"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">'modals.logout.title'</h3>
              <p className="text-gray-600 mb-6">'modals.logout.message'</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  'profile.cancel'
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition"
                >
                  'modals.logout.confirm'
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
