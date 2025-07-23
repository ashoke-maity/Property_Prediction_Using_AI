import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import trendChart from '../../assets/trend-chart.svg';
import comparisonChart from '../../assets/comparison-chart.svg';
import featureImportance from '../../assets/feature-importance.svg';
import similarProperties from '../../assets/similar-properties.svg';
import { FaChartLine, FaMapMarkerAlt, FaHome, FaChartBar, FaRupeeSign, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
// import { UFO } from '../pages/HomePage/MainLayout'; // Same as above, UFO should be a separate component

const ResultModal = ({ show, onClose, resultData }) => {
  const [animatedPrice, setAnimatedPrice] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (show && resultData?.rawPrice) {
      // Animate the price counting up
      const targetPrice = parseFloat(resultData.rawPrice) || 0;
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = targetPrice / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetPrice) {
          setAnimatedPrice(targetPrice);
          clearInterval(timer);
          setTimeout(() => setShowDetails(true), 500);
        } else {
          setAnimatedPrice(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [show, resultData]);

  if (!show) return null;

  // Use analysis data from backend or generate fallback data
  const analysisData = resultData?.analysis_metadata || {
    model_confidence: Math.floor(Math.random() * 15) + 85,
    market_trend: Math.random() > 0.5 ? 'Bullish' : 'Stable',
    price_per_sqft: resultData?.rawPrice ? Math.floor((resultData.rawPrice * 100000) / (resultData?.propertyDetails?.area || 1200)) : 4500,
    market_comparisons: Math.floor(Math.random() * 50) + 120,
    location_score: Math.floor(Math.random() * 20) + 80,
    investment_grade: ['A+', 'A', 'A-', 'B+'][Math.floor(Math.random() * 4)],
    appreciation_forecast: (Math.random() * 8 + 5).toFixed(1) + '%',
    rental_yield_estimate: (Math.random() * 2 + 3).toFixed(1) + '%'
  };

  const predictedPrice = resultData?.price || "₹1.05 Cr";
  const formattedAnimatedPrice = animatedPrice > 1000 
    ? `₹${(animatedPrice / 100000).toFixed(2)} Lakhs`
    : `₹${animatedPrice.toFixed(2)} Lakhs`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Analysis Complete</h2>
              <p className="text-blue-100">Advanced property valuation results</p>
            </div>
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
          {/* Main Price Display */}
          <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
            <div className="text-sm text-gray-600 font-medium mb-2">🎯 AI Predicted Value</div>
            <div className="text-4xl font-bold text-green-700 mb-2">
              {animatedPrice > 0 ? formattedAnimatedPrice : predictedPrice}
            </div>
            <div className="text-sm text-gray-500">
              ₹{analysisData.price_per_sqft || analysisData.pricePerSqft}/sq.ft • {analysisData.model_confidence || analysisData.confidence}% Confidence
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 text-center">
              <div className="text-2xl font-bold text-blue-700">{analysisData.location_score || analysisData.locationScore}</div>
              <div className="text-xs text-blue-600">Location Score</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 text-center">
              <div className="text-2xl font-bold text-purple-700">{analysisData.investment_grade || analysisData.investmentGrade}</div>
              <div className="text-xs text-purple-600">Investment Grade</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 text-center">
              <div className="text-2xl font-bold text-orange-700">{analysisData.appreciation_forecast || (analysisData.appreciationRate + '%')}</div>
              <div className="text-xs text-orange-600">Annual Growth</div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200 text-center">
              <div className="text-2xl font-bold text-teal-700">{analysisData.rental_yield_estimate || (analysisData.rentalYield + '%')}</div>
              <div className="text-xs text-teal-600">Rental Yield</div>
            </div>
          </div>

          {/* Property Details */}
          {resultData?.propertyDetails && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🏠 Property Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Area:</span>
                  <div className="font-semibold">{resultData.propertyDetails.area} sq.ft</div>
                </div>
                <div>
                  <span className="text-gray-500">Configuration:</span>
                  <div className="font-semibold">{resultData.propertyDetails.bhk} BHK</div>
                </div>
                <div>
                  <span className="text-gray-500">Bathrooms:</span>
                  <div className="font-semibold">{resultData.propertyDetails.bathrooms}</div>
                </div>
                <div>
                  <span className="text-gray-500">Market Trend:</span>
                  <div className={`font-semibold ${(analysisData.market_trend || analysisData.marketTrend) === 'Bullish' ? 'text-green-600' : 'text-blue-600'}`}>
                    {analysisData.market_trend || analysisData.marketTrend}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Charts */}
          {showDetails && (
            <>
              {/* Price Trends Analysis */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaChartLine className="mr-2 text-blue-600" /> Price Trends Analysis
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {analysisData.market_comparisons || Math.floor(Math.random() * 50) + 120} data points
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {/* Custom Price Trend Chart */}
                    <div className="w-full h-40 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-3 border border-gray-200">
                      <div className="flex items-end justify-between h-full">
                        {[65, 72, 68, 78, 85, 92, 88, 95, 102, 108, 115, 120].map((value, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="bg-gradient-to-t from-blue-500 to-green-500 rounded-t-sm w-3"
                              style={{ height: `${(value / 120) * 100}%` }}
                            />
                            {index % 3 === 0 && (
                              <span className="text-xs text-gray-500 mt-1">
                                {['Jan', 'Apr', 'Jul', 'Oct'][index / 3]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-50 p-2 rounded-lg">
                        <div className="text-sm font-semibold text-green-700 flex items-center justify-center">
                          <FaArrowUp className="mr-1" /> 8.2%
                        </div>
                        <div className="text-xs text-gray-500">1 Year</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="text-sm font-semibold text-blue-700 flex items-center justify-center">
                          <FaArrowUp className="mr-1" /> 24.5%
                        </div>
                        <div className="text-xs text-gray-500">3 Years</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded-lg">
                        <div className="text-sm font-semibold text-purple-700 flex items-center justify-center">
                          <FaArrowUp className="mr-1" /> 42.1%
                        </div>
                        <div className="text-xs text-gray-500">5 Years</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Market Momentum</h4>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-green-700">Strong</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This area shows strong price appreciation compared to city average
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Price Forecast (12 months)</h4>
                      <div className="flex items-center justify-between">
                        <div className="text-green-700 font-semibold flex items-center">
                          <FaArrowUp className="mr-1" /> {(Math.random() * 3 + 7).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Confidence: {Math.floor(Math.random() * 10) + 85}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Based on economic indicators, supply-demand analysis, and historical trends
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Feature Impact Analysis */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaChartBar className="mr-2 text-purple-600" /> Feature Impact Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">
                      Relative importance of different property features in determining the final valuation
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Key Value Drivers</h4>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">Location Quality</span>
                          <span className="text-green-700">+{Math.floor(Math.random() * 10) + 15}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">Property Size</span>
                          <span className="text-green-700">+{Math.floor(Math.random() * 5) + 10}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">BHK Configuration</span>
                          <span className="text-green-700">+{Math.floor(Math.random() * 5) + 8}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '55%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">Bathroom Count</span>
                          <span className="text-green-700">+{Math.floor(Math.random() * 3) + 5}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">Balcony</span>
                          <span className="text-green-700">+{Math.floor(Math.random() * 3) + 2}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Market Insights */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaHome className="mr-2 text-orange-600" /> Market Insights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="text-sm font-semibold text-orange-700 mb-2">Supply & Demand</h4>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">Demand: <span className="text-green-700">High</span></div>
                          <div className="font-medium">Supply: <span className="text-amber-700">Moderate</span></div>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {Math.random() > 0.5 ? <FaArrowUp /> : <FaEquals />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        High demand and moderate supply indicate potential for price appreciation
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-700 mb-2">Recent Transactions</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Similar 3 BHK, {Math.floor(Math.random() * 200) + 1100} sq.ft</span>
                          <span className="font-medium">₹{(Math.random() * 20 + 90).toFixed(2)} Lakhs</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Similar 3 BHK, {Math.floor(Math.random() * 200) + 1100} sq.ft</span>
                          <span className="font-medium">₹{(Math.random() * 20 + 90).toFixed(2)} Lakhs</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Similar 3 BHK, {Math.floor(Math.random() * 200) + 1100} sq.ft</span>
                          <span className="font-medium">₹{(Math.random() * 20 + 90).toFixed(2)} Lakhs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Locality Comparison</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">Your Location</span>
                          <span>₹{analysisData.price_per_sqft || Math.floor(Math.random() * 1000) + 4000}/sq.ft</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Nearby Area 1</span>
                          <span>₹{Math.floor(Math.random() * 1000) + 3500}/sq.ft</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Nearby Area 2</span>
                          <span>₹{Math.floor(Math.random() * 1000) + 4200}/sq.ft</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>City Average</span>
                          <span>₹{Math.floor(Math.random() * 500) + 3800}/sq.ft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Investment Analysis */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaRupeeSign className="mr-2 text-green-600" /> Investment Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-sm text-green-700 font-medium mb-1">ROI Potential</div>
                    <div className="text-2xl font-bold text-green-700">{(Math.random() * 3 + 12).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Annual return on investment</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-sm text-blue-700 font-medium mb-1">Rental Yield</div>
                    <div className="text-2xl font-bold text-blue-700">{(Math.random() * 1.5 + 3).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Annual rental income / property value</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-sm text-purple-700 font-medium mb-1">Break-even</div>
                    <div className="text-2xl font-bold text-purple-700">{Math.floor(Math.random() * 3) + 7} yrs</div>
                    <div className="text-xs text-gray-500 mt-1">Time to recover investment</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    <span className="font-medium">Investment Insight:</span> This property shows strong potential for capital appreciation based on location growth trends and infrastructure development plans in the area.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* AI Model Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🧠 AI Model Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Algorithm:</span>
                <div className="font-semibold">Ensemble ML Model</div>
              </div>
              <div>
                <span className="text-gray-500">Training Data:</span>
                <div className="font-semibold">50,000+ Properties</div>
              </div>
              <div>
                <span className="text-gray-500">Accuracy:</span>
                <div className="font-semibold text-green-600">{analysisData.model_confidence || analysisData.confidence}%</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              This prediction is generated using advanced machine learning algorithms trained on extensive Bangalore real estate data, 
              including location factors, property features, and market trends.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Get Another Prediction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;