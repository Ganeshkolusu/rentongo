
// src/components/ui/filter.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export type Vehicle = {
  _id: string;
  name?: string;
  vehicleName?: string;
  fuelType?: string;
  transmissionType?: string;
  pricePerKm?: number;
  location?: { coordinates: number[] };
};

export type FilterState = {
  vehicleType: "car" | "bike" | "auto";
  rangeKm: number;
  priceMin: number;
  priceMax: number;
  carName: string;
  fuelType: string;
  transmissionType: string;
};

type Props = {
  latitude: number;
  longitude: number;
  type?: "car" | "bike" | "auto";
  onApply?: (vehicles: Vehicle[]) => void;
  onClose?: () => void;
  defaultRangeKm?: number;
};

const UPLOADED_IMAGE = "/assets/placeholder-vehicle.png"; // Replace with your asset path

export default function FilterCard({
  latitude,
  longitude,
  type = "car",
  onApply,
  onClose,
  defaultRangeKm = 5,
}: Props) {
  const [open, setOpen] = useState<boolean>(true);

  const [vehicleType, setVehicleType] = useState<FilterState["vehicleType"]>(
    type
  );
 



  const [rangeKm, setRangeKm] = useState<number>(defaultRangeKm);
  const [priceMin, setPriceMin] = useState<number>(20);
  const [priceMax, setPriceMax] = useState<number>(500);
  const [carName, setCarName] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("");
  const [transmissionType, setTransmissionType] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Ensure min/max sane values
    if (priceMin < 0) setPriceMin(0);
    if (priceMax < priceMin) setPriceMax(priceMin);
    if (rangeKm < 0) setRangeKm(0);
  }, [priceMin, priceMax, rangeKm]);

  const buildUrl = () => {
    const params = new URLSearchParams({
      latitude: String(),
      longitude: String(),
      range: String(rangeKm),
      priceMin: String(priceMin),
      priceMax: String(priceMax),
      carName,
      fuelType,
      transmissionType,
    });
const latitude=localStorage.getItem("latitude");
const longitude=localStorage.getItem("longitude");
    // If vehicleType is 'bike', call /getNearbyBikes; else /getNearbyCars
    const endpoint = vehicleType === "bike" ? `http://localhost:3000/getNearbyBikes?latitude=${latitude}&longitude=${longitude}&range=${rangeKm}&priceMin=${priceMin}&priceMax=${priceMax}&carName=${carName}&fuelType=${fuelType}&transmissionType=${transmissionType}` : `http://localhost:3000/getNearbyCars?latitude=${latitude}&longitude=${longitude}&range=${rangeKm}&priceMin=${priceMin}&priceMax=${priceMax}&carName=${carName}&fuelType=${fuelType}&transmissionType=${transmissionType}`;

    // IMPORTANT: replace '' with your API base if needed (e.g. process.env.REACT_APP_API_BASE)
    return `${endpoint}?${params.toString()}`;
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const url = buildUrl();

      // If you have axios baseURL set, this is fine; otherwise prefix with full host.
      const res = await axios.get(url);

      // Accept multiple common shapes (vehicles array or vehicles top-level)
      const vehicles: Vehicle[] =
        (res.data && res.data.vehicles) ||
        (res.data && res.data.success && res.data.vehicles) ||
        [];

      setResults(vehicles);
      onApply && onApply(vehicles);
    } catch (err) {
      console.error("Filter request failed", err);
      setResults([]);
      onApply && onApply([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setVehicleType(type);
    setRangeKm(defaultRangeKm);
    setPriceMin(20);
    setPriceMax(500);
    setCarName("");
    setFuelType("");
    setTransmissionType("");
    setResults([]);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-end">
          <div
            className="absolute inset-0 bg-black opacity-30"
            onClick={() => {
              setOpen(false);
              onClose && onClose();
            }}
          />
        <aside className="relative z-50 w-full 
  max-h-[90vh] sm:max-h-[85vh]
  sm:max-w-sm bg-white rounded-2xl shadow-xl
  p-5 sm:p-6 overflow-y-auto">

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Filter</h3>
              <button
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  onClose && onClose();
                }}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="#111827"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Vehicle Type */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Vehicle Type</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="vehicleType"
                    checked={vehicleType === "car"}
                    onChange={() => setVehicleType("car")}
                  />
                  <span>Cars</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="vehicleType"
                    checked={vehicleType === "bike"}
                    onChange={() => setVehicleType("bike")}
                  />
                  <span>Bikes</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="vehicleType"
                    checked={vehicleType === "auto"}
                    onChange={() => setVehicleType("auto")}
                  />
                  <span>Autos</span>
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Price Range (₹)</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">₹{priceMin}</span>
                <span className="font-semibold">₹{priceMax}</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
                />
              </div>
              <div className="mt-2">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Distance */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Distance</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{Math.max(0, Math.round(rangeKm))} km</span>
                <span className="font-semibold">50 km</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={rangeKm}
                onChange={(e) => setRangeKm(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
              />
            </div>

            {/* Car Filters */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Car Filters</h4>

              <label className="block mb-3">
                <span className="text-sm text-gray-600">Car Name</span>
                <select
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-200 p-3"
                >
                  <option value="">Any</option>
                  <option value="Ford">Ford</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Hyundai">Hyundai</option>
                </select>
              </label>

              <label className="block mb-3">
                <span className="text-sm text-gray-600">Fuel</span>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-200 p-3"
                >
                  <option value="">Any</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                </select>
              </label>

              <label className="block mb-3">
                <span className="text-sm text-gray-600">Transmission</span>
                <select
                  value={transmissionType}
                  onChange={(e) => setTransmissionType(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-200 p-3"
                >
                  <option value="">Any</option>
                  <option value="Manual">Manual</option>
                  <option value="Auto">Auto</option>
                </select>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#0f1a4b] to-[#5cc6ff] text-white"
                onClick={applyFilters}
                disabled={loading}
              >
                {loading ? "Applying..." : "Apply"}
              </button>

              <button
                className="flex-1 py-3 rounded-xl font-semibold border border-gray-200"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>

            {/* Results preview */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">Preview</h4>
              <div className="space-y-3 max-h-48 overflow-auto">
                {results.length === 0 && (
                  <div className="text-sm text-gray-500">No vehicles found</div>
                )}

                {results.map((v) => (
                  <div key={v._id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <img
                      src={UPLOADED_IMAGE}
                      alt="vehicle"
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div>
                      <div className="font-semibold">{v.name || v.vehicleName || "Vehicle"}</div>
                      <div className="text-sm text-gray-500">
                        {v.fuelType || "—"} • {v.transmissionType || "—"}
                      </div>
                    </div>
                    <div className="ml-auto font-semibold">₹{v.pricePerKm ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
