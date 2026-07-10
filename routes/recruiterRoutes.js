const express = require("express");
const router = express.Router();

const {
    registerRecruiter,
    verifyRecruiter,
    loginRecruiter
} = require("../controllers/recruiterController");

router.post("/register", registerRecruiter);

router.get("/verify/:token", verifyRecruiter);

router.post("/login", loginRecruiter);

module.exports = router;