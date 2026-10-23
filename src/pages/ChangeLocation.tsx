import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { useLocation } from "../store/location.context";
import locationIcon from "../assets/icons/Location.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Props = {
  initialLat?: number;
  initialLng?: number;
  onSaveLocation?: (city: string, lat: number, lng: number) => void;
};

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

// Keeps the map view in sync with state changes made outside the map (search, geolocation)
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

const extractCity = (address?: Record<string, string>) => {
  if (!address) return "";
  return address.city || address.town || address.village || address.state || address.country || "";
};

export default function SearchMapWithSave({ initialLat, initialLng, onSaveLocation }: Props) {
  const navigate = useNavigate();
  const { setLocationWithCoordinates } = useLocation();

  const markerPos: [number, number] = [
    initialLat || 17.4894387,
    initialLng || 78.4602418,
  ];

  const [position, setPosition] = useState<[number, number]>(markerPos);
  const [zoom, setZoom] = useState(14);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ----------------------------- SEARCH (NOMINATIM) ----------------------------- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Location search error:", err);
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const selectSuggestion = (s: Suggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setPosition([lat, lng]);
    setZoom(15);
    setAddress(s.display_name);
    setQuery(s.display_name);
    setCity(extractCity(s.address));
    setShowSuggestions(false);
  };

  /* ----------------------------- REVERSE GEOCODE ----------------------------- */
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data) {
        setAddress(data.display_name || "");
        setQuery(data.display_name || "");
        setCity(extractCity(data.address));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  /* ----------------------------- USE CURRENT LOCATION ----------------------------- */
  const handleUseCurrent = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        setZoom(15);
        reverseGeocode(lat, lng);
      },
      (err) => alert(err.message),
      { enableHighAccuracy: true }
    );
  };

  /* ----------------------------- SAVE LOCATION ----------------------------- */
  const handleSave = () => {
    if (!city) return alert("Please select a location");

    const [lat, lng] = position;
    setLocationWithCoordinates(city, { latitude: lat, longitude: lng }, "India");
    onSaveLocation?.(city, lat, lng);

    navigate("/rental", { replace: true });
  };

  /* ----------------------------- RENDER ----------------------------- */
  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-4 sm:gap-6 lg:gap-10 lg:ml-10 max-w-7xl mx-auto">

      {/* Map Container */}
      <div className="w-full lg:w-2/3 border rounded-lg shadow overflow-hidden">
        <MapContainer center={position} zoom={zoom} style={{ height: "500px", width: "100%" }} className="!h-[300px] sm:!h-[400px] lg:!h-[500px]">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={position} zoom={zoom} />
          <MapClickHandler onClick={handleMapClick} />
          <Marker
            position={position}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                setPosition([pos.lat, pos.lng]);
                reverseGeocode(pos.lat, pos.lng);
              },
            }}
          />
        </MapContainer>
      </div>

      {/* Controls Container */}
      <div className="w-full lg:w-1/3 space-y-4">

        {/* Search Input */}
        <div className="relative space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search Location
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Search city or address"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-[1000] w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => selectSuggestion(s)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current Location Display */}
        {address && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Selected Location:</p>
            <p className="text-sm text-gray-700 line-clamp-2">{address}</p>
            {city && (
              <p className="text-sm font-medium text-gray-900 mt-1">City: {city}</p>
            )}
          </div>
        )}

        {/* Use Current Location Button */}
        <button
          onClick={handleUseCurrent}
          className="flex items-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img src={locationIcon} alt="Location" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Use Current Location</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#0A0747] to-[#4EC8FF] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
        >
          Save Location
        </button>
      </div>
    </div>
  );
}
