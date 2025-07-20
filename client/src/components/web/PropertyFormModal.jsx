import React, { useState, useCallback } from 'react';
import LeafletMapPicker from './LeafletMapPicker'; // Assuming LeafletMapPicker is in the same folder
import { FaHome, FaBuilding, FaRulerCombined, FaCalendarAlt, FaCouch, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const steps = [
  { label: 'Basic Info', icon: <FaHome /> },
  { label: 'Location', icon: <FaMapMarkerAlt /> },
  { label: 'Property Details', icon: <FaBuilding /> },
  { label: 'Features', icon: <FaCouch /> },
  { label: 'Review', icon: <FaCheckCircle /> },
];

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

  // Validation logic
  const validateStep = () => {
    if (formStep === 1) {
      return formData.propertyTitle && formData.area > 0;
    }
    if (formStep === 2) {
      return formData.address && formData.lat && formData.lng;
    }
    if (formStep === 3) {
      return formData.bhk && formData.bathrooms && formData.yearBuilt;
    }
    if (formStep === 4) {
      return formData.furnishing && formData.floor && formData.totalFloors;
    }
    return true;
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
              <div className={`rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold mb-1 ${formStep === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{step.icon}</div>
              <span className={`text-xs font-semibold ${formStep === idx + 1 ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</span>
              {idx < steps.length - 1 && <div className="w-full h-1 bg-gray-200 mt-2 mb-2" />}
            </div>
          ))}
        </div>
        <form className="w-full space-y-6" onSubmit={handleFinalSubmit}>
          {/* Step 1: Basic Info */}
          {formStep === 1 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><FaHome /> Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Property Title <span className="text-red-500">*</span></label>
                  <input name="propertyTitle" className="w-full border rounded px-3 py-2" value={formData.propertyTitle} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Area (sq.ft) <span className="text-red-500">*</span></label>
                  <input name="area" type="number" className="w-full border rounded px-3 py-2" value={formData.area} onChange={handleInputChange} required min={1} />
                </div>
              </div>
            </div>
          )}
          {/* Step 2: Location Details */}
          {formStep === 2 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><FaMapMarkerAlt /> Location Details</h3>
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
          {/* Step 3: Property Details */}
          {formStep === 3 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><FaBuilding /> Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">BHK <span className="text-red-500">*</span></label>
                  <input name="bhk" type="number" className="w-full border rounded px-3 py-2" value={formData.bhk} onChange={handleInputChange} required min={1} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Bathrooms <span className="text-red-500">*</span></label>
                  <input name="bathrooms" type="number" className="w-full border rounded px-3 py-2" value={formData.bathrooms} onChange={handleInputChange} required min={1} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Year Built <span className="text-red-500">*</span></label>
                  <input name="yearBuilt" type="number" className="w-full border rounded px-3 py-2" value={formData.yearBuilt} onChange={handleInputChange} required min={1800} max={new Date().getFullYear()} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Carpet Area (sq.ft)</label>
                  <input name="carpetArea" type="number" className="w-full border rounded px-3 py-2" value={formData.carpetArea} onChange={handleInputChange} min={1} />
                </div>
              </div>
            </div>
          )}
          {/* Step 4: Features */}
          {formStep === 4 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><FaCouch /> Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Furnishing <span className="text-red-500">*</span></label>
                  <select name="furnishing" className="w-full border rounded px-3 py-2" value={formData.furnishing} onChange={handleInputChange} required>
                    <option>Furnished</option>
                    <option>Semi-Furnished</option>
                    <option>Unfurnished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Floor <span className="text-red-500">*</span></label>
                  <input name="floor" type="number" className="w-full border rounded px-3 py-2" value={formData.floor} onChange={handleInputChange} required min={1} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Total Floors <span className="text-red-500">*</span></label>
                  <input name="totalFloors" type="number" className="w-full border rounded px-3 py-2" value={formData.totalFloors} onChange={handleInputChange} required min={1} />
                </div>
              </div>
            </div>
          )}
          {/* Step 5: Review */}
          {formStep === 5 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2"><FaCheckCircle /> Review & Submit</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <div><b>Title:</b> {formData.propertyTitle}</div>
                <div><b>Area:</b> {formData.area} sq.ft</div>
                <div><b>Address:</b> {formData.address}</div>
                <div><b>BHK:</b> {formData.bhk}</div>
                <div><b>Bathrooms:</b> {formData.bathrooms}</div>
                <div><b>Year Built:</b> {formData.yearBuilt}</div>
                <div><b>Carpet Area:</b> {formData.carpetArea}</div>
                <div><b>Furnishing:</b> {formData.furnishing}</div>
                <div><b>Floor:</b> {formData.floor} / {formData.totalFloors}</div>
              </div>
            </div>
          )}
          {/* Step Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {formStep > 1 ? (
              <button type="button" onClick={handlePrevStep} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-full text-base shadow-sm transition-all duration-200">Back</button>
            ) : <span />}
            {formStep < 5 ? (
              <button type="button" onClick={handleNextStep} className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200 ${!isStepValid ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isStepValid}>Next</button>
            ) : (
              <button type="submit" className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200">Submit</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormModal;