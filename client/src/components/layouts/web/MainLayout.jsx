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
import UserAuthModal from '../../web/UserAuthModal';

// Import API utilities
import { predictPropertyPrice } from '../../../utils/api';

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
  const [showUfoSpeechBubble, setShowUfoSpeechBubble] = useState(false);
  const [showHowSpeechBubble, setShowHowSpeechBubble] = useState(false);
  const [showContactSpeechBubble, setShowContactSpeechBubble] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handler for About click
  const handleAboutClick = useCallback(() => {
    setShowUfoSpeechBubble(true);
    setShowHowSpeechBubble(false);
    setShowContactSpeechBubble(false);
    setTimeout(() => setShowUfoSpeechBubble(false), 6000);
  }, []);
  // Handler for How it works click
  const handleHowClick = useCallback(() => {
    setShowUfoSpeechBubble(false);
    setShowHowSpeechBubble(true);
    setShowContactSpeechBubble(false);
    setTimeout(() => setShowHowSpeechBubble(false), 6000);
  }, []);
  // Handler for Contact click
  const handleContactClick = useCallback(() => {
    setShowUfoSpeechBubble(false);
    setShowHowSpeechBubble(false);
    setShowContactSpeechBubble(true);
    setTimeout(() => setShowContactSpeechBubble(false), 6000);
  }, []);

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
    
    try {
      console.log('Form data received:', formData);
      
      // Call the actual API
      const result = await predictPropertyPrice(formData);
      
      // Format the result for display
      const formattedPrice = `₹${(result.predicted_price / 100000).toFixed(2)} Lakhs`;
      setPredictionResult({ 
        price: formattedPrice,
        rawPrice: result.predicted_price,
        propertyDetails: {
          title: formData.propertyTitle,
          area: formData.area,
          bhk: formData.bhk,
          bathrooms: formData.bathrooms,
          address: formData.address
        }
      });

      setShowLoadingScreen(false);
      setShowResultScreen(true);
    } catch (error) {
      console.error('Prediction failed:', error);
      
      // Show error in result modal
      setPredictionResult({ 
        error: true,
        message: error.message || 'Failed to get price prediction. Please try again.',
        price: 'Error'
      });

      setShowLoadingScreen(false);
      setShowResultScreen(true);
    }
  }, []);

  return (
    <>
      <Header 
        onAboutClick={handleAboutClick}
        onHowClick={handleHowClick}
        onContactClick={handleContactClick}
        onLoginClick={() => setShowAuthModal(true)}
      />
      <section className="relative w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-blue-600 p-0 m-0">
        <div className="w-full h-screen">
          <Canvas shadows>
            <Scene 
              onUfoClick={handleUfoClick} 
              showUfoSpeechBubble={showUfoSpeechBubble}
              showHowSpeechBubble={showHowSpeechBubble}
              showContactSpeechBubble={showContactSpeechBubble}
              onCloseUfoSpeechBubble={() => setShowUfoSpeechBubble(false)}
              onCloseHowSpeechBubble={() => setShowHowSpeechBubble(false)}
              onCloseContactSpeechBubble={() => setShowContactSpeechBubble(false)}
            />
          </Canvas>
        </div>

        <InstructionOverlay show={showInstruction} onDismiss={handleDismissInstruction} />
        <GameStartModal show={showGameBox} onClose={handleCloseGameBox} onGetStarted={handleGetStarted} />
        <PropertyFormModal show={showFormModal} onClose={handleCloseFormModal} onSubmit={handleFormSubmit} />
        <LoadingScreen show={showLoadingScreen} />
        <ResultModal show={showResultScreen} onClose={handleCloseResultScreen} resultData={predictionResult} />
        <UserAuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </section>
    </>
  );
};

export default MainLayout;