const express = require('express');
const router = express.Router();
const { predictPropertyPrice } = require('../controllers/prediction.Controller');

// This will create the endpoint POST /api/predict/price
router.post('/predict/price', predictPropertyPrice);

module.exports = router;