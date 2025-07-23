import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';

// Import all the UI components
import Header from '../../web/Header';
import PropertyFormModal from '../../web/PropertyFormModal';
import PropertyListModal from '../../web/PropertyListModal';
import GameStartModal from '../../web/GameStartModal';
import InstructionOverlay from '../../web/InstructionOverlay';
import LoadingScreen from '../../web/LoadingScreen';
import ResultModal from '../../web/ResultModal';
import { Scene } from '../../three/Scene'; // Import the main scene
import UserAuthModal from '../../web/UserAuthModal';

// Import API utilities
import { predictPropertyPrice, seedProperties } from '../../../utils/api';

// Import Leaflet CSS and fixes
import 'leaflet/dist/leaflet.css';
import '../../../utils/leafletFix';


const MainLayout = () => {
  const [showInstruction, setShowInstruction] = useState(true);
  const [showGameBox, setShowGameBox] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPropertyListModal, setShowPropertyListModal] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [currentFormData, setCurrentFormData] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [showUfoSpeechBubble, setShowUfoSpeechBubble] = useState(false);
  const [showHowSpeechBubble, setShowHowSpeechBubble] = useState(false);
  const [showContactSpeechBubble, setShowContactSpeechBubble] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingGameAccess, setPendingGameAccess] = useState(false);

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

  const handleUfoClick = useCallback(() => {
    // Check if user is authenticated
    if (isAuthenticated) {
      // User is logged in, proceed with game
      setShowGameBox(true);
    } else {
      // User is not logged in, show auth modal first
      setPendingGameAccess(true);
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);
  const handleGetStarted = useCallback(() => {
    setShowGameBox(false);
    setShowPropertyListModal(true);
  }, []);
  
  const handleDismissInstruction = useCallback(() => setShowInstruction(false), []);
  const handleCloseGameBox = useCallback(() => setShowGameBox(false), []);
  const handleCloseFormModal = useCallback(() => setShowFormModal(false), []);
  const handleClosePropertyListModal = useCallback(() => setShowPropertyListModal(false), []);
  const handleCloseResultScreen = useCallback(() => setShowResultScreen(false), []);

  // Handler for property selection from the list
  const handlePropertySelect = useCallback((property) => {
    // Pre-fill form data with selected property
    const formData = {
      propertyTitle: property.title,
      area: property.area,
      bhk: property.bhk,
      bathrooms: property.bathrooms,
      balcony: property.balcony || 0,
      areaType: property.areaType,
      availability: property.availability,
      availabilityDate: property.availabilityDate,
      address: property.location.address,
      lat: property.location.coordinates.lat,
      lng: property.location.coordinates.lng
    };
    
    // Set map center to property location
    setMapCenter({
      lat: property.location.coordinates.lat,
      lng: property.location.coordinates.lng
    });
    
    // Close property list and open form with pre-filled data
    setShowPropertyListModal(false);
    setCurrentFormData(formData);
    setShowFormModal(true);
  }, []);

  // Handler for manual property entry (original flow)
  const handleManualEntry = useCallback(() => {
    setShowGameBox(false);
    setShowFormModal(true);
  }, []);

  // Check for existing authentication on component mount
  React.useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('User authenticated:', userData.name);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    };

    const initializeProperties = async () => {
      try {
        await seedProperties();
        console.log('Sample properties initialized');
      } catch (error) {
        console.log('Properties may already exist or error seeding:', error.message);
      }
    };
    
    checkAuth();
    initializeProperties();
  }, []);

  // Handler for successful login
  const handleLoginSuccess = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    console.log('Login successful:', userData.name);
    
    // If user was trying to access the game before login, continue the flow
    if (pendingGameAccess) {
      setPendingGameAccess(false);
      setShowAuthModal(false);
      // Small delay to ensure modal closes smoothly
      setTimeout(() => {
        setShowGameBox(true);
      }, 300);
    }
  }, [pendingGameAccess]);

  // Handler for successful registration
  const handleRegisterSuccess = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    console.log('Registration successful:', userData.name);
    
    // If user was trying to access the game before registration, continue the flow
    if (pendingGameAccess) {
      setPendingGameAccess(false);
      setShowAuthModal(false);
      // Small delay to ensure modal closes smoothly
      setTimeout(() => {
        setShowGameBox(true);
      }, 300);
    }
  }, [pendingGameAccess]);

  // Handler for logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    console.log('User logged out');
  }, []);

  const handleFormSubmit = useCallback(async (formData) => {
    setShowFormModal(false);
    setCurrentFormData(formData); // Store form data for loading screen
    setShowLoadingScreen(true);
    
    try {
      console.log('Form data received:', formData);
      
      // Call the actual API
      const result = await predictPropertyPrice(formData);
      
      // Debug logging
      console.log('Full API result:', result);
      console.log('Predicted price value:', result.predicted_price);
      console.log('Type of predicted price:', typeof result.predicted_price);
      
      // Format the result for display
      const predictedPrice = result.predicted_price || 0;
      // Check if the price is already in lakhs or needs conversion
      const formattedPrice = predictedPrice > 1000 
        ? `₹${(predictedPrice / 100000).toFixed(2)} Lakhs`  // If > 1000, assume it's in rupees
        : `₹${predictedPrice.toFixed(2)} Lakhs`;            // If < 1000, assume it's already in lakhs
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
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
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
        <GameStartModal 
          show={showGameBox} 
          onClose={handleCloseGameBox} 
          onGetStarted={handleGetStarted}
          onManualEntry={handleManualEntry}
        />
        <PropertyListModal 
          show={showPropertyListModal} 
          onClose={handleClosePropertyListModal} 
          onPropertySelect={handlePropertySelect}
          mapCenter={mapCenter}
        />
        <PropertyFormModal 
          show={showFormModal} 
          onClose={handleCloseFormModal} 
          onSubmit={handleFormSubmit}
          initialData={currentFormData}
        />
        <LoadingScreen show={showLoadingScreen} propertyData={currentFormData} />
        <ResultModal show={showResultScreen} onClose={handleCloseResultScreen} resultData={predictionResult} />
        <UserAuthModal 
          show={showAuthModal} 
          onClose={() => {
            setShowAuthModal(false);
            // Reset pending game access if user closes modal without authenticating
            if (pendingGameAccess) {
              setPendingGameAccess(false);
            }
          }}
          onLogin={handleLoginSuccess}
          onRegister={handleRegisterSuccess}
          showGameAccessMessage={pendingGameAccess}
        />
      </section>
    </>
  );
};

export default MainLayout;