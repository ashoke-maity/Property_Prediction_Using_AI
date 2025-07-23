const express = require('express');
const router = express.Router();
const { 
    getAllProperties, 
    getPropertyById, 
    addProperty, 
    getNearbyProperties,
    seedProperties 
} = require('../controllers/property.Controller');

// Get all properties with optional filters
router.get('/properties', getAllProperties);

// Get properties near a location
router.get('/properties/nearby', getNearbyProperties);

// Get single property by ID
router.get('/properties/:id', getPropertyById);

// Add new property
router.post('/properties', addProperty);

// Seed sample properties (remove in production)
router.post('/properties/seed', seedProperties);

module.exports = router;