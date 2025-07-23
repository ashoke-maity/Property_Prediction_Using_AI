const API_BASE_URL = import.meta.env.VITE_SERVER_ROUTE;
const API_PREFIX = import.meta.env.VITE_USER_API_KEY;

/**
 * Extract locality name from address for display purposes
 * @param {string} address - Full address string
 * @returns {string} - Extracted locality name
 */
const extractLocalityFromAddress = (address) => {
    if (!address) return 'Selected Location';
    
    // Extract the first part of the address as locality
    const parts = address.split(',');
    return parts[0].trim() || 'Selected Location';
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
 * @param {Object} loginData - User login data (email, password)
 * @returns {Promise<Object>} - Login result
 */
export const loginUser = async (loginData) => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
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
 * Get all available properties with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Properties list
 */
export const getAllProperties = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                queryParams.append(key, filters[key]);
            }
        });

        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/properties?${queryParams}`, {
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
        console.error('Get Properties Error:', error);
        throw error;
    }
};

/**
 * Get properties near a specific location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in km (default: 2)
 * @returns {Promise<Object>} - Nearby properties
 */
export const getNearbyProperties = async (lat, lng, radius = 2) => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/properties/nearby?lat=${lat}&lng=${lng}&radius=${radius}`, {
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
        console.error('Get Nearby Properties Error:', error);
        throw error;
    }
};

/**
 * Get single property by ID
 * @param {string} propertyId - Property ID
 * @returns {Promise<Object>} - Property details
 */
export const getPropertyById = async (propertyId) => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/properties/${propertyId}`, {
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
        console.error('Get Property Error:', error);
        throw error;
    }
};

/**
 * Add a new property listing
 * @param {Object} propertyData - Property data
 * @returns {Promise<Object>} - Created property
 */
export const addProperty = async (propertyData) => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Add Property Error:', error);
        throw error;
    }
};

/**
 * Seed sample properties (for testing)
 * @returns {Promise<Object>} - Seed result
 */
export const seedProperties = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/properties/seed`, {
            method: 'POST',
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
        console.error('Seed Properties Error:', error);
        throw error;
    }
};

/**
 * Get user profile (requires authentication)
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Get User Profile Error:', error);
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