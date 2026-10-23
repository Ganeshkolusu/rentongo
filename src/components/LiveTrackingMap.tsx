import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTrackingStore } from "../store/tracking.store";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LiveTrackingMapProps {
  bookingId: string;
  /** Label shown in the marker popup, e.g. "Owner" */
  markerLabel?: string;
}

const RecenterOnMove: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ bookingId, markerLabel = "Owner" }) => {
  const { startWatching, stopWatching, latestLocation, path, isConnected } = useTrackingStore();

  useEffect(() => {
    startWatching(bookingId);
    return () => stopWatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (!latestLocation) {
    return (
      <div className="h-full w-full min-h-[300px] rounded-lg bg-gray-50 flex items-center justify-center text-center p-6">
        <p className="text-sm text-gray-500">
          Waiting for {markerLabel.toLowerCase()}'s location{isConnected ? "" : " (connecting...)"}
        </p>
      </div>
    );
  }

  const position: [number, number] = [latestLocation.latitude, latestLocation.longitude];
  const polylinePositions: [number, number][] = path.map((p) => [p.latitude, p.longitude]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "300px" }}
        className="z-0"
      >
        <RecenterOnMove center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polylinePositions.length > 1 && (
          <Polyline positions={polylinePositions} pathOptions={{ color: "#3D5AFE", weight: 4 }} />
        )}
        <Marker position={position}>
          <Popup>{markerLabel} is here</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;
