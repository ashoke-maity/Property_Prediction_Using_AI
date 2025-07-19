import React from 'react';
import ufoImg from '../../assets/logo.png';

const GameStartModal = ({ show, onClose, onGetStarted }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className="flex flex-col items-center">
        <img src={ufoImg} alt="UFO" className="w-28 h-28 object-contain drop-shadow-xl mb-0" style={{ marginBottom: '-1.5rem', zIndex: 2 }} />
        <div className="relative bg-white rounded-2xl shadow-xl px-8 pt-8 pb-7 flex flex-col items-center max-w-md w-full border border-gray-200">
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
            Start exploring your city’s potential.
          </div>
          <button
            className="mt-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold rounded-full text-lg shadow-md transition-all duration-200 flex items-center gap-2"
            onClick={onGetStarted}
          >
            Get Started
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameStartModal;