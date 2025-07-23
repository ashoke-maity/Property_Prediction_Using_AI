const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    bhk: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    balcony: {
        type: Number,
        default: 0
    },
    areaType: {
        type: String,
        enum: ['Super built-up  Area', 'Carpet  Area', 'Plot  Area'],
        default: 'Super built-up  Area'
    },
    availability: {
        type: String,
        enum: ['Ready To Move', 'specific_date'],
        default: 'Ready To Move'
    },
    availabilityDate: {
        type: Date
    },
    location: {
        address: {
            type: String,
            required: true
        },
        coordinates: {
            lat: {
                type: Number,
                required: true
            },
            lng: {
                type: Number,
                required: true
            }
        },
        locality: {
            type: String,
            required: true
        }
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    propertyType: {
        type: String,
        enum: ['Apartment', 'Villa', 'Independent House', 'Studio'],
        default: 'Apartment'
    },
    furnishingStatus: {
        type: String,
        enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
        default: 'Unfurnished'
    },
    parking: {
        type: Number,
        default: 0
    },
    floor: {
        type: String
    },
    totalFloors: {
        type: Number
    },
    age: {
        type: Number // in years
    },
    status: {
        type: String,
        enum: ['Available', 'Sold', 'Under Negotiation'],
        default: 'Available'
    },
    contactInfo: {
        name: String,
        phone: String,
        email: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for location-based queries
propertySchema.index({ "location.coordinates.lat": 1, "location.coordinates.lng": 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ bhk: 1, area: 1, price: 1 });

module.exports = mongoose.model('Property', propertySchema);