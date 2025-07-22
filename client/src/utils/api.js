const API_BASE_URL = import.meta.env.VITE_SERVER_ROUTE;
const API_PREFIX = import.meta.env.VITE_USER_API_KEY;

/**
 * Extract locality from address for AI model
 * @param {string} address - Full address string
 * @returns {string} - Extracted locality or default
 */
const extractLocalityFromAddress = (address) => {
    if (!address) return 'Whitefield';
    
    // List of known Bangalore localities that the AI model supports (from prediction controller)
    const knownLocalities = [
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
    
    const addressLower = address.toLowerCase();
    
    // Sort localities by length (longest first) for better matching
    const sortedLocalities = knownLocalities.sort((a, b) => b.length - a.length);
    
    // Find the best matching locality
    for (const locality of sortedLocalities) {
        if (addressLower.includes(locality.toLowerCase())) {
            console.log(`Matched locality: ${locality} from address: ${address}`);
            return locality;
        }
    }
    
    // Try some common variations and abbreviations
    const variations = {
        'hsr': 'HSR Layout',
        'btm': 'BTM Layout',
        'kr puram': 'KR Puram',
        'cv raman nagar': 'CV Raman Nagar',
        'rr nagar': 'Raja Rajeshwari Nagar',
        'electronic city': 'Electronic City',
        'sarjapur': 'Sarjapur Road'
    };
    
    for (const [variation, fullName] of Object.entries(variations)) {
        if (addressLower.includes(variation)) {
            console.log(`Matched variation: ${variation} -> ${fullName} from address: ${address}`);
            return fullName;
        }
    }
    
    console.log(`No locality match found for: ${address}, using default: Whitefield`);
    return 'Whitefield';
};

/**
 * Makes a prediction request to the Node.js server
 * @param {Object} propertyData - The property data from the form
 * @returns {Promise<Object>} - The prediction result
 */
export const predictPropertyPrice = async (propertyData) => {
    try {
        // Transform the streamlined form data to match the AI model expected format
        const payload = {
            total_sqft: parseInt(propertyData.area),
            bath: parseInt(propertyData.bathrooms),
            balcony: propertyData.balcony ? parseInt(propertyData.balcony) : 0, // Default to 0 if empty
            BHK: parseInt(propertyData.bhk),
            address: propertyData.address, // Send full address for locality extraction
            locality: extractLocalityFromAddress(propertyData.address),
            // Add the new required fields for the AI model
            areaType: propertyData.areaType || 'Super built-up  Area',
            availability: propertyData.availability || 'Ready To Move',
            availabilityDate: propertyData.availabilityDate || null
        };

        console.log('Sending prediction request:', payload);
        console.log('Extracted locality:', payload.locality);

        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/predict/price`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Prediction result:', result);
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

/**
 * Registers a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Registration result
 */
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Registration Error:', error);
        throw error;
    }
};

/**
 * Logs in a user
 * @param {Object} loginData - User login data
 * @returns {Promise<Object>} - Login result
 */
export const loginUser = async (loginData) => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/login`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
};

/**
 * Checks if the server is running
 * @returns {Promise<Object>} - Health check result
 */
export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Health Check Error:', error);
        throw error;
    }
};