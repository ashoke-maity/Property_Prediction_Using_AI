import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FaSearch, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

// This component handles the draggable marker and reverse geocoding
function DraggableMarker({ onLocationChange, position: externalPosition }) {
  const [position, setPosition] = useState(externalPosition || [12.9716, 77.5946]);
  const markerRef = useRef(null);

  // Update position when external position changes (from search)
  useEffect(() => {
    if (externalPosition) {
      setPosition(externalPosition);
    }
  }, [externalPosition]);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const mapRef = useRef(null);

  // Search for locations using Nominatim API
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in&addressdetails=1`
      );
      const data = await response.json();
      
      // Filter and format results
      const formattedResults = data.map(result => ({
        id: result.place_id,
        display_name: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.address || {}
      }));

      setSearchResults(formattedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle selecting a search result
  const handleSelectLocation = (result) => {
    const newPosition = [result.lat, result.lng];
    setMarkerPosition(newPosition);
    setMapCenter(newPosition);
    setShowResults(false);
    setSearchQuery(result.display_name);

    // Update the parent component with the selected location
    onLocationChange({
      address: result.display_name,
      lat: result.lat,
      lng: result.lng,
    });

    // Pan the map to the selected location
    if (mapRef.current) {
      mapRef.current.setView(newPosition, 15);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search for a location (e.g., Koramangala, Bangalore)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectLocation(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                >
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.display_name}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">
                No locations found. Try a different search term.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="w-full h-80 rounded-lg overflow-hidden border-2 border-blue-200 shadow-sm">
        <MapContainer 
          ref={mapRef}
          center={mapCenter} 
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          doubleClickZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker 
            onLocationChange={onLocationChange} 
            position={markerPosition}
          />
        </MapContainer>
      </div>

      {/* Updated Tip */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        💡 <strong>Tip:</strong> Search for your location above or drag the red marker to your property location. The AI model works best with Bangalore properties.
      </div>
    </div>
  );
};

export default LeafletMapPicker;