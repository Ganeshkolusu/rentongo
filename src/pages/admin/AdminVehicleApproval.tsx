import React, { useEffect, useState } from "react";
import apiService from "../../services/api.service";

type VehicleType = "Car" | "Bike" | "Auto";
const TYPES: VehicleType[] = ["Car", "Bike", "Auto"];

interface PendingVehicle {
  _id: string;
  vehicleType: VehicleType;
  CarName?: string;
  bikeName?: string;
  CarNumber?: string;
  bikeNumber?: string;
  AutoNumber?: string;
  userId?: string;
  contactName?: string;
  contactNumber?: string;
  createdAt?: string;
}

const AdminVehicleApproval: React.FC = () => {
  const [vehicles, setVehicles] = useState<PendingVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        TYPES.map(async (vehicleType) => {
          try {
            const data = await apiService.admin.getPendingVehicles(vehicleType);
            const list = data?.data || [];
            return list.map((v: any) => ({ ...v, vehicleType }));
          } catch {
            // 404 "No pending vehicles found" from the backend — not a real error
            return [];
          }
        })
      );
      setVehicles(results.flat());
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load pending vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (vehicle: PendingVehicle, status: "Verified" | "Rejected") => {
    setActingOn(vehicle._id);
    try {
      await apiService.admin.updateVehicleStatus(vehicle.vehicleType, vehicle._id, status);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicle._id));
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || "Failed to update vehicle status");
    } finally {
      setActingOn(null);
    }
  };

  const vehicleName = (v: PendingVehicle) => v.CarName || v.bikeName || `${v.vehicleType} ${v.AutoNumber || ""}`;
  const vehicleNumber = (v: PendingVehicle) => v.CarNumber || v.bikeNumber || v.AutoNumber || "—";

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">Vehicle Approvals</h1>
      <p className="text-gray-500 text-sm mb-6">{vehicles.length} pending listing{vehicles.length !== 1 ? "s" : ""}</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Nothing pending review.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Listed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{v.vehicleType}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{vehicleName(v)}</td>
                  <td className="px-4 py-3">{vehicleNumber(v)}</td>
                  <td className="px-4 py-3">{v.contactName} · {v.contactNumber}</td>
                  <td className="px-4 py-3">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(v, "Verified")}
                        disabled={actingOn === v._id}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(v, "Rejected")}
                        disabled={actingOn === v._id}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleApproval;
