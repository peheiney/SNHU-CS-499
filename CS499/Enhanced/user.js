const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hash: String,
  salt: String
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000, 10),
  }, process.env.JWT_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

// Middleware to verify user authentication
const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

// Refactored function to get user by email
const getUserByEmail = async (email) => {
  try {
    const user = await mongoose.model('users').findOne({ email }).exec();
    return user;
  } catch (err) {
    console.error(err);
    throw new Error("Error retrieving user by email.");
  }
};

// GET: /users - lists all users with optional filtering by name and email
const usersList = async (req, res) => {
  try {
    let query = {}; // Initialize an empty query object

    // Check if there are query parameters for filtering
    if (req.query) {
      if (req.query.name) {
        // Add search by user name
        query.name = { $regex: req.query.name, $options: 'i' }; // Case-insensitive search
      }
      if (req.query.email) {
        // Add search by user email
        query.email = { $regex: req.query.email, $options: 'i' }; // Case-insensitive search
      }
    }

    const users = await mongoose.model('users').find(query).exec();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// POST: /users - Adds a new user with validation
const addUser = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await mongoose.model('users').create(req.body);
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// PUT: /users/:userId - Updates an existing user with authentication
const updateUser = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.payload || req.payload.userId !== req.params.userId) {
    return res.status(403).json({ message: "Unauthorized access." });
  }

  try {
    const user = await mongoose.model('users').findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  usersList,
  addUser,
  updateUser,
  getUserByEmail
};

mongoose.model('users', userSchema);
