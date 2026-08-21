const Student = require('../models/studentsmodels')
const csv = require('csv-parser')
const fs = require('fs')
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../utils/mailSender");

const getStudents = async(req,res) => {
    try{
        const students = await Student.find();
        res.send(students);
    } catch(err){
        res.status(500).send(err.message);
    }
};

const getStudentbyUSN = async(req,res) => {
    try{
        const student = await Student.findOne({USN : req.params.usn});

        if(!student){
            return res.status(404).send("student not found");
        }

        res.send(student);
    }catch(err){
        res.status(500).send(err.message);
    }
};

const getStudentbyName = async(req,res) => {
    try{
        const student = await Student.findOne({name : req.params.name});

        if(!student){
            return res.status(404).send("student not found");
        }

        res.send(student);
    }catch(err){
        res.status(500).send(err.message);
    }
};

const uploadStudents = async (req, res) => {
    if(!req.file){
        return res.status(400).send("No file uploaded")
    }
    const results = []

    function safeParse(field){
        try{
            return field ? JSON.parse(field.trim()) : []
        } catch {
            return []
        }
    }

    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {

        const date = new Date(data.birthdate)

        results.push({
            name: data.name,
            USN: data.USN,
            birthdate: isNaN(date) ? null : date,
            email: data.email,
            phone: String(data.phone),
            Branch: data.Branch,
            year: Number(data.year) || 0,
            CGPA: Number(data.CGPA) || 0,

            skills: safeParse(data.skills),
            CPRating: safeParse(data.CPRating),
            projects: safeParse(data.projects),
            internships: safeParse(data.internships),

            resumeURL: "",
            password: null,
            isVerified: false,
            verificationToken: null,
            verificationTokenExpiry: null,
            appliedDrives: []
        })
    })
    .on('end', async () => {
        try{
            await Student.insertMany(results)
            fs.unlink(req.file.path, () => {})

            res.json({ message: "Students uploaded successfully" })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    })

}

const registerStudent = async (req, res) => {

    try {

        const { USN, email, password } = req.body;

        const student = await Student.findOne({ USN });

        if (!student) {
            return res.status(404).json({
                message: "Student record not found. Contact placement cell."
            });
        }

        if (student.email !== email) {
            return res.status(400).json({
                message: "Email does not match college records."
            });
        }

        if (student.password && student.isVerified) {
            return res.status(400).json({
                message: "Account already activated."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const verificationTokenExpiry = new Date(
            Date.now() + 30 * 60 * 1000
        );

        student.password = hashedPassword;
        student.verificationToken = verificationToken;
        student.verificationTokenExpiry = verificationTokenExpiry;
        student.isVerified = false;

        await student.save();

        await sendVerificationEmail(
            student.email,
            verificationToken, "students"
        );

        return res.status(200).json({
            message: "Verification email sent."
        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            message: err.message
        });
    }
};

const verifyStudent = async (req, res) => {

    try {

        const token = req.params.token;

        const student = await Student.findOne({
            verificationToken: token
        });

        if (!student) {
            return res.status(400).json({
                message: "Invalid verification link."
            });
        }

        if (student.verificationTokenExpiry < Date.now()) {
            return res.status(400).json({
                message: "Verification link expired."
            });
        }

        student.isVerified = true;
        student.verificationToken = null;
        student.verificationTokenExpiry = null;

        await student.save();

        return res.status(200).json({
            message: "Email verified successfully."
        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({
            message: err.message
        });
    }
};

const loginStudent = async (req, res) => {

    try {

        const { USN, password } = req.body;

        const student = await Student.findOne({ USN });

        if (!student) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        if (!student.password) {
            return res.status(400).json({
                message: "Please activate your account first."
            });
        }

        if (!student.isVerified) {
            return res.status(403).json({
                message: "Please verify your email."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Incorrect password."
            });
        }

        const token = jwt.sign(
            {
                id: student._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            student: {
                id: student._id,
                name: student.name,
                USN: student.USN,
                Branch: student.Branch,
                email: student.email
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

const getLoggedInStudent = async (req, res) => {
    try {
        return res.json(req.student);
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const getEligibleDrives = async (req, res) => {

    try {

        const Drive =
            require("../models/driveModel");

        const DriveCollegeApproval =
            require("../models/driveCollegeApprovalModel");

        const student =
            req.student;


        if (!student.collegeId) {

            return res.status(400).json({
                message:
                    "Student is not associated with a college."
            });

        }


        const approvedDrives =
            await DriveCollegeApproval.find({

                collegeId:
                    student.collegeId,

                status:
                    "Approved"

            }).select("driveId");


        const approvedDriveIds =
            approvedDrives.map(
                approval =>
                    approval.driveId
            );


        if (approvedDriveIds.length === 0) {

            return res.status(200).json([]);

        }


        const drives =
            await Drive.find({

                _id: {
                    $in:
                        approvedDriveIds
                },

                targetColleges:
                    student.collegeId,

                status:
                    "Open",

                applicationDeadline: {
                    $gte:
                        new Date()
                },

                minimumCGPA: {
                    $lte:
                        student.CGPA
                },

                eligibleBranches:
                    student.Branch

            }).sort({

                applicationDeadline:
                    1

            });


        const eligibleDrives =
            drives.filter(drive => {

                if (
                    !drive.requiredSkills ||
                    drive.requiredSkills.length === 0
                ) {

                    return true;

                }


                const studentSkills =
                    (student.skills || []).map(
                        skill =>
                            skill.toLowerCase()
                    );


                return drive.requiredSkills.every(
                    skill =>
                        studentSkills.includes(
                            skill.toLowerCase()
                        )
                );

            });


        res.status(200).json(
            eligibleDrives
        );

    }
    catch(err) {

        console.error(err);

        res.status(500).json({
            message:
                err.message
        });

    }

};

const applyToDrive = async (req, res) => {

    try {

        const Drive =
            require("../models/driveModel");

        const DriveCollegeApproval =
            require("../models/driveCollegeApprovalModel");


        const driveId =
            req.params.id;

        const student =
            req.student;


        if (!student.collegeId) {

            return res.status(403).json({

                message:
                    "Your account is not associated with a college."

            });

        }


        const drive =
            await Drive.findById(
                driveId
            );


        if (!drive) {

            return res.status(404).json({

                message:
                    "Recruitment drive not found."

            });

        }


        if (
            !drive.targetColleges ||
            !drive.targetColleges.some(
                collegeId =>
                    String(collegeId) ===
                    String(student.collegeId)
            )
        ) {

            return res.status(403).json({

                message:
                    "This recruitment drive is not available for your college."

            });

        }


        const collegeApproval =
            await DriveCollegeApproval.findOne({

                driveId:
                    drive._id,

                collegeId:
                    student.collegeId,

                status:
                    "Approved"

            });


        if (!collegeApproval) {

            return res.status(403).json({

                message:
                    "This recruitment drive has not been approved by your college."

            });

        }


        if (drive.status !== "Open") {

            return res.status(400).json({

                message:
                    "This recruitment drive is closed."

            });

        }


        if (
            new Date(
                drive.applicationDeadline
            ) < new Date()
        ) {

            return res.status(400).json({

                message:
                    "The application deadline has passed."

            });

        }


        if (
            student.CGPA <
            drive.minimumCGPA
        ) {

            return res.status(403).json({

                message:
                    "You are not eligible for this drive."

            });

        }


        if (
            !drive.eligibleBranches.includes(
                student.Branch
            )
        ) {

            return res.status(403).json({

                message:
                    "Your branch is not eligible for this drive."

            });

        }


        if (
            drive.requiredSkills &&
            drive.requiredSkills.length > 0
        ) {

            const studentSkills =
                (student.skills || []).map(
                    skill =>
                        skill.toLowerCase()
                );


            const hasRequiredSkills =
                drive.requiredSkills.every(
                    skill =>
                        studentSkills.includes(
                            skill.toLowerCase()
                        )
                );


            if (!hasRequiredSkills) {

                return res.status(403).json({

                    message:
                        "You do not have the required skills for this drive."

                });

            }

        }


        const alreadyApplied =
            student.appliedDrives.some(
                id =>
                    String(id) ===
                    String(driveId)
            );


        if (alreadyApplied) {

            return res.status(400).json({

                message:
                    "You have already applied to this drive."

            });

        }


        student.appliedDrives.push(
            drive._id
        );


        if (!drive.appliedStudents) {

            drive.appliedStudents = [];

        }


        drive.appliedStudents.push(
            student._id
        );


        await student.save();

        await drive.save();


        res.status(200).json({

            message:
                "Application submitted successfully."

        });

    }
    catch(err) {

        console.error(
            "APPLY TO DRIVE ERROR:",
            err
        );

        res.status(500).json({

            message:
                err.message

        });

    }

};

const uploadResume = async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({
                message: "Please upload a PDF resume."
            });
        }

        const resumeURL = `/uploads/resumes/${req.file.filename}`;

        req.student.resumeURL = resumeURL;

        await req.student.save();

        res.status(200).json({
            message: "Resume uploaded successfully.",
            resumeURL
        });
    }
    catch(err){
        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    getStudents,
    getStudentbyUSN,
    getStudentbyName,
    uploadStudents,
    registerStudent,
    verifyStudent,
    loginStudent,
    getLoggedInStudent,
    getEligibleDrives,
    applyToDrive,
    uploadResume
};