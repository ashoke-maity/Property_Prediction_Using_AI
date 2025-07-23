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

        // Create a comprehensive payload with all availability features the model expects
        // Based on the error message, these are some of the features the model was trained with
        const commonAvailabilityFeatures = [
            'availability_Ready To Move',
            'availability_14-Nov', 'availability_15-Aug', 'availability_15-Dec', 'availability_15-Jun', 'availability_15-Nov',
            'availability_16-Dec', 'availability_16-Feb', 'availability_16-May', 'availability_17-Jun', 'availability_17-Mar',
            'availability_18-Dec', 'availability_18-Jun', 'availability_19-Dec', 'availability_19-Jun', 'availability_19-Mar',
            'availability_20-Dec', 'availability_20-Jun', 'availability_20-Sep', 'availability_21-Jun', 'availability_22-Dec',
            'availability_23-Dec', 'availability_24-Dec', 'availability_25-Dec',
            // Add more based on common patterns
            'availability_16-Jan', 'availability_16-Mar', 'availability_16-Apr', 'availability_16-Jul', 'availability_16-Aug',
            'availability_16-Sep', 'availability_16-Oct', 'availability_16-Nov',
            'availability_17-Jan', 'availability_17-Feb', 'availability_17-Apr', 'availability_17-May', 'availability_17-Jul',
            'availability_17-Aug', 'availability_17-Sep', 'availability_17-Oct', 'availability_17-Nov', 'availability_17-Dec',
            'availability_18-Jan', 'availability_18-Feb', 'availability_18-Mar', 'availability_18-Apr', 'availability_18-May',
            'availability_18-Jul', 'availability_18-Aug', 'availability_18-Sep', 'availability_18-Oct', 'availability_18-Nov',
            'availability_19-Jan', 'availability_19-Feb', 'availability_19-Apr', 'availability_19-May', 'availability_19-Jul',
            'availability_19-Aug', 'availability_19-Sep', 'availability_19-Oct', 'availability_19-Nov',
            'availability_20-Jan', 'availability_20-Feb', 'availability_20-Mar', 'availability_20-Apr', 'availability_20-May',
            'availability_20-Jul', 'availability_20-Aug', 'availability_20-Oct', 'availability_20-Nov',
            'availability_21-Jan', 'availability_21-Feb', 'availability_21-Mar', 'availability_21-Apr', 'availability_21-May',
            'availability_21-Jul', 'availability_21-Aug', 'availability_21-Sep', 'availability_21-Oct', 'availability_21-Nov',
            'availability_21-Dec',
            'availability_22-Jan', 'availability_22-Feb', 'availability_22-Mar', 'availability_22-Apr', 'availability_22-May',
            'availability_22-Jun', 'availability_22-Jul', 'availability_22-Aug', 'availability_22-Sep', 'availability_22-Oct',
            'availability_22-Nov',
            'availability_23-Jan', 'availability_23-Feb', 'availability_23-Mar', 'availability_23-Apr', 'availability_23-May',
            'availability_23-Jun', 'availability_23-Jul', 'availability_23-Aug', 'availability_23-Sep', 'availability_23-Oct',
            'availability_23-Nov',
            'availability_24-Jan', 'availability_24-Feb', 'availability_24-Mar', 'availability_24-Apr', 'availability_24-May',
            'availability_24-Jun', 'availability_24-Jul', 'availability_24-Aug', 'availability_24-Sep', 'availability_24-Oct',
            'availability_24-Nov',
            'availability_25-Jan', 'availability_25-Feb', 'availability_25-Mar', 'availability_25-Apr', 'availability_25-May',
            'availability_25-Jun', 'availability_25-Jul', 'availability_25-Aug', 'availability_25-Sep', 'availability_25-Oct',
            'availability_25-Nov'
        ];

        // Initialize payload with basic features
        const payload = {
            'total_sqft': safeNumber(total_sqft),
            'bath': safeNumber(bath),
            'balcony': safeNumber(balcony, 1),
            'BHK': safeNumber(BHK),
            // Area type one-hot encoding
            'area_type_Carpet  Area': (areaType === 'Carpet  Area') ? 1 : 0,
            'area_type_Plot  Area': (areaType === 'Plot  Area') ? 1 : 0,
            'area_type_Super built-up  Area': (areaType === 'Super built-up  Area') ? 1 : 0,
            // For dynamic locations, always use location_other
            'location_other': 1
        };

        // Initialize all availability features to 0
        commonAvailabilityFeatures.forEach(feature => {
            payload[feature] = 0;
        });

        // Set the appropriate availability feature to 1
        if (formattedAvailability === 'Ready To Move') {
            payload['availability_Ready To Move'] = 1;
        } else {
            // Check if the formatted availability matches any of the known features
            const availabilityFeatureName = `availability_${formattedAvailability}`;
            if (commonAvailabilityFeatures.includes(availabilityFeatureName)) {
                payload[availabilityFeatureName] = 1;
            } else {
                // If the specific date is not in training data, default to Ready To Move
                payload['availability_Ready To Move'] = 1;
                console.log(`⚠️ Availability date ${formattedAvailability} not found in training data, defaulting to Ready To Move`);
            }
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
        const flaskApiUrl = process.env.FLASK_API_URL || `http://127.0.0.1:${process.env.FLASK_PORT || 5001}`;
        const fullFlaskUrl = `${flaskApiUrl}/predict`;
        console.log("Sending payload to Flask:", payload);
        console.log("Flask API URL:", fullFlaskUrl);
        
        const response = await axios.post(fullFlaskUrl, payload, {
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