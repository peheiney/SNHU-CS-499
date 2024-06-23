const express = require('express'); // Express app
const router = express.Router(); // Router logic
const jwt = require('express-jwt');
const { body } = require('express-validator');

// Middleware for JWT authentication
const auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    algorithms: ['HS256'] // Ensure algorithm is specified
});

// Import controllers
const authController = require('../controllers/authentication');
const tripsController = require('../controllers/trips');

// Routes for authentication
router
    .route('/login')
    .post(authController.login);

router
    .route('/register')
    .post(authController.register);

// Define route for trips endpoint with optional sorting
router
    .route('/trips')
    .get(tripsController.tripsList) // GET Method routes tripList
    .post(
        auth,
        [
            body('name').notEmpty().withMessage('Name is required'),
            body('code').notEmpty().withMessage('Code is required'),
            body('price').isNumeric().withMessage('Price must be a number')
            // Add more validation as needed
        ],
        tripsController.tripsAddTrip
    ); // POST Method Adds a Trip

// GET Method routes tripsFindByCode and PUT Method to update trip
router
    .route('/trips/:tripcode')
    .get(tripsController.tripsFindByCode)
    .put(
        auth,
        [
            body('name').optional().notEmpty().withMessage('Name is required if provided'),
            body('price').optional().isNumeric().withMessage('Price must be a number if provided')
            // Add more validation as needed
        ],
        tripsController.tripsUpdateTrip
    );

module.exports = router;
