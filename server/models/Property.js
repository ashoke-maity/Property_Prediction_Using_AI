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
        enum: ['Ready To Move', 'Under Construction'],
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
        enum: ['Apartment', 'Villa', 'Plot', 'House'],
        default: 'Apartment'
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

// Index for geospatial queries
propertySchema.index({ "location.coordinates": "2dsphere" });

// Update the updatedAt field before saving
propertySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Property', propertySchema);