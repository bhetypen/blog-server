// router/user.js
const express = require("express");
const { register, login, retrieveDetails} = require("../controllers/userController.js");
const { verify } = require("../auth.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/details", verify, retrieveDetails);

module.exports = router;
