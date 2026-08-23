const express = require("express");
const router = express.Router();

const {
    registerRecruiter,
    verifyRecruiter,
    loginRecruiter,
    deleteRecruiterAccount
} = require("../controllers/recruiterController");
const authenticateRecruiter = require("../middlewares/authenticateRecruiter");

router.post("/register", registerRecruiter);

router.get("/verify/:token", verifyRecruiter);

router.post("/login", loginRecruiter);

router.delete("/me", authenticateRecruiter, deleteRecruiterAccount);

module.exports = router;
