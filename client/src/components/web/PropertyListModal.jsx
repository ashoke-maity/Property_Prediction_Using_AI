import React, { useState, useEffect } from 'react';
import { FaHome, FaBed, FaBath, FaRupeeSign, FaMapMarkerAlt, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';
import { getAllProperties, getNearbyProperties } from '../../utils/api';

const PropertyListModal = ({ show, onClose, onPropertySelect, mapCenter }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    bhk: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    minArea: '',
    maxArea: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState('all'); // 'all' or 'nearby'

  useEffect(() => {
    if (show) {
      fetchProperties();
    }
  }, [show, searchMode, mapCenter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let result;
      if (searchMode === 'nearby' && mapCenter?.lat && mapCenter?.lng) {
        result = await getNearbyProperties(mapCenter.lat, mapCenter.lng, 5);
      } else {
        result = await getAllProperties(filters);
      }
      setProperties(result.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchProperties();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      bhk: '',
      minPrice: '',
      maxPrice: '',
      propertyType: '',
      minArea: '',
      maxArea: ''
    });
    fetchProperties();
  };

  const handlePropertySelect = (property) => {
    onPropertySelect(property);
    onClose();
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FaHome className="mr-2" /> Available Properties
            </h2>
            <p className="text-blue-100">
              {searchMode === 'nearby' ? 'Properties near your selected location' : 'All available properties'}
            </p>
          </div>
          <button
            className="text-white hover:text-red-200 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search Mode Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setSearchMode('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  searchMode === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Properties
              </button>
              <button
                onClick={() => setSearchMode('nearby')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  searchMode === 'nearby' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={!mapCenter?.lat || !mapCenter?.lng}
              >
                <FaMapMarkerAlt className="inline mr-1" />
                Nearby (5km)
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
                <select
                  value={filters.bhk}
                  onChange={(e) => handleFilterChange('bhk', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="e.g., 5000000"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="e.g., 15000000"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Area (sq.ft)</label>
                <input
                  type="number"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange('minArea', e.target.value)}
                  placeholder="e.g., 800"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Area (sq.ft)</label>
                <input
                  type="number"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                  placeholder="e.g., 2000"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Properties List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading properties...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Properties Found</h3>
              <p className="text-gray-500">
                {searchMode === 'nearby' 
                  ? 'No properties found near the selected location. Try expanding your search radius.'
                  : 'No properties match your current filters. Try adjusting your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handlePropertySelect(property)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">
                        {formatPrice(property.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{Math.round(property.price / property.area)}/sq.ft
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaBed className="mr-1" />
                      {property.bhk} BHK
                    </div>
                    <div className="flex items-center">
                      <FaBath className="mr-1" />
                      {property.bathrooms} Bath
                    </div>
                    <div className="flex items-center">
                      <FaHome className="mr-1" />
                      {property.area} sq.ft
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <FaMapMarkerAlt className="mr-1" />
                    {property.location.locality}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {property.propertyType}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {property.availability}
                    </span>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
                    Select & Predict Price
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListModal;