const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // Register model
const Model = mongoose.model('trips');
const User = mongoose.model('User'); 
const { validationResult } = require('express-validator');

// GET: /trips - lists all the trips
const tripsList = async (req, res) => {
    try {
        let query = {}; // Initialize an empty query object

        // Check if there are query parameters for filteringconst mongoose = require('mongoose');
const Trip = require('../models/travlr'); // Register model
const Model = mongoose.model('trips');
const User = mongoose.model('User'); 
const { validationResult } = require('express-validator');

// GET: /trips - lists all the trips with optional sorting
const tripsList = async (req, res) => {
    try {
        let query = {}; // Initialize an empty query object

        // Check if there are query parameters for filtering
        if (req.query) {
            if (req.query.name) {
                // Add search by trip name
                query.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive search
            }
            // Additional filtering criteria can be added here
        }

        // Check for sorting parameters
        const sortAttribute = req.query.sortBy || 'name'; // Default sort by name
        const sortOrder = req.query.order === 'desc' ? -1 : 1; // Sort order (asc or desc)

        const trips = await Model.find(query).sort({ [sortAttribute]: sortOrder }).exec();

        if (!trips || trips.length === 0) {
            return res.status(404).json({ message: "No trips found." });
        }

        return res.status(200).json(trips);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// GET: /trips/:tripCode - lists a single trip
const tripsFindByCode = async (req, res) => {
    try {
        const trip = await Model.find({ 'code': req.params.tripCode }).exec();

        if (!trip || trip.length === 0) {
            return res.status(404).json({ message: "Trip not found with code " + req.params.tripCode });
        }

        return res.status(200).json(trip);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// POST: /trips - Adds a new trip
const tripsAddTrip = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    getUser(req, res, async (req, res) => {
        try {
            const trip = await Trip.create(req.body);
            return res.status(201).json(trip);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal server error." });
        }
    });
};

// PUT: /trips/:tripCode - Updates an existing Trip
const tripsUpdateTrip = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    getUser(req, res, async (req, res) => {
        try {
            const trip = await Trip.findOneAndUpdate(
                { 'code': req.params.tripCode },
                req.body,
                { new: true }
            );
            if (!trip) {
                return res.status(404).send({ message: "Trip not found with code " + req.params.tripCode });
            }
            return res.status(200).json(trip);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal server error." });
        }
    });
};

const getUser = (req, res, callback) => {
    if (req.payload && req.payload.email) {
        User.findOne({ email: req.payload.email }).exec((err, user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            } else if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error." });
            }
            callback(req, res, user.name);
        });
    } else {
        return res.status(404).json({ message: "User not found" });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};

        if (req.query) {
            if (req.query.name) {
                // Add search by trip name
                query.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive search
            }
            // Will add more conditions here for additional filtering criteria such as location, duration, etc.
        }

        const trips = await Model.find(query).exec();

        if (!trips || trips.length === 0) {
            return res.status(404).json({ message: "No trips found." });
        }

        return res.status(200).json(trips);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// GET: /trips/:tripCode - lists a single trip
const tripsFindByCode = async (req, res) => {
    try {
        const trip = await Model.find({ 'code': req.params.tripCode }).exec();

        if (!trip || trip.length === 0) {
            return res.status(404).json({ message: "Trip not found with code " + req.params.tripCode });
        }

        return res.status(200).json(trip);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// POST: /trips - Adds a new trip
const tripsAddTrip = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    getUser(req, res, async (req, res) => {
        try {
            const trip = await Trip.create(req.body);
            return res.status(201).json(trip);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal server error." });
        }
    });
};

// PUT: /trips/:tripCode - Updates an existing Trip
const tripsUpdateTrip = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    getUser(req, res, async (req, res) => {
        try {
            const trip = await Trip.findOneAndUpdate(
                { 'code': req.params.tripCode },
                req.body,
                { new: true }
            );
            if (!trip) {
                return res.status(404).send({ message: "Trip not found with code " + req.params.tripCode });
            }
            return res.status(200).json(trip);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal server error." });
        }
    });
};

const getUser = (req, res, callback) => {
    if (req.payload && req.payload.email) {
        User.findOne({ email: req.payload.email }).exec((err, user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            } else if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal server error." });
            }
            callback(req, res, user.name);
        });
    } else {
        return res.status(404).json({ message: "User not found" });
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};