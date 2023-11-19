// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require("dotenv").config()
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Code = require('./models/Code');
const cal = require('./cal/genCode');
 

// Create Express application
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
// mongoose.connect('mongodb://localhost/hackathonNew', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', function (err) {
  console.log(err.message);
});

db.once('open', function () {
  console.log('SUCCESSFULLY!! Connected to MongoDB');
});

// JWT authentication middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' to get the token

  try {
    const decoded = jwt.verify(token, "pk2103");
    const user = await User.findById(decoded.user._id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid user' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Routes

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Authenticate user
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Issue JWT token upon successful authentication
    const token = jwt.sign({ user: user.toJSON() }, "pk2103", { expiresIn: '100000000' });

    res.json({ token, userName: user.username });
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Generate code route
app.post('/generate-code', requireAuth, async (req, res) => {
  const { generatedCode } = req.body;

  if (!generatedCode) {
    return res.status(400).json({ message: 'generatedCode is required' });
  }

  try {
    // Create a new Code
    const newCode = new Code({ generatedCode });
    await newCode.save();

    // Add the new Code's ObjectId to the User's generatedCodes array
    req.user.generatedCodes.push(newCode._id);
    await req.user.save();

    res.status(201).json({ message: 'Code generated successfully', user: req.user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generate code route using the 'cal' module
app.post("/gen", requireAuth, cal.index);

// Route to get code history for a user
app.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Assuming 'generatedCodes' is an array of Code objects in the User model
    const user = await User.findById(userId).populate('generatedCodes');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract code data along with their IDs from the user's generatedCodes
    const codeData = user.generatedCodes.map(code => ({
      _id: code._id,
      generatedCode: code.generatedCode,
      createdAt: code.createdAt
    }));

    // Render the code data (you may customize this based on your rendering needs)
    res.status(200).json({ codeData, userName: user.name });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user with the hashed password
    const newUser = new User({ username, password });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to get code by ID
app.get('/code/:id', requireAuth, async (req, res) => {
  try {
    const codeId = req.params.id;

    // Use the findById method to find a code by its ID
    const code = await Code.findById(codeId);

    if (!code) {
      return res.status(484).json({ message: 'Code not found' });
    }

    // Return the code in the response
    res.status(200).json({ code });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});
app.get("/", async (req, res) => {
  res.status(200).json({"hello"})
})

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
