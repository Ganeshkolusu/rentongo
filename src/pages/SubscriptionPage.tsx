import React, { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import apiService from "../services/api.service";

interface SubscriptionStatus {
  plan: "free" | "pro";
  status: "active" | "expired";
  expiresAt: string | null;
  limits: { maxVehicles: number; priority: boolean; price: number };
}

const SubscriptionPage: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const data = await apiService.subscription.getMyStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load subscription status");
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async () => {
    setError(null);
    setLoading(true);
    try {
      const order = await apiService.subscription.createOrder("pro");

      const cashfree = await load({
        mode: (process.env.REACT_APP_CASHFREE_ENV || "sandbox") as "sandbox" | "production",
      });

      if (!cashfree) {
        throw new Error("Payment SDK failed to load");
      }

      await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      });

      // The webhook is the source of truth for activation, but it may lag —
      // poll our own status a couple of times as a UX fallback.
      await loadStatus();
      setTimeout(loadStatus, 3000);
      setTimeout(loadStatus, 8000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Payment failed to start");
    } finally {
      setLoading(false);
    }
  };

  const isPro = status?.plan === "pro" && status?.status === "active";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Owner Plans</h1>
      <p className="text-gray-500 mb-8">Choose a plan to list your vehicles on RentOnGoVehicle.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {status && (
        <div className="mb-8 text-sm text-gray-600">
          Current plan: <span className="font-semibold text-gray-900">{status.plan === "pro" ? "Pro" : "Free"}</span>
          {isPro && status.expiresAt && (
            <> — renews/expires on {new Date(status.expiresAt).toLocaleDateString()}</>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Free plan */}
        <div className={`rounded-2xl border-2 p-6 ${!isPro ? "border-blue-500" : "border-gray-200"}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Free</h2>
          <p className="text-3xl font-black text-gray-900 mb-4">₹0</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li>✓ List 1 vehicle</li>
            <li>✗ Priority placement in search</li>
          </ul>
          {!isPro && (
            <div className="text-center text-sm font-semibold text-blue-600">Current plan</div>
          )}
        </div>

        {/* Pro plan */}
        <div className={`rounded-2xl border-2 p-6 ${isPro ? "border-blue-500" : "border-gray-200"}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Pro</h2>
          <p className="text-3xl font-black text-gray-900 mb-4">₹499<span className="text-base font-medium text-gray-500">/30 days</span></p>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li>✓ Unlimited vehicles</li>
            <li>✓ Priority placement in nearby-vehicle search</li>
          </ul>
          {isPro ? (
            <div className="text-center text-sm font-semibold text-blue-600">Current plan</div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white font-semibold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Upgrade to Pro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
