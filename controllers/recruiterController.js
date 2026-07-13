const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Recruiter = require("../models/recruiterModel");
const {sendVerificationEmail} = require("../utils/mailSender");
const jwt = require("jsonwebtoken");

const registerRecruiter = async (req, res) => {

    try {

        console.log("1. Register request received");

        const { recruiterName, companyName, email, password } = req.body;

        const existingRecruiter = await Recruiter.findOne({ email });

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const verificationTokenExpiry = new Date(
            Date.now() + 30 * 60 * 1000
        );

        if (existingRecruiter) {

            console.log("Existing recruiter found");

            if (existingRecruiter.verified) {
                return res.status(400).json({
                    message: "Recruiter already exists"
                });
            }

            if (existingRecruiter.verificationTokenExpiry < Date.now()) {

                console.log("Verification link expired. Updating recruiter...");

                existingRecruiter.recruiterName = recruiterName;
                existingRecruiter.companyName = companyName;
                existingRecruiter.email = email;
                existingRecruiter.password = hashedPassword;

                existingRecruiter.verificationToken = verificationToken;
                existingRecruiter.verificationTokenExpiry = verificationTokenExpiry;

                await existingRecruiter.save();

                console.log("2. Recruiter updated");

                console.log("3. Sending email...");

                await sendVerificationEmail(email, verificationToken);

                console.log("4. Email sent");

                return res.status(200).json({
                    message: "New verification email sent."
                });
            }

            return res.status(400).json({
                message: "Please check your email. Verification link is still valid."
            });

        }

        console.log("Creating new recruiter...");

        const newRecruiter = new Recruiter({

            recruiterName,
            companyName,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry

        });

        await newRecruiter.save();

        console.log("2. Recruiter saved");

        console.log("3. Sending email...");

        await sendVerificationEmail(email, verificationToken);

        console.log("4. Email sent");

        return res.status(201).json({
            message: "Registration successful! Please verify your email."
        });

    }
    catch (err) {

        console.error("REGISTER ERROR:", err);

        return res.status(500).json({
            message: err.message
        });

    }

};

const verifyRecruiter = async (req, res) => {

    try {

        const token = req.params.token;

        const recruiter = await Recruiter.findOne({
            verificationToken: token
        });

        if (!recruiter) {
            return res.status(400).json({
                message: "Invalid or expired token!"
            });
        }

        if (recruiter.verificationTokenExpiry < Date.now()) {
            return res.status(400).json({
                message: "Verification link expired"
            });
        }

        recruiter.verified = true;
        recruiter.verificationToken = null;
        recruiter.verificationTokenExpiry = null;

        await recruiter.save();

        return res.status(200).json({
            message: "Email verified successfully!"
        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            message: err.message
        });

    }
};

const loginRecruiter = async (req, res) => {

    try {

        const { email, password } = req.body;

        const recruiter = await Recruiter.findOne({ email });

        if (!recruiter) {
            return res.status(404).json({
                message: "Recruiter not found."
            });
        }

        if (!recruiter.verified) {
            return res.status(403).json({
                message: "Please verify your account first."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            recruiter.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: recruiter._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({

            message: "Login successful",

            token,

            recruiter: {

                id: recruiter._id,

                recruiterName: recruiter.recruiterName,

                companyName: recruiter.companyName,

                email: recruiter.email

            }

        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            message: err.message
        });

    }
};

module.exports = {
    registerRecruiter,
    verifyRecruiter,
    loginRecruiter
};