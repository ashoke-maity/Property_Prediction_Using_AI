import React from 'react';
import { Canvas } from '@react-three/fiber';
// Note: You need to make your UFO component exportable to use it here.
// For now, we'll assume a placeholder or that you've exported it.
// import { UFO } from '../pages/HomePage/MainLayout'; 

const LoadingScreen = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
      <div className="flex flex-col items-center">
        <p className="text-white text-2xl mb-4">Loading UFO...</p>
        {/*
          To make this work, your UFO component needs to be in its own file and imported here.
          <div style={{ height: 320, width: 320 }}>
            <Canvas camera={{ position: [0, 2, 4], fov: 40 }}>
              <ambientLight intensity={1.2} />
              <directionalLight position={[10, 20, 10]} intensity={1.2} />
              <UFO position={[0, 1.2, 0]} scanning={true} />
            </Canvas>
          </div>
        */}
        <div className="mt-8 text-2xl text-blue-200 font-semibold animate-pulse">Analyzing property…</div>
      </div>
    </div>
  );
};

export default LoadingScreen;