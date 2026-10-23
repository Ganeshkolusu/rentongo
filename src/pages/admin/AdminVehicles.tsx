import React, { useEffect, useRef, useState } from "react";
import apiService from "../../services/api.service";
import AdminTable, { Column } from "./AdminTable";

interface AdminVehicle {
  _id: string;
  vehicleType: "Car" | "Bike" | "Auto";
  CarName?: string;
  bikeName?: string;
  CarNumber?: string;
  bikeNumber?: string;
  AutoNumber?: string;
  status?: string;
  boosted?: boolean;
  userId?: { name?: string; email?: string } | string;
  createdAt: string;
  carImages?: string[];
  bikeImages?: string[];
  autoImages?: string[];
}

const LIMIT = 50;

const imagesOf = (v: AdminVehicle): string[] => {
  if (v.vehicleType === "Car") return v.carImages || [];
  if (v.vehicleType === "Bike") return v.bikeImages || [];
  return v.autoImages || [];
};

const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [vehicleType, setVehicleType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoVehicle, setPhotoVehicle] = useState<AdminVehicle | null>(null);

  const load = () => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService.admin
      .getAllVehicles({ vehicleType: vehicleType || undefined, status: status || undefined, limit: LIMIT, skip })
      .then((data: any) => {
        if (cancelled) return;
        setVehicles(data.vehicles || []);
        setTotal(data.total || 0);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || "Failed to load vehicles");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  };

  useEffect(load, [vehicleType, status, skip]);

  const owner = (v: AdminVehicle) => (typeof v.userId === "object" ? v.userId?.name || v.userId?.email : "—");

  const columns: Column<AdminVehicle>[] = [
    { header: "Type", render: (v) => v.vehicleType },
    { header: "Name/Number", render: (v) => v.CarName || v.bikeName || v.CarNumber || v.bikeNumber || v.AutoNumber || "—" },
    { header: "Owner", render: owner },
    {
      header: "Status",
      render: (v) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${v.status === "Verified" ? "bg-green-100 text-green-700" : v.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
          {v.status || "Pending"}
        </span>
      ),
    },
    { header: "Boosted", render: (v) => (v.boosted ? "Pro" : "—") },
    { header: "Listed", render: (v) => new Date(v.createdAt).toLocaleDateString() },
    {
      header: "Photos",
      render: (v) => (
        <button
          onClick={() => setPhotoVehicle(v)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
        >
          Manage ({imagesOf(v).length})
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-1">All Vehicles</h1>
      <p className="text-gray-500 text-sm mb-4">{total} total</p>

      <div className="flex gap-3 mb-4">
        <select value={vehicleType} onChange={(e) => { setVehicleType(e.target.value); setSkip(0); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All types</option>
          <option value="Car">Car</option>
          <option value="Bike">Bike</option>
          <option value="Auto">Auto</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setSkip(0); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={vehicles}
        rowKey={(v) => v._id}
        loading={loading}
        error={error}
        total={total}
        skip={skip}
        limit={LIMIT}
        onPageChange={setSkip}
        emptyLabel="No vehicles match."
      />

      {photoVehicle && (
        <PhotoManagerModal
          vehicle={photoVehicle}
          onClose={() => setPhotoVehicle(null)}
          onUpdated={(updatedImages) => {
            setPhotoVehicle((prev) => (prev ? { ...prev, [`${prev.vehicleType.toLowerCase()}Images`]: updatedImages } as AdminVehicle : prev));
            setVehicles((prev) =>
              prev.map((v) =>
                v._id === photoVehicle._id
                  ? ({ ...v, [`${v.vehicleType.toLowerCase()}Images`]: updatedImages } as AdminVehicle)
                  : v
              )
            );
          }}
        />
      )}
    </div>
  );
};

const PhotoManagerModal: React.FC<{
  vehicle: AdminVehicle;
  onClose: () => void;
  onUpdated: (images: string[]) => void;
}> = ({ vehicle, onClose, onUpdated }) => {
  const images = imagesOf(vehicle);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleReplace = async (index: number, file: File) => {
    setBusyIndex(index);
    setError(null);
    try {
      const data: any = await apiService.admin.replaceVehiclePhoto(vehicle.vehicleType, vehicle._id, index, file);
      const field = `${vehicle.vehicleType.toLowerCase()}Images`;
      onUpdated(data[field] || images);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to replace photo");
    } finally {
      setBusyIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Photos — {vehicle.CarName || vehicle.bikeName || vehicle.AutoNumber || vehicle.vehicleType}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Replace a photo that shows an unblurred number plate with a corrected version.
            </p>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition text-sm font-medium">
            Close
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {images.length === 0 ? (
            <p className="text-sm text-gray-500">No photos uploaded for this vehicle.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((url, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img src={url} alt={`View ${index + 1}`} className="w-full h-32 object-cover" />
                  <div className="p-2 space-y-1.5">
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center text-xs font-semibold px-2 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Download
                    </a>
                    <input
                      ref={(el) => { fileInputRefs.current[index] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleReplace(index, file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={busyIndex === index}
                      className="w-full text-xs font-semibold px-2 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                      {busyIndex === index ? "Uploading…" : "Replace Photo"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVehicles;
