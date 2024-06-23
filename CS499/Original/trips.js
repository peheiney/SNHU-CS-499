const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // Register model
const Model = mongoose.model('trips');
const User = mongoose.model('User'); 



// GET: /trips - lists all the trips
// Regardless of outcome, response must incluse HTML status code
// and JSON message to the requesting client
const tripsList = async(req, res) => {
    const q = await Model
        .find({}) // No filter, return all records
        .exec();

        // Uncomment the following line to show results of the querey
        // on the console
        // console.log(q);

        if(!q)
        { // Databse returned no data
            return res
                .status(404)
                .json(err);
    
        }   else { // Return resulting trip list
                return res
                    .status(200)
                    .json(q);
    
        }
};

//GET: /trips/:tripCode - lists a single trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsFindByCode = async(req, res) => {
    const q = await Model
        .find({'code' : req.params.tripCode }) // Return a single record
        .exec();

        // Uncomment the following line to show results of the querey
        // on the console
        // console.log(q);

    if(!q)
    { // Databse returned no data
        return res
            .status(404)
            .json(err);

    }   else { // Return resulting trip list
            return res
                .status(200)
                .json(q);

    }
};

// POST: /trips - Adds a new trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsAddTrip = async (req, res) => {
    getUser(req, res, async (req, res) => {
        try {
            const trip = await Trip.create({
                code: req.body.code,
                name: req.body.name,
                length: req.body.length,
                start: req.body.start,
                resort: req.body.resort,
                perPerson: req.body.perPerson,
                image: req.body.image,
                description: req.body.description
            });
            return res.status(201).json(trip);
        } catch (err) {
            return res.status(400).json(err);
        }
    });
};


        // Uncomment the following line to show results of operation
        // on the console
        // console.log(q);


// PUT: /trips/:tripCode - Updates an existing Trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsUpdateTrip = async (req, res) => {
    getUser(req, res, async (req, res) => {
        try {
            const trip = await Trip.findOneAndUpdate(
                { 'code': req.params.tripCode },
                {
                    code: req.body.code,
                    name: req.body.name,
                    length: req.body.length,
                    start: req.body.start,
                    resort: req.body.resort,
                    perPerson: req.body.perPerson,
                    image: req.body.image,
                    description: req.body.description
                },
                { new: true }
            );
            if (!trip) {
                return res.status(404).send({
                    message: "Trip not found with code " + req.params.tripCode
                });
            }
            return res.send(trip);
        } catch (err) {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Trip not found with code " + req.params.tripCode
                });
            }
            return res.status(500).json(err);
        }
    });
};

const getUser = (req, res, callback) => {
    if (req.payload && req.payload.email) {            
      User
        .findOne({ email : req.payload.email })         
        .exec((err, user) => {
          if (!user) {
            return res
              .status(404)
              .json({"message": "User not found"});
          } else if (err) {
            console.log(err);
            return res
              .status(404)
              .json(err);
           }
          callback(req, res, user.name);                
         });
    } else {
      return res
        .status(404)
        .json({"message": "User not found"});
    }
  };


module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip 
};