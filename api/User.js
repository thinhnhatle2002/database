
const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
    let { name, email, password } = req.body;

    // Trim inputs
    name = name?.trim();
    email = email?.trim();
    password = password?.trim();

    console.log("Received data:", { name, email, password });

    // Input validation
    if (!name || !email || !password) {
        console.log("Empty input fields detected.");
        return res.json({
            status: "Failed",
            message: "Empty input fields!"
        });
    }

    if (!/^[a-zA-Z ]*$/.test(name)) {
        console.log("Invalid name entered.");
        return res.json({
            status: "Failed",
            message: "Invalid name entered"
        });
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        console.log("Invalid email entered.");
        return res.json({
            status: "Failed",
            message: "Invalid email entered"
        });
    }

    if (password.length < 8) {
        console.log("Password is too short.");
        return res.json({
            status: "Failed",
            message: "Password is too short"
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists.");
            return res.json({
                status: "Failed",
                message: "Provided email is already in use"
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Save user to database
        const savedUser = await newUser.save();

        console.log("User signed up successfully:", savedUser);
        res.json({
            status: "Success",
            message: "Signup successful",
            data: savedUser
        });
    } catch (error) {
        console.error("Error:", error);
        res.json({
            status: "Failed",
            message: "Error signing up user"
        });
    }
});

router.post('/signin', (req, res) => {
    let { email, password } = req.body;

    // Trim inputs
    email = email?.trim();
    password = password?.trim();

    if(email == "" || password == ""){
        res.json({
            status: "Failed",
            message: "Empty cendentials suppled",
        })
    }
    else
    {
        User.find({email})
        .then(data => {
            if(data.length){
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if(result){
                        res.json({
                            status: "Success",
                            message: "login successfull",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "Failed",
                            message: "invalid password entered",
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: "Failed",
                        message: "Error comparing password",
                    })
                })
            }else{
                res.json({
                    status: "Failed",
                    message: "Invalid entered",
                })
            }

        })
        .catch(err => {
            res.json({
                status: "Failed",
                message: "Error checking for existing user",
            })
        })
    }
});

module.exports = router;
