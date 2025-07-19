const axios = require('axios');

// IMPORTANT: Populate this array with ALL locality names from your training data.
// The spelling and capitalization must be exact.
const ALL_LOCALITIES = [
    'Whitefield', 'Sarjapur Road', 'Electronic City', 'Marathahalli', 
    'Raja Rajeshwari Nagar', 'Haralur Road', 'Hennur Road', // ... ADD ALL OTHER LOCALITIES HERE
];

/**
 * @desc    Predicts property price by calling the Flask AI service
 * @route   POST /api/predict/price
 * @access  Public (or add authentication middleware)
 */
const predictPropertyPrice = async (req, res) => {
    try {
        // --- Get user input from the request ---
        const { total_sqft, bath, balcony, BHK, locality } = req.body;

        // --- Validate the input ---
        if (!total_sqft || !bath || !BHK || !locality) {
            return res.status(400).json({ message: 'Missing required fields for prediction.' });
        }

        if (!ALL_LOCALITIES.includes(locality)) {
            return res.status(400).json({ 
                message: `Invalid locality. The locality '${locality}' is not in our dataset.` 
            });
        }

        // --- Transform data for the Python model ---
        const payload = {
            'total_sqft': Number(total_sqft),
            'bath': Number(bath),
            'balcony': Number(balcony),
            'BHK': Number(BHK),
        };

        // One-hot encode the locality field
        ALL_LOCALITIES.forEach(loc => {
            const columnName = `locality_${loc}`; // Must match your model's column names
            payload[columnName] = (loc === locality) ? 1 : 0;
        });

        // --- Call the Flask API 🐍 ---
        const flaskApiUrl = 'http://127.0.0.1:5001/predict';
        console.log("Sending payload to Flask:", payload); // Good for debugging
        
        const response = await axios.post(flaskApiUrl, payload);

        // --- Return the prediction to the client ---
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Error calling prediction service:", error.message);
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
        res.status(500).json({ message: 'Server error while trying to predict price.' });
    }
};

module.exports = {
    predictPropertyPrice
};