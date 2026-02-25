const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_123";

// Register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        console.log("Registration attempt for:", email);
        let user = await User.findOne({ email });
        if (user) {
            console.log("Registration failed: User already exists");
            return res.status(400).json({ error: "User already exists" });
        }

        user = new User({ name, email, password });
        await user.save();
        console.log("User saved successfully:", email);

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error("Registration error details:", err);
        res.status(500).json({ error: "Server error during registration", details: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Login attempt for:", email);
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Login failed: User not found");
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log("Login failed: Incorrect password");
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error("Login error details:", err);
        res.status(500).json({ error: "Server error during login", details: err.message });
    }
});

module.exports = router;
