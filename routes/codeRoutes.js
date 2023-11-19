// routes/codeRoutes.js

const express = require('express');
const User =require('../models/User')
const router = express.Router();
const bcrypt=require('bcrypt');
const Code = require('../models/Code');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middlewares/authMiddleware');
 

// Get all codes
router.get('/',requireAuth, async (req, res) => {
  try {
    const codes = await Code.find().sort({ createdAt: -1 });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

 


router.post('/generate-code',requireAuth, async (req, res) => {

  const { generatedCode } = req.body;
  console.log("**",req.user)
  

  if (!generatedCode) {
    return res.status(400).json({ message: 'generatedCode is required' });
  }

  try {
    // Create a new Code
    const newCode = new Code({ generatedCode });
    console.log("id of generated code",newCode.id)
    console.log("id of generated code*",newCode._id)
    console.log(newCode)
    await newCode.save();

    // Add the new Code's ObjectId to the User's generatedCodes array
    // req.user.generatedCodes.push(newCode._id);
    // await req.user.save();

    res.status(201).json({ message: 'Code generated successfully', user: req.user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


//Get a code by ID
router.get('/:id', getCode,requireAuth, (req, res) => {
  res.json(res.code);
});

async function getCode(req, res, next) {
  try {
    const code = await Code.findById(req.params.id);
    if (code == null) {
      return res.status(404).json({ message: 'Code not found' });
    }
    res.code = code;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


 //login
// login
router.post('/login', async (req, res) => {
  try{
    console.log("$$$$$",req);
    
            let user= await User.findOne({username:req.body.username})
            console.log(user);
            
    
            if(!user ||  user.password != req.body.password){
                 
                return res.status(422).json({
                    message: 'Invalid username or password'
                })
            }
    
            return res.status(200).json({
                message: 'Sign in successfully,Here is your token , So keep it safely',
                data:{
                    token:jwt.sign(user.toJSON(),process.env.JWT_SECRET,{expiresIn:1000000})
                }
            })
    
        }
        catch(e){
            console.log('****',e);
           return res.status(500).json({
            message:"Internal Server Error",
           })
        }
    
    }
);



 //!                                    Regestion  //  **********
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the password before saving it
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the hashed password
    // const newUser = new User({ username, password: hashedPassword });
    const newUser = new User({ username, password});
    const savedUser = await newUser.save();

    res.status(201).json({ message: 'Registration successful'});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
