import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// This component handles the draggable marker and reverse geocoding
function DraggableMarker({ onLocationChange }) {
  const [position, setPosition] = useState([12.9716, 77.5946]); // Initial position: Bangalore center
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      async dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          
          // Use Nominatim for reverse geocoding (lat,lng -> address)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&addressdetails=1&zoom=16`
            );
            const data = await response.json();
            
            // Extract more detailed address information
            const address = data.address || {};
            let formattedAddress = data.display_name || 'Could not find address';
            
            // Try to get a more specific locality-focused address
            if (address.suburb || address.neighbourhood || address.residential) {
              const locality = address.suburb || address.neighbourhood || address.residential;
              const city = address.city || address.town || 'Bangalore';
              const state = address.state || 'Karnataka';
              formattedAddress = `${locality}, ${city}, ${state}`;
            }
            
            onLocationChange({
              address: formattedAddress,
              lat: newPos.lat,
              lng: newPos.lng,
            });
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            onLocationChange({
              address: 'Location selected (geocoding failed)',
              lat: newPos.lat,
              lng: newPos.lng,
            });
          }
        }
      },
    }),
    [onLocationChange],
  );

  // Use a map event to set the initial address when the map loads
  useMapEvents({
    load: () => {
        // Trigger initial address fetch
        setTimeout(() => {
          eventHandlers.dragend();
        }, 500);
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
    <div className="space-y-2">
      <div className="w-full h-80 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
        <MapContainer 
          center={[12.9716, 77.5946]} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          doubleClickZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker onLocationChange={onLocationChange} />
        </MapContainer>
      </div>
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        💡 <strong>Tip:</strong> Drag the red marker to your property location. The AI model works best with Bangalore properties.
      </div>
    </div>
  );
};

export default LeafletMapPicker;