import React, { useEffect, useState } from "react";
import apiService from "../../services/api.service";

interface Plan {
  planId: string;
  label: string;
  price: number;
  durationDays: number;
  maxVehicles: number | null;
  priority: boolean;
}

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.admin.getPlans();
      setPlans(data.plans || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (planId: string, field: keyof Plan, value: any) => {
    setPlans((prev) => prev.map((p) => (p.planId === planId ? { ...p, [field]: value } : p)));
  };

  const handleSave = async (plan: Plan) => {
    setSavingId(plan.planId);
    try {
      await apiService.admin.updatePlan(plan.planId, {
        label: plan.label,
        price: plan.price,
        durationDays: plan.durationDays,
        maxVehicles: plan.maxVehicles,
        priority: plan.priority,
      });
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Failed to save plan");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">Plan Pricing</h1>
      <p className="text-gray-500 text-sm mb-6">Changes apply immediately to new orders and status checks.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          {plans.map((plan) => (
            <div key={plan.planId} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <input
                value={plan.label}
                onChange={(e) => updateField(plan.planId, "label", e.target.value)}
                className="text-lg font-bold text-gray-900 mb-4 w-full border-b border-transparent hover:border-gray-200 focus:border-blue-500 outline-none"
              />

              <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
              <input
                type="number"
                min={0}
                value={plan.price}
                onChange={(e) => updateField(plan.planId, "price", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm"
              />

              <label className="block text-xs font-medium text-gray-500 mb-1">Duration (days)</label>
              <input
                type="number"
                min={1}
                value={plan.durationDays}
                onChange={(e) => updateField(plan.planId, "durationDays", Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm"
              />

              <label className="block text-xs font-medium text-gray-500 mb-1">Max vehicles (blank = unlimited)</label>
              <input
                type="number"
                min={0}
                value={plan.maxVehicles ?? ""}
                onChange={(e) => updateField(plan.planId, "maxVehicles", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm"
              />

              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={plan.priority}
                  onChange={(e) => updateField(plan.planId, "priority", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Priority placement in search</span>
              </label>

              <button
                onClick={() => handleSave(plan)}
                disabled={savingId === plan.planId}
                className="w-full bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
              >
                {savingId === plan.planId ? "Saving..." : "Save"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
