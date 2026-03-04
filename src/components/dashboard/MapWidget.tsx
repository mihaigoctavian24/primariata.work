"use client";

import { useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PrimarieInfoCard } from "./PrimarieInfoCard";

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

interface PrimarieInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
}

interface MapWidgetProps {
  lat: number;
  lng: number;
  locationName: string;
  zoom?: number;
  primarieInfo?: PrimarieInfo;
}

/**
 * FlyToHandler -- internal component that handles flyTo animation on marker click.
 * Uses useMap() hook to access the Leaflet map instance.
 */
function FlyToHandler({ lat, lng }: { lat: number; lng: number }): null {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  const handleClick = useCallback(() => {
    map.flyTo([lat, lng], 16, { duration: 1.5 });
  }, [map, lat, lng]);

  // Attach click handler to marker via map event
  // We listen for popupopen which fires when marker is clicked
  const onPopupOpen = useCallback(() => {
    handleClick();
  }, [handleClick]);

  // Register event listener
  if (markerRef.current === null) {
    map.on("popupopen", onPopupOpen);
    // Store a dummy ref to prevent re-registration
    markerRef.current = L.marker([0, 0]);
  }

  return null;
}

export function MapWidget({
  lat,
  lng,
  locationName,
  zoom = 14,
  primarieInfo,
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
    <>
      {/* Custom popup styles */}
      <style>{`
        .primarie-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .primarie-popup .leaflet-popup-content {
          margin: 8px 10px;
          line-height: 1.4;
        }
        .primarie-popup .leaflet-popup-tip {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        <ZoomControl position="bottomright" />
        <FlyToHandler lat={lat} lng={lng} />
        <Marker position={[lat, lng]} icon={createMarkerIcon()}>
          <Popup maxWidth={300} className="primarie-popup">
            {primarieInfo ? (
              <PrimarieInfoCard
                name={primarieInfo.name}
                address={primarieInfo.address}
                phone={primarieInfo.phone}
                email={primarieInfo.email}
                workingHours={primarieInfo.workingHours}
              />
            ) : (
              locationName
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
}
