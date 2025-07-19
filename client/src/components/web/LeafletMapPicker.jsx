import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// This component handles the draggable marker and reverse geocoding
function DraggableMarker({ onLocationChange }) {
  const [position, setPosition] = useState([12.9716, 77.5946]); // Initial position: Bangalore
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          // Use Nominatim for reverse geocoding (lat,lng -> address)
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}`);
            const data = await response.json();
            onLocationChange({
              address: data.display_name || 'Could not find address',
              lat: newPos.lat,
              lng: newPos.lng,
            });
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          }
        }
      },
    }),
    [onLocationChange],
  );

  // Use a map event to set the initial address when the map loads
  useMapEvents({
    load: () => {
        // Trigger a fake dragend event to fetch initial address
        eventHandlers.dragend();
    },
  });


  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
    </Marker>
  );
}

const LeafletMapPicker = ({ onLocationChange }) => {
  return (
    // The container div defines the map's size and appearance.
    // Tailwind classes work perfectly here.
    <div className="w-full h-80 rounded-lg overflow-hidden border-2 border-blue-200">
      <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
};

export default LeafletMapPicker;