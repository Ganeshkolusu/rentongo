import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFcmToken } from "../lib/fcm";
import apiService from "../services/api.service";
import login from "../assets/icons/login.png";

interface AppUser {
  userId: string;
  name: string;
  email: string;
  fcmToken?: string;
  mobilenumber?: string;
  profilePic?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await apiService.user.requestOtp(email.trim().toLowerCase());
      setStep("otp");
      startCooldown();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await apiService.user.requestOtp(email.trim().toLowerCase());
      startCooldown();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your email");
      return;
    }

    setLoading(true);
    try {
      const fcmToken = await getFcmToken();

      const response: any = await apiService.user.verifyOtp({
        email: email.trim().toLowerCase(),
        otp,
        name: name.trim() || undefined,
        fcmToken: fcmToken || undefined,
        platform: "web",
      });

      const backendUser = response.user;
      const backendUserId = backendUser?._id;

      if (!backendUserId || !response.token) {
        throw new Error("Verification succeeded but the server response was incomplete");
      }

      const userDataToStore: AppUser = {
        userId: backendUserId,
        name: backendUser.name || name,
        email: backendUser.email || email,
        fcmToken: fcmToken || "",
        mobilenumber: backendUser.mobilenumber || "",
        profilePic: backendUser.profilePic || "",
      };

      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(userDataToStore));
      localStorage.setItem("userId", backendUserId);
      localStorage.setItem("role", backendUser.role || "user");
      localStorage.setItem("_id", backendUserId);
      localStorage.setItem("userName", userDataToStore.name);
      localStorage.setItem("contactName", userDataToStore.name);
      localStorage.setItem("userEmail", userDataToStore.email);
      localStorage.setItem("fcmToken", fcmToken || "");

      if (backendUser.mobilenumber) {
        localStorage.setItem("contactNumber", backendUser.mobilenumber);
        localStorage.setItem("mobilenumber", backendUser.mobilenumber);
        localStorage.setItem("phoneNumber", backendUser.mobilenumber);
        localStorage.setItem("phone", backendUser.mobilenumber);
      }

      if (backendUser.profilePic) {
        localStorage.setItem("userProfileImage", backendUser.profilePic);
        localStorage.setItem("profilePic", backendUser.profilePic);
      }

      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          name: userDataToStore.name,
          phone: backendUser.mobilenumber || "",
          email: userDataToStore.email,
          userId: backendUserId,
          profilePic: backendUser.profilePic || "",
        })
      );

      navigate("/change-location");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 min-h-[calc(100vh-80px)] py-8">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-b from-blue-600 to-blue-400 text-white flex-col justify-center items-center p-10">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-lg text-center">
            Manage your vehicle listings, rentals, and bookings anytime.
          </p>
          <img src={login} alt="Login Illustration" className="mt-10 w-72" />
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {step === "email" ? "Sign in to Continue" : "Enter Verification Code"}
          </h2>

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="w-full max-w-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:border-blue-500 outline-none mb-4"
                autoFocus
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Your name (first time only)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:border-blue-500 outline-none mb-4"
              />

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>

              <p className="text-gray-500 text-sm mt-6 text-center">
                We'll email you a 6-digit code — no password needed.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="w-full max-w-sm">
              <p className="text-sm text-gray-600 mb-4">
                Code sent to <span className="font-semibold">{email}</span>
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-800 tracking-[0.5em] text-center text-xl focus:border-blue-500 outline-none mb-4"
                autoFocus
              />

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="flex items-center justify-between mt-4 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError(null);
                  }}
                  className="text-gray-500 hover:underline"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
