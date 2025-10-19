const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createAccessToken, errorHandler } = require("../auth.js");

async function register(req, res) {
    try {
        const { email, password, username } = req.body || {};
        if (!email || !password || !username) {
            return res.status(400).send({ error: "Email, password, and username are required" });
        }

        // Check for existing email OR username
        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            const msg = exists.email === email ? "Email already registered" : "Username already taken";
            return res.status(409).send({ error: msg });
        }

        const hash = await bcrypt.hash(password, 12);
        await User.create({ email, username, password: hash, isAdmin: false });

        return res.status(201).send({ message: "Registered Successfully" });
    } catch (err) {
        console.error("register error:", err);
        // Use global error handler for unexpected errors
        return errorHandler(err, req, res);
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body || {};
        if (typeof email !== "string" || !email.includes("@")) {
            return res.status(400).send({ error: "Invalid Email" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).send({ error: "No Email Found" });

        if (!user.password) {
            return res.status(500).send({ error: "User password not set" });
        }

        const isMatch = await bcrypt.compare(password || "", user.password);
        if (!isMatch) {
            return res.status(401).send({ error: "Email and password do not match" });
        }

        const token = createAccessToken(user); // payload includes username in your auth.js
        return res.status(200).send({ access: token }); // <- exact key the tests read
    } catch (err) {
        console.error("Login error:", err);
        return errorHandler(err, req, res);
    }
}

async function retrieveDetails(req, res) {
    try {
        let userDoc;
        if (req.user?.id) {
            userDoc = await User.findById(req.user.id).select("_id email username");
        } else if (req.user?.email) {
            userDoc = await User.findOne({ email: req.user.email }).select("_id email username");
        } else {
            return res.status(404).send({ error: "User not found" });
        }

        if (!userDoc) return res.status(404).send({ error: "User not found" });

        return res.send({
            user: { id: userDoc._id, email: userDoc.email, username: userDoc.username },
        });
    } catch (e) {
        console.error("retrieveDetails error:", e);
        return errorHandler(e, req, res);
    }
}

module.exports = { register, login, loginUser: login, retrieveDetails };
