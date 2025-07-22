const axios = require('axios');

// IMPORTANT: Populate this array with ALL locality names from your training data.
// The spelling and capitalization must be exact.
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
 * @desc    Predicts property price by calling the Flask AI service
 * @route   POST /api/predict/price
 * @access  Public (or add authentication middleware)
 */
const predictPropertyPrice = async (req, res) => {
    try {
        console.log("Received prediction request:", req.body);
        
        // --- Get user input from the request (supporting both direct API calls and form data) ---
        let { total_sqft, bath, balcony, BHK, locality, address, area, bathrooms, bhk } = req.body;
        
        // Handle form data format (from frontend form)
        if (!total_sqft && area) total_sqft = area;
        if (!bath && bathrooms) bath = bathrooms;
        if (!BHK && bhk) BHK = bhk;
        if (!locality && address) locality = extractLocalityFromAddress(address);
        
        // Set default balcony if not provided
        if (!balcony) balcony = 1;

        // --- Validate the input ---
        if (!total_sqft || !bath || !BHK) {
            return res.status(400).json({ 
                message: 'Missing required fields: total_sqft (or area), bath (or bathrooms), and BHK (or bhk) are required.' 
            });
        }

        // Validate locality
        if (!ALL_LOCALITIES.includes(locality)) {
            console.log(`Locality '${locality}' not found, using default 'Whitefield'`);
            locality = 'Whitefield'; // Use default instead of throwing error
        }

        // --- Transform data for the Python model ---
        const payload = {
            'total_sqft': Number(total_sqft),
            'bath': Number(bath),
            'balcony': Number(balcony) || 1,
            'BHK': Number(BHK),
            // Set default values for other required features
            'area_type_Carpet  Area': 0,
            'area_type_Plot  Area': 0,
            'area_type_Super built-up  Area': 1, // Default to Super built-up area
            'availability_Ready To Move': 1, // Default to ready to move
        };

        // Set all availability columns to 0 first
        const availabilityColumns = [
            'availability_14-Nov', 'availability_15-Aug', 'availability_15-Dec', 'availability_15-Jun',
            'availability_15-Nov', 'availability_15-Oct', 'availability_16-Dec', 'availability_16-Jan',
            'availability_16-Jul', 'availability_16-Mar', 'availability_16-Nov', 'availability_16-Oct',
            'availability_16-Sep', 'availability_17-Apr', 'availability_17-Aug', 'availability_17-Dec',
            'availability_17-Feb', 'availability_17-Jan', 'availability_17-Jul', 'availability_17-Jun',
            'availability_17-Mar', 'availability_17-May', 'availability_17-Nov', 'availability_17-Oct',
            'availability_17-Sep', 'availability_18-Apr', 'availability_18-Aug', 'availability_18-Dec',
            'availability_18-Feb', 'availability_18-Jan', 'availability_18-Jul', 'availability_18-Jun',
            'availability_18-Mar', 'availability_18-May', 'availability_18-Nov', 'availability_18-Oct',
            'availability_18-Sep', 'availability_19-Apr', 'availability_19-Aug', 'availability_19-Dec',
            'availability_19-Feb', 'availability_19-Jan', 'availability_19-Jul', 'availability_19-Jun',
            'availability_19-Mar', 'availability_19-May', 'availability_19-Nov', 'availability_19-Oct',
            'availability_19-Sep', 'availability_20-Apr', 'availability_20-Aug', 'availability_20-Dec',
            'availability_20-Feb', 'availability_20-Jan', 'availability_20-Jul', 'availability_20-Jun',
            'availability_20-Mar', 'availability_20-May', 'availability_20-Nov', 'availability_20-Oct',
            'availability_20-Sep', 'availability_21-Aug', 'availability_21-Dec', 'availability_21-Feb',
            'availability_21-Jan', 'availability_21-Jul', 'availability_21-Jun', 'availability_21-Mar',
            'availability_21-May', 'availability_21-Nov', 'availability_21-Oct', 'availability_21-Sep',
            'availability_22-Dec', 'availability_22-Jan', 'availability_22-Jun', 'availability_22-Mar',
            'availability_22-May', 'availability_22-Nov'
        ];
        
        availabilityColumns.forEach(col => {
            payload[col] = 0;
        });

        // One-hot encode the location field (note: it's 'location_' not 'locality_')
        ALL_LOCALITIES.forEach(loc => {
            const columnName = `location_${loc}`; // Must match your model's column names
            payload[columnName] = (loc === locality) ? 1 : 0;
        });
        
        // Set location_other to 0 (since we're using a specific locality)
        payload['location_other'] = 0;

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
                total_sqft: Number(total_sqft),
                bath: Number(bath),
                balcony: Number(balcony) || 1,
                BHK: Number(BHK),
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