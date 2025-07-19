import React from 'react';
import { Canvas } from '@react-three/fiber';
import trendChart from '../../assets/trend-chart.svg';
import comparisonChart from '../../assets/comparison-chart.svg';
import featureImportance from '../../assets/feature-importance.svg';
import similarProperties from '../../assets/similar-properties.svg';
// import { UFO } from '../pages/HomePage/MainLayout'; // Same as above, UFO should be a separate component

const ResultModal = ({ show, onClose, resultData }) => {
  if (!show) return null;

  // You would use resultData to populate the fields, but we'll use placeholders for now
  const predictedPrice = resultData?.price || "₹1.05 Cr";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div> {/* Placeholder for UFO canvas */}
            <h2 className="text-2xl font-bold">Property Analysis Complete</h2>
            <p className="text-blue-100">AI-powered prediction results</p>
          </div>
          <button
            className="text-white hover:text-red-200 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">🎯 Predicted Price</div>
              <div className="text-2xl font-bold text-green-700">{predictedPrice}</div>
            </div>
            {/* Other result cards */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📈 Price Trend</h4>
                <img src={trendChart} alt="Price Trend" className="w-full h-32 object-contain" />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">📍 Locality Comparison</h4>
                <img src={comparisonChart} alt="Locality Comparison" className="w-full h-32 object-contain" />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">🏷 Feature Importance</h4>
                <img src={featureImportance} alt="Feature Importance" className="w-full h-32 object-contain" />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">🏠 Similar Properties</h4>
                <img src={similarProperties} alt="Similar Properties" className="w-full h-32 object-contain" />
              </div>
          </div>
          {/* ... other result sections ... */}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;