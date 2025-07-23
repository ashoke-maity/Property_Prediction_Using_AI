const Property = require('../models/property.Model');

/**
 * @desc    Get all available properties
 * @route   GET /api/properties
 * @access  Public
 */
const getAllProperties = async (req, res) => {
    try {
        const { 
            minPrice, 
            maxPrice, 
            bhk, 
            minArea, 
            maxArea, 
            propertyType, 
            availability,
            lat,
            lng,
            radius = 5 // default 5km radius
        } = req.query;

        let query = { status: 'Available' };

        // Price filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // BHK filter
        if (bhk) {
            query.bhk = parseInt(bhk);
        }

        // Area filter
        if (minArea || maxArea) {
            query.area = {};
            if (minArea) query.area.$gte = parseFloat(minArea);
            if (maxArea) query.area.$lte = parseFloat(maxArea);
        }

        // Property type filter
        if (propertyType) {
            query.propertyType = propertyType;
        }

        // Availability filter
        if (availability) {
            query.availability = availability;
        }

        let properties;

        // Location-based search
        if (lat && lng) {
            const radiusInDegrees = parseFloat(radius) / 111; // Rough conversion: 1 degree ≈ 111 km
            
            properties = await Property.find({
                ...query,
                'location.coordinates.lat': {
                    $gte: parseFloat(lat) - radiusInDegrees,
                    $lte: parseFloat(lat) + radiusInDegrees
                },
                'location.coordinates.lng': {
                    $gte: parseFloat(lng) - radiusInDegrees,
                    $lte: parseFloat(lng) + radiusInDegrees
                }
            }).sort({ createdAt: -1 });
        } else {
            properties = await Property.find(query).sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });

    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching properties',
            error: error.message
        });
    }
};

/**
 * @desc    Get single property by ID
 * @route   GET /api/properties/:id
 * @access  Public
 */
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.status(200).json({
            success: true,
            data: property
        });

    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching property',
            error: error.message
        });
    }
};

/**
 * @desc    Add new property
 * @route   POST /api/properties
 * @access  Public (can be protected later)
 */
const addProperty = async (req, res) => {
    try {
        const property = new Property(req.body);
        const savedProperty = await property.save();

        res.status(201).json({
            success: true,
            message: 'Property added successfully',
            data: savedProperty
        });

    } catch (error) {
        console.error('Error adding property:', error);
        res.status(400).json({
            success: false,
            message: 'Error adding property',
            error: error.message
        });
    }
};

/**
 * @desc    Get properties near a location
 * @route   GET /api/properties/nearby
 * @access  Public
 */
const getNearbyProperties = async (req, res) => {
    try {
        const { lat, lng, radius = 2 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const radiusInDegrees = parseFloat(radius) / 111; // Rough conversion
        
        const properties = await Property.find({
            status: 'Available',
            'location.coordinates.lat': {
                $gte: parseFloat(lat) - radiusInDegrees,
                $lte: parseFloat(lat) + radiusInDegrees
            },
            'location.coordinates.lng': {
                $gte: parseFloat(lng) - radiusInDegrees,
                $lte: parseFloat(lng) + radiusInDegrees
            }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });

    } catch (error) {
        console.error('Error fetching nearby properties:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching nearby properties',
            error: error.message
        });
    }
};

/**
 * @desc    Seed sample properties for testing
 * @route   POST /api/properties/seed
 * @access  Public (remove in production)
 */
const seedProperties = async (req, res) => {
    try {
        // Clear existing properties
        await Property.deleteMany({});

        const sampleProperties = [
            {
                title: "Luxury 3 BHK Apartment in Whitefield",
                description: "Spacious 3 BHK apartment with modern amenities, close to IT parks and shopping centers.",
                price: 8500000, // 85 lakhs
                area: 1450,
                bhk: 3,
                bathrooms: 3,
                balcony: 2,
                areaType: "Super built-up  Area",
                availability: "Ready To Move",
                location: {
                    address: "Whitefield, Bangalore, Karnataka",
                    coordinates: { lat: 12.9698, lng: 77.7500 },
                    locality: "Whitefield"
                },
                amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Power Backup"],
                propertyType: "Apartment",
                furnishingStatus: "Semi-Furnished",
                parking: 2,
                floor: "5th Floor",
                totalFloors: 12,
                age: 2,
                contactInfo: {
                    name: "Rajesh Kumar",
                    phone: "+91 9876543210",
                    email: "rajesh@example.com"
                }
            },
            {
                title: "Modern 2 BHK in Electronic City",
                description: "Well-designed 2 BHK apartment perfect for IT professionals working in Electronic City.",
                price: 5200000, // 52 lakhs
                area: 1100,
                bhk: 2,
                bathrooms: 2,
                balcony: 1,
                areaType: "Super built-up  Area",
                availability: "Ready To Move",
                location: {
                    address: "Electronic City Phase 1, Bangalore, Karnataka",
                    coordinates: { lat: 12.8456, lng: 77.6603 },
                    locality: "Electronic City"
                },
                amenities: ["Gym", "Security", "Parking", "Power Backup", "Clubhouse"],
                propertyType: "Apartment",
                furnishingStatus: "Unfurnished",
                parking: 1,
                floor: "3rd Floor",
                totalFloors: 8,
                age: 1,
                contactInfo: {
                    name: "Priya Sharma",
                    phone: "+91 9876543211",
                    email: "priya@example.com"
                }
            },
            {
                title: "Spacious 4 BHK Villa in Sarjapur",
                description: "Independent villa with garden, perfect for families looking for spacious living.",
                price: 12500000, // 1.25 crores
                area: 2200,
                bhk: 4,
                bathrooms: 4,
                balcony: 3,
                areaType: "Super built-up  Area",
                availability: "Ready To Move",
                location: {
                    address: "Sarjapur Road, Bangalore, Karnataka",
                    coordinates: { lat: 12.9279, lng: 77.6271 },
                    locality: "Sarjapur Road"
                },
                amenities: ["Garden", "Security", "Parking", "Power Backup", "Swimming Pool"],
                propertyType: "Villa",
                furnishingStatus: "Furnished",
                parking: 3,
                floor: "Ground + 1st Floor",
                totalFloors: 2,
                age: 3,
                contactInfo: {
                    name: "Amit Patel",
                    phone: "+91 9876543212",
                    email: "amit@example.com"
                }
            },
            {
                title: "Cozy 1 BHK Studio in Koramangala",
                description: "Perfect studio apartment for young professionals in the heart of Koramangala.",
                price: 3800000, // 38 lakhs
                area: 650,
                bhk: 1,
                bathrooms: 1,
                balcony: 1,
                areaType: "Carpet  Area",
                availability: "Ready To Move",
                location: {
                    address: "Koramangala 5th Block, Bangalore, Karnataka",
                    coordinates: { lat: 12.9352, lng: 77.6245 },
                    locality: "Koramangala"
                },
                amenities: ["Security", "Parking", "Power Backup", "Elevator"],
                propertyType: "Studio",
                furnishingStatus: "Furnished",
                parking: 1,
                floor: "7th Floor",
                totalFloors: 10,
                age: 1,
                contactInfo: {
                    name: "Sneha Reddy",
                    phone: "+91 9876543213",
                    email: "sneha@example.com"
                }
            },
            {
                title: "Premium 3 BHK in HSR Layout",
                description: "Premium apartment with all modern amenities in the popular HSR Layout area.",
                price: 9200000, // 92 lakhs
                area: 1600,
                bhk: 3,
                bathrooms: 3,
                balcony: 2,
                areaType: "Super built-up  Area",
                availability: "Ready To Move",
                location: {
                    address: "HSR Layout Sector 2, Bangalore, Karnataka",
                    coordinates: { lat: 12.9116, lng: 77.6473 },
                    locality: "HSR Layout"
                },
                amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Power Backup", "Clubhouse"],
                propertyType: "Apartment",
                furnishingStatus: "Semi-Furnished",
                parking: 2,
                floor: "6th Floor",
                totalFloors: 15,
                age: 2,
                contactInfo: {
                    name: "Vikram Singh",
                    phone: "+91 9876543214",
                    email: "vikram@example.com"
                }
            }
        ];

        const createdProperties = await Property.insertMany(sampleProperties);

        res.status(201).json({
            success: true,
            message: `${createdProperties.length} sample properties created successfully`,
            data: createdProperties
        });

    } catch (error) {
        console.error('Error seeding properties:', error);
        res.status(500).json({
            success: false,
            message: 'Error seeding properties',
            error: error.message
        });
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    addProperty,
    getNearbyProperties,
    seedProperties
};