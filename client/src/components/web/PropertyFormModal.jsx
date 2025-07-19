import React, { useState, useCallback } from 'react';
import LeafletMapPicker from './LeafletMapPicker'; // Assuming LeafletMapPicker is in the same folder

const PropertyFormModal = ({ show, onClose, onSubmit }) => {
  // State for the form's current step and data is now managed inside this component
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyTitle: '3 BHK in New York City',
    propertyType: 'Apartment',
    bhk: '3',
    bathrooms: '2',
    area: '1200',
    carpetArea: '950',
    yearBuilt: '2015',
    furnishing: 'Furnished',
    floor: '3',
    totalFloors: '10',
    address: '',
    lat: 0,
    lng: 0,
    // Add other fields from other steps as needed
  });

  // Handlers for form logic are now also inside this component
  const handleNextStep = useCallback(() => setFormStep(s => Math.min(s + 1, 5)), []);
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

  if (!show) {
    return null; // Don't render anything if the 'show' prop is false
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className="relative bg-white rounded-2xl shadow-xl px-8 pt-8 pb-7 flex flex-col items-center max-w-lg w-full border border-gray-200">
        {/* Close 'X' button */}
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold focus:outline-none"
          onClick={onClose} // Use the onClose prop from the parent
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Property Details</h2>
        <div className="mb-4 text-gray-500 text-sm">Step {formStep} of 5</div>
        <form className="w-full space-y-6" onSubmit={handleFinalSubmit}>
          
          {/* Step 1: Basic Info */}
          {formStep === 1 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">🏠 Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-gray-600 text-sm mb-1">Area (sq.ft)</label>
                    <input name="area" type="number" className="w-full border rounded px-3 py-2" value={formData.area} onChange={handleInputChange} />
                </div>
                {/* Add other inputs for Step 1 here, connecting them to formData and handleInputChange */}
              </div>
            </div>
          )}

          {/* Step 2: Location Details */}
          {formStep === 2 && (
             <div>
                <h3 className="font-semibold text-blue-700 mb-2">📍 Location Details</h3>
                <p className="text-sm text-gray-500 mb-4">Drag the pin to select the exact property location.</p>
                <LeafletMapPicker onLocationChange={handleLocationChange} />
                {formData.address && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs font-bold text-gray-600">Selected Address:</p>
                    <p className="text-sm text-gray-800">{formData.address}</p>
                    </div>
                )}
             </div>
          )}

          {/* ... Add JSX for Steps 3, 4, 5 here ... */}
          
          {/* Step Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {formStep > 1 ? (
              <button type="button" onClick={handlePrevStep} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full text-base shadow-sm transition-all duration-200">Back</button>
            ) : <span />}
            {formStep < 5 ? (
              <button type="button" onClick={handleNextStep} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200">Next</button>
            ) : (
              <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200">Submit</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;