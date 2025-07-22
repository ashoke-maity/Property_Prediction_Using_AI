import React, { useState, useCallback } from 'react';
import LeafletMapPicker from './LeafletMapPicker';
import { FaHome, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const steps = [
  { label: 'Property Info', icon: <FaHome /> },
  { label: 'Location', icon: <FaMapMarkerAlt /> },
  { label: 'Review', icon: <FaCheckCircle /> },
];

const PropertyFormModal = ({ show, onClose, onSubmit }) => {
  // State for the form's current step and data - streamlined for AI model
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyTitle: '',
    area: '', // total_sqft for AI model
    bhk: '', // BHK for AI model - empty for placeholder
    bathrooms: '', // bath for AI model - empty for placeholder
    balcony: '', // balcony for AI model - empty for placeholder
    address: '',
    lat: 0,
    lng: 0,
  });

  // Handlers for form logic - updated for 3 steps
  const handleNextStep = useCallback(() => setFormStep(s => Math.min(s + 1, 3)), []);
  const handlePrevStep = useCallback(() => setFormStep(s => Math.max(s - 1, 1)), []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = useCallback((location) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
    }));
  }, []);

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    // Call the onSubmit prop passed from MainLayout, sending all the data up
    onSubmit(formData);
  };

  // Validation logic for 3 steps
  const validateStep = () => {
    if (formStep === 1) {
      return formData.propertyTitle.trim() && 
             formData.area && parseInt(formData.area) > 0 && 
             formData.bhk && 
             formData.bathrooms;
      // Note: balcony is optional, so not included in validation
    }
    if (formStep === 2) {
      return formData.address && formData.lat && formData.lng;
    }
    return true; // Step 3 is just review
  };
  const isStepValid = validateStep();

  if (!show) {
    return null; // Don't render anything if the 'show' prop is false
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className="relative bg-white rounded-2xl shadow-xl px-8 pt-8 pb-7 flex flex-col items-center max-w-lg w-full border border-gray-200">
        {/* Close 'X' button */}
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        
        {/* Progress Bar */}
        <div className="flex items-center w-full mb-6">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex-1 flex flex-col items-center">
              <div className={`rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold mb-1 ${formStep === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step.icon}
              </div>
              <span className={`text-xs font-semibold ${formStep === idx + 1 ? 'text-blue-700' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {idx < steps.length - 1 && <div className="w-full h-1 bg-gray-200 mt-2 mb-2" />}
            </div>
          ))}
        </div>

        <form className="w-full space-y-6" onSubmit={handleFinalSubmit}>
          {/* Step 1: Property Information */}
          {formStep === 1 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <FaHome /> Property Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="propertyTitle" 
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={formData.propertyTitle} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., 3 BHK Apartment in Whitefield"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      Total Area (sq.ft) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="area" 
                      type="number" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={formData.area} 
                      onChange={handleInputChange} 
                      required 
                      min={100}
                      placeholder="1200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      BHK <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="bhk" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={formData.bhk} 
                      onChange={handleInputChange} 
                      required
                    >
                      <option value="">Select BHK</option>
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      Bathrooms <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="bathrooms" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={formData.bathrooms} 
                      onChange={handleInputChange} 
                      required
                    >
                      <option value="">Select Bathrooms</option>
                      <option value="1">1 Bathroom</option>
                      <option value="2">2 Bathrooms</option>
                      <option value="3">3 Bathrooms</option>
                      <option value="4">4 Bathrooms</option>
                      <option value="5">5+ Bathrooms</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">
                      Balconies
                    </label>
                    <select 
                      name="balcony" 
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={formData.balcony} 
                      onChange={handleInputChange}
                    >
                      <option value="">Select Balconies</option>
                      <option value="0">No Balcony</option>
                      <option value="1">1 Balcony</option>
                      <option value="2">2 Balconies</option>
                      <option value="3">3 Balconies</option>
                      <option value="4">4+ Balconies</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location Selection */}
          {formStep === 2 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt /> Location Selection
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag the pin to select the exact property location in Bangalore.
              </p>
              <LeafletMapPicker onLocationChange={handleLocationChange} />
              {formData.address && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-bold text-blue-600 mb-1">Selected Address:</p>
                  <p className="text-sm text-gray-800">{formData.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {formStep === 3 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <FaCheckCircle /> Review & Submit
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Property:</span>
                  <span>{formData.propertyTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Area:</span>
                  <span>{formData.area} sq.ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Configuration:</span>
                  <span>{formData.bhk} BHK, {formData.bathrooms} Bath</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Balconies:</span>
                  <span>{formData.balcony}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span className="text-right max-w-xs truncate">{formData.address}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">
                  ✨ Ready to get your AI-powered price prediction!
                </p>
              </div>
            </div>
          )}

          {/* Step Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {formStep > 1 ? (
              <button 
                type="button" 
                onClick={handlePrevStep} 
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full text-base shadow-sm transition-all duration-200"
              >
                Back
              </button>
            ) : <span />}
            
            {formStep < 3 ? (
              <button 
                type="button" 
                onClick={handleNextStep} 
                className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200 ${!isStepValid ? 'opacity-50 cursor-not-allowed' : ''}`} 
                disabled={!isStepValid}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200"
              >
                Get Price Prediction
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;