import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
// Note: You need to make your UFO component exportable to use it here.
// For now, we'll assume a placeholder or that you've exported it.
// import { UFO } from '../pages/HomePage/MainLayout'; 

const LoadingScreen = ({ show, propertyData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState({});

  const analysisSteps = [
    {
      title: "🤖 Initializing AI Model",
      description: "Loading neural network and market data...",
      details: "Activating property valuation algorithms",
      duration: 1000
    },
    {
      title: "📊 Analyzing Market Data",
      description: "Processing 50,000+ recent transactions...",
      details: `Comparing ${propertyData?.bhk || 2} BHK properties in the area`,
      duration: 1500
    },
    {
      title: "📍 Location Intelligence",
      description: "Evaluating neighborhood factors...",
      details: `Analyzing proximity to amenities, transport, schools`,
      duration: 1200
    },
    {
      title: "🏗️ Property Features Analysis",
      description: "Assessing structural and design elements...",
      details: `${propertyData?.area || 1200} sq.ft area with ${propertyData?.bathrooms || 2} bathrooms`,
      duration: 1300
    },
    {
      title: "📈 Price Prediction Algorithm",
      description: "Running advanced ML models...",
      details: "Ensemble of Random Forest, XGBoost, and Neural Networks",
      duration: 1800
    },
    {
      title: "✅ Validation & Confidence Scoring",
      description: "Cross-validating results...",
      details: "Ensuring prediction accuracy and reliability",
      duration: 800
    }
  ];

  useEffect(() => {
    if (!show) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepTimer;
    let progressTimer;

    const runAnalysis = async () => {
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentStep(i);
        
        // Simulate progress within each step
        const step = analysisSteps[i];
        const progressIncrement = 100 / step.duration * 50; // Update every 50ms
        let stepProgress = 0;
        
        const progressInterval = setInterval(() => {
          stepProgress += progressIncrement;
          const totalProgress = (i / analysisSteps.length) * 100 + (stepProgress / analysisSteps.length);
          setProgress(Math.min(totalProgress, (i + 1) / analysisSteps.length * 100));
          
          if (stepProgress >= 100) {
            clearInterval(progressInterval);
          }
        }, 50);

        // Simulate some realistic analysis data
        if (i === 1) {
          setAnalysisData(prev => ({
            ...prev,
            marketComps: Math.floor(Math.random() * 200) + 150,
            avgPrice: Math.floor(Math.random() * 50) + 80
          }));
        } else if (i === 2) {
          setAnalysisData(prev => ({
            ...prev,
            walkScore: Math.floor(Math.random() * 30) + 70,
            transitScore: Math.floor(Math.random() * 25) + 65
          }));
        } else if (i === 4) {
          setAnalysisData(prev => ({
            ...prev,
            confidence: Math.floor(Math.random() * 15) + 85,
            modelAccuracy: Math.floor(Math.random() * 8) + 92
          }));
        }

        await new Promise(resolve => setTimeout(resolve, step.duration));
        clearInterval(progressInterval);
      }
      
      setProgress(100);
    };

    runAnalysis();

    return () => {
      if (stepTimer) clearTimeout(stepTimer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [show, propertyData]);

  if (!show) return null;

  const currentStepData = analysisSteps[currentStep] || analysisSteps[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full mx-4 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <div className="text-3xl animate-spin">🤖</div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Property Analysis</h2>
          <p className="text-blue-200">Advanced machine learning in progress...</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex items-center mb-3">
            <div className="text-2xl mr-3 animate-pulse">{currentStepData.title.split(' ')[0]}</div>
            <h3 className="text-xl font-semibold text-white">{currentStepData.title.substring(2)}</h3>
          </div>
          <p className="text-blue-200 mb-2">{currentStepData.description}</p>
          <p className="text-sm text-blue-300 italic">{currentStepData.details}</p>
        </div>

        {/* Analysis Insights */}
        {Object.keys(analysisData).length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {analysisData.marketComps && (
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-green-400">{analysisData.marketComps}</div>
                <div className="text-xs text-blue-200">Market Comparisons</div>
              </div>
            )}
            {analysisData.walkScore && (
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-yellow-400">{analysisData.walkScore}</div>
                <div className="text-xs text-blue-200">Walk Score</div>
              </div>
            )}
            {analysisData.confidence && (
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-purple-400">{analysisData.confidence}%</div>
                <div className="text-xs text-blue-200">Confidence</div>
              </div>
            )}
            {analysisData.modelAccuracy && (
              <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-blue-400">{analysisData.modelAccuracy}%</div>
                <div className="text-xs text-blue-200">Model Accuracy</div>
              </div>
            )}
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2">
          {analysisSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-500' 
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;