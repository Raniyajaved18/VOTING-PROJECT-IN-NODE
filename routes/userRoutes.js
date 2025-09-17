const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// post route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body // assuming the request body contains the user data

        // check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'admin user already exist' });
        }

        // validate  adhar card number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'admin card number must be exactly 12 digit' });
        }

        // check if a user with the same aadhar card number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'user with the same aadhar card number already exist' });
        }
        
        //create a new user document using mongoose model
        const newUser = new User(data);

        //save the new user data to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id:  response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
        }
})

// login route
router.post('/login', async (req, res) => {
    try {
        //extract aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;

        //check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'aadhar card number and password are required' });
        }

        // find the user  by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

        // if user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid aadhar card number or password' });
        }

        //generate token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        //return token as response
        res.json({ token })
    } catch (err) {
        
    }
        
    })