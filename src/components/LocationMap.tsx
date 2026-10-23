import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom blue marker for selected location
const CustomIcon = L.icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'%3E%3Cpath fill='%230B0E92' d='M16 0C7.2 0 0 7.2 0 16c0 8.8 16 32 16 32s16-23.2 16-32c0-8.8-7.2-16-16-16zm0 22c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z'/%3E%3C/svg%3E",
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});


interface LocationMapProps {
  city: string;
  country: string;
}

// Component to update map view when city changes
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const LocationMap: React.FC<LocationMapProps> = ({ city, country }) => {
  const [position, setPosition] = useState<[number, number]>([16.9891, 82.2475]); // Default: Kakinada

  // City coordinates mapping
  const cityCoordinates: { [key: string]: [number, number] } = {
    Kakinada: [16.9891, 82.2475],
    Hyderabad: [17.385044, 78.486671],
    Vizag: [17.6868, 83.2185],
    Mumbai: [19.076, 72.8777],
    Delhi: [28.7041, 77.1025],
    Bangalore: [12.9716, 77.5946],
    Chennai: [13.0827, 80.2707],
    Kolkata: [22.5726, 88.3639],
    Pune: [18.5204, 73.8567],
    Ahmedabad: [23.0225, 72.5714],
  };

  useEffect(() => {
    if (city && cityCoordinates[city]) {
      setPosition(cityCoordinates[city]);
    }
  }, [city]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
        className="z-0"
      >
        <ChangeView center={position} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={CustomIcon}>
          <Popup>
            <div className="text-center p-2">
              <strong className="text-lg font-bold text-blue-900">{city}</strong>
              <br />
              <span className="text-sm text-gray-600">{country}</span>
              <br />
              <div className="mt-2 text-xs text-gray-500">
                📍 Selected Location
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
