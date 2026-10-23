




// import React, { useState, useEffect } from "react";
// import { X, CheckCircle, AlertCircle } from "lucide-react";
// import apiService from "../../../services/api.service";

// interface ProfileCardProps {
//   onClose: () => void;
// }

// interface UserProfile {
//   name: string;
//   phone: string;
//   email: string;
//   image: string;
//   googleId?: string;
//   userId?: string;
//   latitude?: string;
//   longitude?: string;
//   fcmToken?: string;
// }

// const ProfileCard: React.FC<ProfileCardProps> = ({ onClose }) => {
//   const [profile, setProfile] = useState<UserProfile>({
//     name: "",
//     phone: "",
//     email: "",
//     image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
//     googleId: "",
//     userId: "",
//     latitude: "",
//     longitude: "",
//     fcmToken: "",
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
//   const [errorMessage, setErrorMessage] = useState("");

//   useEffect(() => {
//     loadProfileFromStorage();
//     getCurrentLocation();
//   }, []);

//   const loadProfileFromStorage = () => {
//     try {
//       console.log("🔍 Loading profile from localStorage...");

//       // Try to get saved profile first
//       const savedProfile = localStorage.getItem("userProfile");
//       if (savedProfile) {
//         const parsedProfile = JSON.parse(savedProfile);
//         console.log("✅ Found saved profile:", parsedProfile);
//         setProfile((prev) => ({ ...prev, ...parsedProfile }));
//         return;
//       }

//       // Fallback to individual localStorage items
//       const name = localStorage.getItem("userName") || localStorage.getItem("contactName") || "";
//       const phone = localStorage.getItem("contactNumber") || localStorage.getItem("mobilenumber") || localStorage.getItem("phoneNumber") || "";
//       const email = localStorage.getItem("userEmail") || "";
//       const userId = localStorage.getItem("userId") || localStorage.getItem("_id") || "";
//       const googleId = localStorage.getItem("googleId") || "";
//       const profilePic = localStorage.getItem("userProfileImage") || localStorage.getItem("profilePic") || "";

//       console.log("📋 Loaded from individual items:", { name, phone, email, userId, googleId });

//       setProfile((prev) => ({
//         ...prev,
//         name,
//         phone,
//         email,
//         googleId,
//         userId,
//         image: profilePic || prev.image
//       }));
//     } catch (error) {
//       console.error("❌ Error loading profile:", error);
//     }
//   };

//   const getCurrentLocation = () => {
//     const savedLat = localStorage.getItem("latitude");
//     const savedLng = localStorage.getItem("longitude");

//     if (savedLat && savedLng) {
//       setProfile((prev) => ({ ...prev, latitude: savedLat, longitude: savedLng }));
//       return;
//     }

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const lat = position.coords.latitude.toString();
//           const lng = position.coords.longitude.toString();
//           setProfile((prev) => ({ ...prev, latitude: lat, longitude: lng }));
//           localStorage.setItem("latitude", lat);
//           localStorage.setItem("longitude", lng);
//         },
//         () => {
//           const defaultLat = "17.512343";
//           const defaultLng = "78.500667";
//           setProfile((prev) => ({ ...prev, latitude: defaultLat, longitude: defaultLng }));
//         }
//       );
//     }
//   };

//   const getOrCreateGoogleId = (): string => {
//     let googleId = profile.googleId || localStorage.getItem("googleId");
//     if (!googleId) {
//       googleId = `google_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
//       localStorage.setItem("googleId", googleId);
//     }
//     return googleId;
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setProfile((prev) => ({ ...prev, [name]: value }));
//     setSaveStatus("idle");
//     setErrorMessage("");
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         setErrorMessage("Image size should be less than 5MB");
//         setSaveStatus("error");
//         return;
//       }

//       if (!file.type.startsWith("image/")) {
//         setErrorMessage("Please upload a valid image file");
//         setSaveStatus("error");
//         return;
//       }

//       const imageUrl = URL.createObjectURL(file);
//       setProfile((prev) => ({ ...prev, image: imageUrl }));
//       localStorage.setItem("userProfileImage", imageUrl);
//     }
//   };

//   const validateProfile = (): boolean => {
//     if (!profile.name.trim()) {
//       setErrorMessage("❌ Name is required");
//       setSaveStatus("error");
//       return false;
//     }
//     if (!profile.phone.trim()) {
//       setErrorMessage("❌ Phone number is required");
//       setSaveStatus("error");
//       return false;
//     }
//     const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
//     if (!phoneRegex.test(profile.phone)) {
//       setErrorMessage("❌ Invalid phone number (min 10 digits)");
//       setSaveStatus("error");
//       return false;
//     }
//     if (!profile.email.trim()) {
//       setErrorMessage("❌ Email is required");
//       setSaveStatus("error");
//       return false;
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(profile.email)) {
//       setErrorMessage("❌ Invalid email format");
//       setSaveStatus("error");
//       return false;
//     }
//     return true;
//   };

//   const handleSave = async () => {
//     if (!validateProfile()) return;

//     setIsLoading(true);
//     setSaveStatus("idle");
//     setErrorMessage("");

//     try {
//       const googleId = getOrCreateGoogleId();

//       // Get the actual user ID from localStorage or profile
//       const userId = profile.userId || localStorage.getItem("userId") || localStorage.getItem("_id");

//       if (!userId) {
//         throw new Error("User ID not found. Please log in again.");
//       }

//       const payload = {
//         googleId,
//         name: profile.name.trim(),
//         mobilenumber: profile.phone.trim(),
//         email: profile.email.trim(),
//         profilePic: profile.image,
//         latitude: profile.latitude || "17.512343",
//         longitude: profile.longitude || "78.500667",
//         platform: "web",
//       };

//       console.log("📡 Sending UPDATE request with userId:", userId);
//       console.log("📦 Payload:", payload);

//       // Call update API with correct user ID
//       const response = await apiService.user.updateUserProfile(userId, payload);

//       console.log("✅ Update API Response:", response);

//       // Save to localStorage with ALL possible key variations for mobile number
//       const profileToSave = {
//         name: payload.name,
//         phone: payload.mobilenumber,
//         email: payload.email,
//         profilePic: payload.profilePic,
//         googleId,
//         userId: userId,
//         latitude: payload.latitude,
//         longitude: payload.longitude,
//       };

//       // Save profile object
//       localStorage.setItem("userProfile", JSON.stringify(profileToSave));

//       // Save individual items (using multiple key variations)
//       localStorage.setItem("userName", payload.name);
//       localStorage.setItem("contactName", payload.name);

//       localStorage.setItem("userEmail", payload.email);

//       // Save phone number with ALL possible key names
//       localStorage.setItem("contactNumber", payload.mobilenumber);
//       localStorage.setItem("mobilenumber", payload.mobilenumber);
//       localStorage.setItem("phoneNumber", payload.mobilenumber);
//       localStorage.setItem("phone", payload.mobilenumber);

//       localStorage.setItem("userId", userId);
//       localStorage.setItem("_id", userId);
//       localStorage.setItem("googleId", googleId);
//       localStorage.setItem("latitude", payload.latitude);
//       localStorage.setItem("longitude", payload.longitude);

//       if (payload.profilePic) {
//         localStorage.setItem("userProfileImage", payload.profilePic);
//         localStorage.setItem("profilePic", payload.profilePic);
//       }

//       console.log("💾 All data saved to localStorage:", {
//         name: payload.name,
//         phone: payload.mobilenumber,
//         email: payload.email,
//         userId,
//         googleId
//       });

//       // Update local state with saved data
//       setProfile(prev => ({
//         ...prev,
//         name: payload.name,
//         phone: payload.mobilenumber,
//         email: payload.email,
//         userId: userId
//       }));

//       // SUCCESS UI
//       setSaveStatus("success");
//       setIsLoading(false);

//       setTimeout(() => onClose(), 1500);

//     } catch (err: any) {
//       console.error("❌ UPDATE API FAILED:", err);
//       setErrorMessage(err.message || "Update failed. Please try again.");
//       setSaveStatus("error");
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 relative">
//         <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 z-10" aria-label="Close">
//           <X size={22} />
//         </button>

//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
//         </div>

//         <div className="flex flex-col items-center mb-6">
//           <div className="relative group">
//             <img
//               src={profile.image}
//               alt="Profile"
//               className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 shadow-lg transition-transform group-hover:scale-105"
//             />
//             <label htmlFor="profilePic" className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full p-2.5 shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-110">
//               <input
//                 id="profilePic"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//                 className="hidden"
//                 disabled={isLoading}
//               />
//               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//               </svg>
//             </label>
//           </div>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
//             <input type="text" name="name" value={profile.name} onChange={handleChange} placeholder="Enter your full name" disabled={isLoading} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed" />
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number</label>
//             <input type="tel" name="phone" value={profile.phone} onChange={handleChange} placeholder="+91 1234567890" disabled={isLoading} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed" />
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
//             <input type="email" name="email" value={profile.email} onChange={handleChange} placeholder="your.email@example.com" disabled={isLoading} className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed" />
//           </div>

//           {errorMessage && saveStatus === "error" && (
//             <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
//               <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
//               <div className="flex-1">
//                 <p className="text-sm font-bold text-red-900 mb-1">Error</p>
//                 <p className="text-xs text-red-700 whitespace-pre-wrap">{errorMessage}</p>
//               </div>
//             </div>
//           )}

//           {saveStatus === "success" && (
//             <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
//               <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
//               <div>
//                 <p className="text-sm font-bold text-green-900 mb-1">Success!</p>
//                 <p className="text-xs text-green-700">Profile updated successfully! Closing...</p>
//               </div>
//             </div>
//           )}

//           <button onClick={handleSave} disabled={isLoading} className="w-full mt-6 py-3.5 text-white font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
//             {isLoading ? "Saving..." : "Save & Update"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfileCard;











import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle, AlertCircle, ChevronDown, Search } from "lucide-react";
import apiService from "../../../services/api.service";

interface ProfileCardProps {
  onClose: () => void;
}

interface UserProfile {
  name: string;
  phone: string;
  countryCode: string;
  email: string;
  image: string;
  googleId?: string;
  userId?: string;
  latitude?: string;
  longitude?: string;
  fcmToken?: string;
}

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { name: "Russia", code: "RU", dialCode: "+7", flag: "🇷🇺" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭" },
];

const ProfileCard: React.FC<ProfileCardProps> = ({ onClose }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    countryCode: "+91",
    email: "",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    googleId: "",
    userId: "",
    latitude: "",
    longitude: "",
    fcmToken: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfileFromStorage();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parsePhoneNumber = (phoneStr: string): { countryCode: string; phone: string } => {
    if (!phoneStr) return { countryCode: "+91", phone: "" };
    
    const cleanPhone = phoneStr.replace(/\s+/g, "");
    
    for (const country of COUNTRIES) {
      if (cleanPhone.startsWith(country.dialCode)) {
        return {
          countryCode: country.dialCode,
          phone: cleanPhone.substring(country.dialCode.length),
        };
      }
    }
    
    if (cleanPhone.startsWith("+")) {
      const match = cleanPhone.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        return { countryCode: match[1], phone: match[2] };
      }
    }
    
    return { countryCode: "+91", phone: cleanPhone };
  };

  const loadProfileFromStorage = () => {
    try {
      const savedProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const name = savedProfile.name || localStorage.getItem("userName") || localStorage.getItem("contactName") || "";
      const phone = savedProfile.phone || localStorage.getItem("contactNumber") || localStorage.getItem("mobilenumber") || localStorage.getItem("phoneNumber") || "";
      const email = savedProfile.email || localStorage.getItem("userEmail") || "";
      const userId = savedProfile.userId || localStorage.getItem("userId") || localStorage.getItem("_id") || "";
      const googleId = savedProfile.googleId || localStorage.getItem("googleId") || "";
      const profilePic = savedProfile.profilePic || localStorage.getItem("userProfileImage") || localStorage.getItem("profilePic") || "";

      const { countryCode, phone: phoneNumber } = parsePhoneNumber(phone);

      setProfile((prev) => ({
        ...prev,
        name,
        phone: phoneNumber,
        countryCode,
        email,
        googleId,
        userId,
        image: profilePic || prev.image
      }));
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const getCurrentLocation = () => {
    const savedLat = localStorage.getItem("latitude");
    const savedLng = localStorage.getItem("longitude");

    if (savedLat && savedLng) {
      setProfile((prev) => ({ ...prev, latitude: savedLat, longitude: savedLng }));
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          setProfile((prev) => ({ ...prev, latitude: lat, longitude: lng }));
          localStorage.setItem("latitude", lat);
          localStorage.setItem("longitude", lng);
        },
        () => {
          const defaultLat = "17.512343";
          const defaultLng = "78.500667";
          setProfile((prev) => ({ ...prev, latitude: defaultLat, longitude: defaultLng }));
        }
      );
    }
  };

  const getOrCreateGoogleId = (): string => {
    let googleId = profile.googleId || localStorage.getItem("googleId");
    if (!googleId) {
      googleId = `google_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("googleId", googleId);
    }
    return googleId;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaveStatus("idle");
    setErrorMessage("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setProfile((prev) => ({ ...prev, phone: value }));
    setSaveStatus("idle");
    setErrorMessage("");
  };

  const handleCountrySelect = (country: Country) => {
    setProfile((prev) => ({ ...prev, countryCode: country.dialCode }));
    setShowCountryDropdown(false);
    setSearchQuery("");
    setSaveStatus("idle");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size should be less than 5MB");
        setSaveStatus("error");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please upload a valid image file");
        setSaveStatus("error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfile = (): boolean => {
    if (!profile.name.trim()) {
      setErrorMessage("Name is required");
      setSaveStatus("error");
      return false;
    }
    
    if (profile.name.trim().length < 2) {
      setErrorMessage("Name must be at least 2 characters");
      setSaveStatus("error");
      return false;
    }

    if (!profile.phone.trim()) {
      setErrorMessage("Phone number is required");
      setSaveStatus("error");
      return false;
    }
    
    if (profile.phone.length < 7 || profile.phone.length > 15) {
      setErrorMessage("Phone number must be between 7-15 digits");
      setSaveStatus("error");
      return false;
    }

    if (!profile.email.trim()) {
      setErrorMessage("Email is required");
      setSaveStatus("error");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      setErrorMessage("Invalid email format");
      setSaveStatus("error");
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    setIsLoading(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const googleId = getOrCreateGoogleId();
      const userId = profile.userId || localStorage.getItem("userId") || localStorage.getItem("_id");

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const fullPhoneNumber = `${profile.countryCode}${profile.phone}`;

      const payload = {
        googleId,
        name: profile.name.trim(),
        mobilenumber: fullPhoneNumber,
        email: profile.email.trim(),
        profilePic: profile.image,
        latitude: profile.latitude || "17.512343",
        longitude: profile.longitude || "78.500667",
        platform: "web",
      };

      await apiService.user.updateUserProfile(userId, {
        name: payload.name,
        mobilenumber: payload.mobilenumber,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });

      const profileToSave = {
        name: payload.name,
        phone: fullPhoneNumber,
        email: payload.email,
        profilePic: payload.profilePic,
        googleId,
        userId: userId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      };

      localStorage.setItem("userProfile", JSON.stringify(profileToSave));
      localStorage.setItem("userName", payload.name);
      localStorage.setItem("contactName", payload.name);
      localStorage.setItem("userEmail", payload.email);
      localStorage.setItem("contactNumber", fullPhoneNumber);
      localStorage.setItem("mobilenumber", fullPhoneNumber);
      localStorage.setItem("phoneNumber", fullPhoneNumber);
      localStorage.setItem("phone", fullPhoneNumber);
      localStorage.setItem("userId", userId);
      localStorage.setItem("_id", userId);
      localStorage.setItem("googleId", googleId);
      localStorage.setItem("latitude", payload.latitude);
      localStorage.setItem("longitude", payload.longitude);

      if (payload.profilePic) {
        localStorage.setItem("userProfileImage", payload.profilePic);
        localStorage.setItem("profilePic", payload.profilePic);
      }

      setProfile(prev => ({
        ...prev,
        name: payload.name,
        phone: profile.phone,
        email: payload.email,
        userId: userId
      }));

      setSaveStatus("success");
      setIsLoading(false);
      setTimeout(() => onClose(), 1500);

    } catch (err: any) {
      console.error("Update failed:", err);
      setErrorMessage(err.message || "Update failed. Please try again.");
      setSaveStatus("error");
      setIsLoading(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find((c) => c.dialCode === profile.countryCode) || COUNTRIES[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 z-10"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
   
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={profile.image}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 shadow-lg transition-transform group-hover:scale-105"
            />
            <label
              htmlFor="profilePic"
              className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full p-2.5 shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-110"
            >
              <input
                id="profilePic"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name *</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number *</label>
            <div className="flex gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  disabled={isLoading}
                  className="h-full px-3 py-2.5 border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all flex items-center gap-2 min-w-[110px] disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-2  bg-white border-2 border-gray-200 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
                    
                    <div className="overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            onClick={() => handleCountrySelect(country)}
                            className="w-full px-4 py-2.5 hover:bg-indigo-50 transition-colors flex items-center gap-3 text-left border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-2xl">{country.flag}</span>
                           
                            <span className="text-sm text-gray-500 font-mono">{country.dialCode}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">No countries found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                disabled={isLoading}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address *</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              disabled={isLoading}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {errorMessage && saveStatus === "error" && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900 mb-1">Error</p>
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {saveStatus === "success" && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-900 mb-1">Success!</p>
                <p className="text-xs text-green-700">Profile updated successfully! Closing...</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full mt-6 py-3.5 text-white font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Save & Update"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;