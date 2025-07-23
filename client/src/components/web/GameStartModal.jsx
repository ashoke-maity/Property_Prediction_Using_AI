import React from 'react';
import ufoImg from '../../assets/logo.png';

const GameStartModal = ({ show, onClose, onGetStarted, onManualEntry }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className="flex flex-col items-center">
        <img src={ufoImg} alt="UFO" className="w-28 h-28 object-contain drop-shadow-xl mb-0" style={{ marginBottom: '-1.5rem', zIndex: 2 }} />
        <div className="relative bg-white rounded-2xl shadow-xl px-8 pt-8 pb-7 flex flex-col items-center max-w-lg w-full border border-gray-200">
          <button
            className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[22px] border-l-transparent border-r-[22px] border-r-transparent border-b-[28px] border-b-white drop-shadow-md"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
            Unlock Powerful Property Insights
          </h2>
          <h3 className="text-base md:text-lg font-medium text-gray-500 mb-4 text-center">
            AI-driven analysis for smarter real estate decisions.
          </h3>
          <div className="mb-6 text-center text-blue-500 font-semibold text-base md:text-lg">
            Choose how you want to start:
          </div>
          
          <div className="space-y-4 w-full">
            <button
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl text-lg shadow-md transition-all duration-200 flex items-center justify-between"
              onClick={onGetStarted}
            >
              <div className="text-left">
                <div className="font-bold">Browse Available Properties</div>
                <div className="text-sm text-blue-100">Select from real listings and predict prices</div>
              </div>
              <span className="text-2xl">🏠</span>
            </button>
            
            <button
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold rounded-xl text-lg shadow-md transition-all duration-200 flex items-center justify-between"
              onClick={onManualEntry}
            >
              <div className="text-left">
                <div className="font-bold">Manual Property Entry</div>
                <div className="text-sm text-green-100">Enter your own property details</div>
              </div>
              <span className="text-2xl">✏️</span>
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Both options use the same AI prediction engine for accurate valuations
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameStartModal;