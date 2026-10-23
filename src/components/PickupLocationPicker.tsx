import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { Loader, LocateFixed, MapPin, Search } from "lucide-react";

const PinIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Whole-India view, used only until the owner's location is known.
const INDIA_CENTER: [number, number] = [21.0, 78.0];
const INDIA_ZOOM = 5;
const PIN_ZOOM = 16;

export interface PickupAddress {
  state: string;
  city: string;
  pincode: string;
  street: string;
  area: string;
  country: string;
  formatted: string;
}

export interface PickupLocation {
  latitude: number;
  longitude: number;
  address: PickupAddress;
}

const EMPTY_ADDRESS: PickupAddress = {
  state: "", city: "", pincode: "", street: "", area: "", country: "", formatted: "",
};

async function reverseGeocode(lat: number, lon: number): Promise<PickupAddress> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    const a = data.address || {};
    return {
      state: a.state || "",
      city: a.city || a.town || a.village || a.county || a.state_district || "",
      pincode: a.postcode || "",
      street: a.road || a.pedestrian || "",
      area: a.suburb || a.neighbourhood || a.quarter || a.city_district || a.road || "",
      country: a.country || "",
      formatted: data.display_name || "",
    };
  } catch {
    // Keep the pin even if the lookup fails; the address fields stay editable.
    return EMPTY_ADDRESS;
  }
}

async function searchPlace(query: string): Promise<[number, number] | null> {
  const q = /india/i.test(query) ? query : `${query}, India`;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  );
  const data = await res.json();
  return data?.length ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
}

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, PIN_ZOOM, { duration: 0.6 });
  }, [target, map]);
  return null;
}

interface Props {
  value: { latitude: number; longitude: number } | null;
  onChange: (location: PickupLocation) => void;
  label?: string;
  required?: boolean;
  error?: string;
  /** Center on the browser's location on mount when there is no pin yet. */
  autoLocate?: boolean;
}

/**
 * Inline map for choosing a vehicle's pickup point. The owner can click the
 * map, drag the pin, search a place, or use their current location. Each
 * change calls onChange with the coordinates and the reverse-geocoded address.
 */
const PickupLocationPicker: React.FC<Props> = ({
  value,
  onChange,
  label = "Pickup Location",
  required = false,
  error,
  autoLocate = true,
}) => {
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [formatted, setFormatted] = useState("");
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [hint, setHint] = useState("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const hasPin = !!value && Number.isFinite(value.latitude) && Number.isFinite(value.longitude);

  const placePin = async (lat: number, lng: number) => {
    setHint("");
    setResolving(true);
    const address = await reverseGeocode(lat, lng);
    setResolving(false);
    setFormatted(address.formatted);
    onChangeRef.current({ latitude: lat, longitude: lng, address });
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setHint("Your browser can't share location. Click the map to set the pickup point.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setFlyTarget([coords.latitude, coords.longitude]);
        await placePin(coords.latitude, coords.longitude);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setHint("Location access was blocked. Click the map to set the pickup point.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  useEffect(() => {
    if (!hasPin && autoLocate) locateMe();
    // Only on mount: later pin changes come from this component itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const query = searchText.trim();
    if (!query) return;
    setSearching(true);
    try {
      const hit = await searchPlace(query);
      if (hit) {
        setFlyTarget(hit);
        await placePin(hit[0], hit[1]);
      } else {
        setHint("Place not found. Try a different name, or click the map.");
      }
    } catch {
      setHint("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const showError = !!error && !hasPin;

  return (
    <div className="mb-4" data-error={showError ? "true" : undefined}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // don't submit the surrounding form
              handleSearch();
            }
          }}
          placeholder="Search area or landmark"
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          aria-label="Search location"
        >
          {searching ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          aria-label="Use my current location"
          title="Use my current location"
        >
          {locating ? <Loader className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
        </button>
      </div>

      <div
        className={`h-72 rounded-lg overflow-hidden border ${
          showError ? "border-2 border-red-500" : "border-gray-300"
        }`}
      >
        <MapContainer
          center={hasPin ? [value!.latitude, value!.longitude] : INDIA_CENTER}
          zoom={hasPin ? PIN_ZOOM : INDIA_ZOOM}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPick={placePin} />
          <FlyTo target={flyTarget} />
          {hasPin && (
            <Marker
              position={[value!.latitude, value!.longitude]}
              icon={PinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  placePin(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-600">
        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${hasPin ? "text-blue-600" : "text-gray-400"}`} />
        <span>
          {resolving
            ? "Finding address…"
            : hasPin
              ? formatted || `${value!.latitude.toFixed(5)}, ${value!.longitude.toFixed(5)}`
              : "Click the map or drag the pin to set where renters pick up the vehicle."}
        </span>
      </div>
      {hint && <p className="text-amber-700 text-xs mt-1">{hint}</p>}
      {showError && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
    </div>
  );
};

export default PickupLocationPicker;
