

 
import React, { useState, useEffect } from "react";
import { ArrowLeft, User, Edit2, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
 
const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
    latitude: "",
    longitude: "",
    googleId: "",
  });
 
  const [isEditing, setIsEditing] = useState(false);
 
  useEffect(() => {
    loadProfile();
  }, []);
 
  const loadProfile = () => {
    try {
      // Load from localStorage
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile({
          name: parsedProfile.name || "",
          email: parsedProfile.email || "",
          phone: parsedProfile.phone || "",
          image: parsedProfile.image || "",
          latitude: parsedProfile.latitude || "",
          longitude: parsedProfile.longitude || "",
          googleId: parsedProfile.googleId || "",
        });
      } else {
        // Fallback to individual localStorage items
        setProfile({
          name: localStorage.getItem("userName") || localStorage.getItem("contactName") || "",
          email: localStorage.getItem("userEmail") || "",
          phone: localStorage.getItem("contactNumber") || "",
          image: localStorage.getItem("userProfileImage") || "",
          latitude: localStorage.getItem("latitude") || "",
          longitude: localStorage.getItem("longitude") || "",
          googleId: localStorage.getItem("googleId") || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };
 
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
 
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setProfile((prev) => ({ ...prev, image: imageUrl }));
        localStorage.setItem("userProfileImage", imageUrl);
       
        // Update the full profile in localStorage
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          parsedProfile.image = imageUrl;
          localStorage.setItem("userProfile", JSON.stringify(parsedProfile));
        }
      };
      reader.readAsDataURL(file);
    }
  };
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleSaveChanges = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   
    // Validate inputs
    if (!profile.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!profile.email.trim()) {
      alert("Email is required");
      return;
    }
    if (!profile.phone.trim()) {
      alert("Phone is required");
      return;
    }
 
    try {
      // Save to localStorage
      const profileToSave = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        image: profile.image,
        latitude: profile.latitude,
        longitude: profile.longitude,
        googleId: profile.googleId,
      };
 
      localStorage.setItem("userProfile", JSON.stringify(profileToSave));
      localStorage.setItem("userName", profile.name.trim());
      localStorage.setItem("userEmail", profile.email.trim());
      localStorage.setItem("contactNumber", profile.phone.trim());
      localStorage.setItem("contactName", profile.name.trim());
 
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };
 
  const getLocationString = () => {
    if (profile.latitude && profile.longitude) {
      return `${parseFloat(profile.latitude).toFixed(4)}, ${parseFloat(profile.longitude).toFixed(4)}`;
    }
    return "Location not set";
  };
 
  return (
    <div className="min-h-screen overflow-auto flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 p-6 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/profile")}
          className="absolute left-4 top-4 text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={22} />
        </button>
 
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6 relative">
          <div className="relative">
            {profile.image ? (
              <img
                src={profile.image}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-200 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center border-4 border-indigo-200 shadow-lg">
                <User size={48} className="text-white" />
              </div>
            )}
            {/* Edit Icon */}
            <label className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full p-2.5 shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-110">
              <Edit2 size={16} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
 
          {/* Heading below image */}
          <h3 className="mt-3 text-2xl font-bold text-gray-800">My Profile</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
        </div>
 
        {/* Form */}
        {isEditing ? (
          <form className="space-y-4" onSubmit={handleSaveChanges}>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
 
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
 
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
 
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  loadProfile(); // Reset to saved values
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Display Mode */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <User className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Name</p>
                  <p className="text-base text-gray-900 font-semibold">
                    {profile.name || "Not set"}
                  </p>
                </div>
              </div>
 
              <div className="flex items-start gap-3 mb-3">
                <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-base text-gray-900">
                    {profile.email || "Not set"}
                  </p>
                </div>
              </div>
 
              <div className="flex items-start gap-3 mb-3">
                <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-base text-gray-900">
                    {profile.phone || "Not set"}
                  </p>
                </div>
              </div>
 
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm text-gray-700">
                    {getLocationString()}
                  </p>
                </div>
              </div>
            </div>
 
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          </div>
        )}
 
        {/* User ID Info */}
        {profile.googleId && (
          <div className="mt-5 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-mono">
              User ID: <span className="text-indigo-600">{profile.googleId.substring(0, 20)}...</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default MyProfile;
 
