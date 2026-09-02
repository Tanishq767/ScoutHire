const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Recruiter = require("../models/recruiterModel");
const { sendVerificationEmail } = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
const Company = require("../models/companyModel");
const Drive = require("../models/driveModel");
const Student = require("../models/studentsmodels");
const DriveCollegeApproval = require("../models/driveCollegeApprovalModel");
const CollegeCompany = require("../models/collegeCompanyModel");

const registerRecruiter = async (req, res) => {

    try {

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

                console.log(
                    "Verification link expired. Updating recruiter..."
                );

                let company = await Company.findOne({
                    companyName: companyName.trim()
                });

                if (!company) {

                    company = new Company({

                        companyName: companyName.trim()

                    });

                    await company.save();

                }

                existingRecruiter.recruiterName =
                    recruiterName;

                existingRecruiter.companyName =
                    company.companyName;

                existingRecruiter.companyId =
                    company._id;

                existingRecruiter.email =
                    email;

                existingRecruiter.password =
                    hashedPassword;

                existingRecruiter.verificationToken =
                    verificationToken;

                existingRecruiter.verificationTokenExpiry =
                    verificationTokenExpiry;

                await existingRecruiter.save();

                console.log("2. Recruiter updated");

                console.log("3. Sending email...");

                await sendVerificationEmail(
                    email,
                    verificationToken,
                    "recruiters"
                );

                console.log("4. Email sent");

                return res.status(200).json({
                    message:
                        "New verification email sent."
                });

            }

            return res.status(400).json({
                message:
                    "Please check your email. Verification link is still valid."
            });

        }

        console.log("Creating new recruiter...");

        let company = await Company.findOne({
            companyName: companyName.trim()
        });

        if (!company) {

            company = new Company({

                companyName: companyName.trim()

            });

            await company.save();

        }

        const newRecruiter = new Recruiter({
            recruiterName,
            companyName: company.companyName,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry,
            companyId: company._id
        });

        await newRecruiter.save();

        console.log("2. Account created!");

        console.log("3. Sending verification email...");

        await sendVerificationEmail(email, verificationToken, "recruiters");

        console.log("4. Email sent");

        return res.status(201).json({
            message: "Registration successful! Please verify your email."
        });

    }
    catch (err) {

        console.error("REGISTRATION ERROR:", err);

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
            message: "Email verified successfully! Login to proceed."
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

                companyId: recruiter.companyId,

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

const deleteRecruiterAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password confirmation is required." });
        }

        const validPassword = await bcrypt.compare(password, req.recruiter.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        const drives = await Drive.find({ createdBy: req.recruiter._id }).select("_id");
        const driveIds = drives.map(drive => drive._id);

        if (driveIds.length > 0) {
            await Student.updateMany(
                { appliedDrives: { $in: driveIds } },
                { $pull: { appliedDrives: { $in: driveIds } } }
            );
            await DriveCollegeApproval.deleteMany({ driveId: { $in: driveIds } });
            await Drive.deleteMany({ _id: { $in: driveIds } });
        }

        await Recruiter.deleteOne({ _id: req.recruiter._id });

        const remainingRecruiters = await Recruiter.countDocuments({
            companyId: req.recruiter.companyId
        });

        if (req.recruiter.companyId && remainingRecruiters === 0) {
            await CollegeCompany.deleteMany({ companyId: req.recruiter.companyId });
            await Company.deleteOne({ _id: req.recruiter.companyId });
        }

        return res.json({ message: "Recruiter account deleted successfully." });
    }
    catch (err) {
        console.error("DELETE RECRUITER ACCOUNT ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerRecruiter,
    verifyRecruiter,
    loginRecruiter,
    deleteRecruiterAccount
};
