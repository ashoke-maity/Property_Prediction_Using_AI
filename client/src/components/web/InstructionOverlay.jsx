import React from 'react';

const InstructionOverlay = ({ show, onDismiss }) => {
  return (
    <div
      className={`fixed bottom-6 left-0 w-full flex justify-center z-50 transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white/90 text-gray-900 rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border border-blue-200 backdrop-blur-md">
        <span className="text-xl">👽</span>
        <span className="font-semibold">Click the UFO to get started!</span>
        <button
          className="ml-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow transition-all duration-200"
          onClick={onDismiss}
        >
          Understood
        </button>
      </div>
    </div>
  );
};

export default InstructionOverlay;