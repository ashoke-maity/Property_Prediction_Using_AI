import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';

// Import all the UI components
import Header from '../../web/Header';
import PropertyFormModal from '../../web/PropertyFormModal';
import GameStartModal from '../../web/GameStartModal';
import InstructionOverlay from '../../web/InstructionOverlay';
import LoadingScreen from '../../web/LoadingScreen';
import ResultModal from '../../web/ResultModal';
import { Scene } from '../../three/Scene'; // Import the main scene

// Import Leaflet CSS and fixes
import 'leaflet/dist/leaflet.css';
import '../../../utils/leafletFix';


const MainLayout = () => {
  const [showInstruction, setShowInstruction] = useState(true);
  const [showGameBox, setShowGameBox] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const handleUfoClick = useCallback(() => setShowGameBox(true), []);
  const handleGetStarted = useCallback(() => {
    setShowGameBox(false);
    setShowFormModal(true);
  }, []);
  
  const handleDismissInstruction = useCallback(() => setShowInstruction(false), []);
  const handleCloseGameBox = useCallback(() => setShowGameBox(false), []);
  const handleCloseFormModal = useCallback(() => setShowFormModal(false), []);
  const handleCloseResultScreen = useCallback(() => setShowResultScreen(false), []);

  const handleFormSubmit = useCallback(async (formData) => {
    setShowFormModal(false);
    setShowLoadingScreen(true);
    
    // MOCK API CALL
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPredictionResult({ price: '₹1.25 Cr' });

    setShowLoadingScreen(false);
    setShowResultScreen(true);
  }, []);

  return (
    <>
      <Header />
      <section className="relative w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-blue-600 p-0 m-0">
        <div className="w-full h-screen">
          <Canvas shadows>
            <Scene onUfoClick={handleUfoClick} />
          </Canvas>
        </div>

        <InstructionOverlay show={showInstruction} onDismiss={handleDismissInstruction} />
        <GameStartModal show={showGameBox} onClose={handleCloseGameBox} onGetStarted={handleGetStarted} />
        <PropertyFormModal show={showFormModal} onClose={handleCloseFormModal} onSubmit={handleFormSubmit} />
        <LoadingScreen show={showLoadingScreen} />
        <ResultModal show={showResultScreen} onClose={handleCloseResultScreen} resultData={predictionResult} />
      </section>
    </>
  );
};

export default MainLayout;