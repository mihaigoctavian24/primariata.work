"use client";

import { useTheme } from "next-themes";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon (known issue with webpack/Next.js)
// Use a simple SVG marker instead of relying on Leaflet's default PNG icons
const createMarkerIcon = (): L.DivIcon =>
  L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-primary" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    className: "map-marker-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

interface MapWidgetProps {
  lat: number;
  lng: number;
  locationName: string;
  zoom?: number;
}

export function MapWidget({
  lat,
  lng,
  locationName,
  zoom = 14,
}: MapWidgetProps): React.JSX.Element {
  const { resolvedTheme } = useTheme();

  // Theme-aware tile URLs
  const lightTiles = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const tileUrl = resolvedTheme === "dark" ? darkTiles : lightTiles;
  const attribution =
    resolvedTheme === "dark"
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      <Marker position={[lat, lng]} icon={createMarkerIcon()}>
        <Popup>{locationName}</Popup>
      </Marker>
    </MapContainer>
  );
}
