'use client';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Use local Leaflet marker images so we don't rely on a CDN
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

// Apply default marker icons once on mount
function useLeafletDefaultIcon() {
  useEffect(() => {
    // @ts-ignore - _getIconUrl is internal
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: icon2x.src,
      iconUrl: icon.src,
      shadowUrl: shadow.src,
    });
  }, []);
}

// Helper component to fit the map to marker bounds
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    // Only keep valid coords
    const latlngs = points
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map(p => L.latLng(p.lat, p.lng));

    if (!latlngs.length) return;

    if (latlngs.length === 1) {
      map.setView(latlngs[0], 10); // zoom in on a single marker
    } else {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);

  return null;
}

export default function Map({ markers = [] }) {
  const [isMounted, setIsMounted] = useState(false);
  useLeafletDefaultIcon();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only send valid markers to the map
  const safeMarkers = useMemo(
    () =>
      (markers || []).filter(
        m => Number.isFinite(m?.lat) && Number.isFinite(m?.lng)
      ),
    [markers]
  );

  if (!isMounted) return null;

  // Fallback center if no markers (rough "world view")
  const fallbackCenter = [20, 0]; // lat, lng
  const fallbackZoom = 2;

  return (
    <div className="relative">
      <MapContainer
        center={fallbackCenter}
        zoom={fallbackZoom}
        className="h-[500px] w-full rounded shadow z-0"
        // Important for Leaflet rendering inside flex/hidden parents
        style={{ minHeight: 300 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // OSM requires attribution
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Auto-fit when markers change */}
        <FitBounds points={safeMarkers} />

        {safeMarkers.map((marker, idx) => (
          <Marker 
            key={`${marker.lat},${marker.lng},${idx}`} 
            position={[marker.lat, marker.lng]}
            opacity={marker.isPreview ? 0.7 : 1}
          >
            <Popup>
              <div className="text-sm">
                <strong className={`text-base ${marker.isPreview ? 'text-pink-600' : ''}`}>
                  {marker.isPreview ? '📍 ' : ''}{marker.name}
                </strong><br />
                📍 {marker.city}<br />
                📅 {marker.dates}<br />
                {!marker.isPreview && (
                  <span className={marker.openToCollab ? 'text-green-600' : 'text-red-600'}>
                    {marker.openToCollab ? '✅ Open to collab' : '❌ Not open to collab'}
                  </span>
                )}
                {marker.isPreview && (
                  <span className="text-pink-600 italic">Preview location</span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}