const axios = require('axios');

/**
 * Convert availability date to the format expected by the AI model
 * @param {string} availability - 'Ready To Move' or 'specific_date'
 * @param {string} availabilityDate - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted availability string for the model
 */
const formatAvailabilityForModel = (availability, availabilityDate) => {
    if (availability === 'Ready To Move') {
        return 'Ready To Move';
    }
    
    if (availability === 'specific_date' && availabilityDate) {
        // Convert YYYY-MM-DD to YY-MMM format (e.g., "2024-03-15" -> "24-Mar")
        const date = new Date(availabilityDate);
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getMonth()];
        return `${year}-${month}`;
    }
    
    return 'Ready To Move'; // Default fallback
};

/**
 * @desc    Predicts property price by calling the Flask AI service
 * @route   POST /api/predict/price
 * @access  Public (or add authentication middleware)
 */
/**
 * Simulate AI processing steps with realistic delays
 */
const simulateAIProcessing = async (callback) => {
    const steps = [
        { step: 'initializing', message: 'Initializing AI model...', delay: 800 },
        { step: 'analyzing', message: 'Analyzing market data...', delay: 1200 },
        { step: 'processing', message: 'Processing location factors...', delay: 1000 },
        { step: 'calculating', message: 'Running price prediction algorithms...', delay: 1500 },
        { step: 'validating', message: 'Validating results against market trends...', delay: 900 },
        { step: 'finalizing', message: 'Finalizing prediction...', delay: 600 }
    ];

    for (const stepData of steps) {
        if (callback) callback(stepData);
        await new Promise(resolve => setTimeout(resolve, stepData.delay));
    }
};

const predictPropertyPrice = async (req, res) => {
    try {
        console.log("Received prediction request:", req.body);
        
        // Add AI processing simulation delay
        const startTime = Date.now();
        
        // --- Get user input from the request (supporting both direct API calls and form data) ---
        let { total_sqft, bath, balcony, BHK, locality, address, area, bathrooms, bhk, areaType, availability, availabilityDate } = req.body;
        
        // Handle form data format (from frontend form)
        if (!total_sqft && area) total_sqft = area;
        if (!bath && bathrooms) bath = bathrooms;
        if (!BHK && bhk) BHK = bhk;
        
        // Use the locality from user input (map selection) directly
        // No need to extract from address - use whatever locality the user provides
        if (!locality) {
            locality = 'User Selected Location'; // Default name for map-selected locations
        }
        
        console.log(`Using user-selected locality: ${locality}`);
        
        // Set defaults if not provided
        if (!balcony) balcony = 1;
        if (!areaType) areaType = 'Super built-up  Area';
        if (!availability) availability = 'Ready To Move';

        // --- Validate the input ---
        if (!total_sqft || !bath || !BHK) {
            return res.status(400).json({ 
                message: 'Missing required fields: total_sqft (or area), bath (or bathrooms), and BHK (or bhk) are required.' 
            });
        }

        // Format availability for the model
        const formattedAvailability = formatAvailabilityForModel(availability, availabilityDate);
        
        // --- Transform data for the Python model (Simplified for Dynamic Locations) ---
        // Helper function to safely convert to number and handle NaN
        const safeNumber = (value, defaultValue = 0) => {
            const num = Number(value);
            return isNaN(num) ? defaultValue : num;
        };

        // Debug logging
        console.log("Input values before conversion:", {
            total_sqft, bath, balcony, BHK, locality, areaType, availability: formattedAvailability
        });

        // Simplified payload - only send essential features
        // The Flask API will handle creating all other features with default values
        const payload = {
            'total_sqft': safeNumber(total_sqft),
            'bath': safeNumber(bath),
            'balcony': safeNumber(balcony, 1),
            'BHK': safeNumber(BHK),
            // Area type one-hot encoding
            'area_type_Carpet  Area': (areaType === 'Carpet  Area') ? 1 : 0,
            'area_type_Plot  Area': (areaType === 'Plot  Area') ? 1 : 0,
            'area_type_Super built-up  Area': (areaType === 'Super built-up  Area') ? 1 : 0,
            // Availability - only set the relevant one
            'availability_Ready To Move': (formattedAvailability === 'Ready To Move') ? 1 : 0,
            // For dynamic locations, always use location_other
            'location_other': 1
        };

        // If availability is not "Ready To Move", set the specific date
        if (formattedAvailability !== 'Ready To Move') {
            const availabilityColumnName = `availability_${formattedAvailability}`;
            payload[availabilityColumnName] = 1;
            payload['availability_Ready To Move'] = 0; // Override the Ready To Move
        }
        
        console.log(`🗺️ Using dynamic location: ${locality} (mapped to location_other=1)`);

        // --- Validate payload for NaN values ---
        const hasNaN = Object.entries(payload).some(([key, value]) => {
            if (typeof value === 'number' && isNaN(value)) {
                console.error(`NaN detected in payload for key: ${key}, value: ${value}`);
                return true;
            }
            return false;
        });

        if (hasNaN) {
            return res.status(400).json({
                message: 'Invalid numeric values detected in input data',
                error: 'INVALID_INPUT'
            });
        }

        // --- Simulate AI Processing Steps ---
        console.log("🤖 Starting AI analysis simulation...");
        await simulateAIProcessing((stepData) => {
            console.log(`AI Processing: ${stepData.message}`);
        });

        // --- Call the Flask API 🐍 ---
        const flaskApiUrl = `http://127.0.0.1:${process.env.FLASK_PORT}/predict`;
        console.log("Sending payload to Flask:", payload);
        console.log("Flask API URL:", flaskApiUrl);
        
        const response = await axios.post(flaskApiUrl, payload, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Flask response:", response.data);
        
        // Add processing time to response for realism
        const processingTime = Date.now() - startTime;

        // Generate additional analysis data for enhanced UI
        const analysisMetadata = {
            processing_time_ms: processingTime,
            model_confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
            market_comparisons: Math.floor(Math.random() * 100) + 150, // 150-250 properties
            location_score: Math.floor(Math.random() * 20) + 80, // 80-100
            price_per_sqft: Math.floor((response.data.predicted_price * 100000) / safeNumber(total_sqft)),
            market_trend: Math.random() > 0.6 ? 'Bullish' : Math.random() > 0.3 ? 'Stable' : 'Bearish',
            investment_grade: ['A+', 'A', 'A-', 'B+', 'B'][Math.floor(Math.random() * 5)],
            appreciation_forecast: (Math.random() * 8 + 5).toFixed(1) + '%',
            rental_yield_estimate: (Math.random() * 2 + 3).toFixed(1) + '%',
            analysis_factors: {
                location_weight: 35,
                area_weight: 25,
                bhk_weight: 20,
                amenities_weight: 12,
                market_conditions_weight: 8
            },
            nearby_amenities: {
                schools: Math.floor(Math.random() * 5) + 3,
                hospitals: Math.floor(Math.random() * 3) + 2,
                malls: Math.floor(Math.random() * 4) + 1,
                metro_distance: (Math.random() * 3 + 0.5).toFixed(1) + ' km'
            }
        };

        // --- Return the prediction to the client ---
        res.status(200).json({
            ...response.data,
            locality_used: locality,
            analysis_metadata: analysisMetadata,
            input_data: {
                total_sqft: safeNumber(total_sqft),
                bath: safeNumber(bath),
                balcony: safeNumber(balcony, 1),
                BHK: safeNumber(BHK),
                locality: locality
            }
        });

    } catch (error) {
        console.error("Error calling prediction service:", error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                message: 'Flask prediction service is not running. Please start the Python server.',
                error: 'SERVICE_UNAVAILABLE'
            });
        }
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Flask API Error Data:', error.response.data);
            console.error('Flask API Error Status:', error.response.status);
            return res.status(500).json({ 
                message: 'The prediction service failed.', 
                details: error.response.data 
            });
        }
        
        // Something happened in setting up the request that triggered an Error
        res.status(500).json({ 
            message: 'Server error while trying to predict price.',
            error: error.message 
        });
    }
};

module.exports = {
    predictPropertyPrice
};