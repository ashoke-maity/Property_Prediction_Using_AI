const axios = require('axios');

const ALL_LOCALITIES = [
    'Whitefield', 'Sarjapur Road', 'Electronic City', 'Marathahalli', 
    'Raja Rajeshwari Nagar', 'Haralur Road', 'Hennur Road', 'Koramangala',
    'Indiranagar', 'HSR Layout', 'BTM Layout', 'Jayanagar', 'Banashankari',
    'Rajajinagar', 'Malleshwaram', 'Yelahanka', 'Hebbal', 'Bellandur',
    'Sarjapur', 'Varthur', 'Kadugodi', 'KR Puram', 'Ramamurthy Nagar',
    'CV Raman Nagar', 'Domlur', 'Koramangala 1st Block', 'Koramangala 4th Block',
    'Koramangala 5th Block', 'Koramangala 6th Block', 'Koramangala 7th Block',
    'HSR Layout Sector 1', 'HSR Layout Sector 2', 'HSR Layout Sector 3',
    'BTM 1st Stage', 'BTM 2nd Stage', 'Bannerghatta Road', 'Bommanahalli',
    'Begur Road', 'Arekere', 'Hulimavu', 'JP Nagar', 'Uttarahalli'
];

/**
 * Extract locality from address string
 * @param {string} address - Full address
 * @returns {string} - Best matching locality or default
 */
const extractLocalityFromAddress = (address) => {
    if (!address) return 'Whitefield'; // Default locality
    
    const addressLower = address.toLowerCase();
    
    // Find the best matching locality
    for (const locality of ALL_LOCALITIES) {
        if (addressLower.includes(locality.toLowerCase())) {
            return locality;
        }
    }
    
    // If no match found, return default
    return 'Whitefield';
};

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
const predictPropertyPrice = async (req, res) => {
    try {
        console.log("Received prediction request:", req.body);
        
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

        // --- Call the Flask API 🐍 ---
        const flaskApiUrl = `http://127.0.0.1:${process.env.FLASK_PORT || 5001}/predict`;
        console.log("Sending payload to Flask:", payload);
        console.log("Flask API URL:", flaskApiUrl);
        
        const response = await axios.post(flaskApiUrl, payload, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Flask response:", response.data);

        // --- Return the prediction to the client ---
        res.status(200).json({
            ...response.data,
            locality_used: locality,
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