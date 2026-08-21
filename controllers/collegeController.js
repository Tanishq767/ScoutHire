const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const csv = require("csv-parser");
const fs = require("fs");

const DriveCollegeApproval =
    require("../models/driveCollegeApprovalModel");

const College =
    require("../models/collegeModel");

const Company =
    require("../models/companyModel");

const CollegeCompany =
    require("../models/collegeCompanyModel");

const Student =
    require("../models/studentsmodels");


const registerCollege = async (req, res) => {

    try {

        const {
            collegeName,
            collegeCode,
            email,
            password,
            location,
            website,
            contactPerson,
            phone
        } = req.body;

        const existingCollege =
            await College.findOne({
                $or: [
                    { email },
                    { collegeCode }
                ]
            });

        if (existingCollege) {

            return res.status(400).json({
                message:
                    "College account already exists."
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const college =
            new College({

                collegeName,
                collegeCode,
                email,
                password: hashedPassword,
                location,
                website,
                contactPerson,
                phone

            });

        await college.save();

        res.status(201).json({

            message:
                "College registered successfully.",

            college: {

                id: college._id,
                collegeName: college.collegeName,
                collegeCode: college.collegeCode,
                email: college.email

            }

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};


const loginCollege = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const college =
            await College.findOne({
                email
            });

        if (!college) {

            return res.status(404).json({
                message:
                    "College not found."
            });

        }

        const match =
            await bcrypt.compare(
                password,
                college.password
            );

        if (!match) {

            return res.status(401).json({
                message:
                    "Invalid credentials."
            });

        }

        const token =
            jwt.sign(
                {
                    id: college._id,
                    role: "college"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.status(200).json({

            message:
                "Login successful.",

            token,

            college: {

                id: college._id,
                collegeName: college.collegeName,
                collegeCode: college.collegeCode,
                email: college.email

            }

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};


const getProfile = async (req, res) => {

    try {

        const college =
            await College.findById(
                req.college._id
            ).select("-password");

        if (!college) {

            return res.status(404).json({
                message:
                    "College not found."
            });

        }

        res.json(college);

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const getCompanies = async (req, res) => {

    try {

        const companies =
            await Company.find({
                verificationStatus: {
                    $ne: "Rejected"
                }
            }).sort({
                companyName: 1
            }).lean();


        const relationships =
            await CollegeCompany.find({
                collegeId:
                    req.college._id
            }).lean();


        const relationshipMap =
            new Map();


        relationships.forEach(
            relationship => {

                relationshipMap.set(
                    relationship.companyId.toString(),
                    relationship.status
                );

            }
        );


        const result =
            companies.map(company => ({

                ...company,

                collegeStatus:
                    relationshipMap.get(
                        company._id.toString()
                    ) || "Pending"

            }));


        res.json(result);

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const approveCompany = async (req, res) => {

    try {

        const {
            engagementType,
            engagementDate,
            notes
        } = req.body;

        const company =
            await Company.findById(
                req.params.companyId
            );

        if (!company) {

            return res.status(404).json({
                message:
                    "Company not found."
            });

        }

        let relationship =
            await CollegeCompany.findOne({

                collegeId:
                    req.college._id,

                companyId:
                    company._id

            });

        if (relationship) {

            relationship.status =
                "Approved";

            relationship.engagementType =
                engagementType ||
                relationship.engagementType;

            relationship.engagementDate =
                engagementDate || null;

            relationship.notes =
                notes || "";

            relationship.approvedAt =
                new Date();

        }
        else {

            relationship =
                new CollegeCompany({

                    collegeId:
                        req.college._id,

                    companyId:
                        company._id,

                    status:
                        "Approved",

                    engagementType:
                        engagementType ||
                        "Phone Call",

                    engagementDate:
                        engagementDate || null,

                    notes:
                        notes || "",

                    approvedAt:
                        new Date()

                });

        }

        await relationship.save();

        res.json({

            message:
                "Company approved successfully.",

            relationship

        });

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const getApprovedCompanies = async (req, res) => {

    try {

        const relationships =
            await CollegeCompany.find({

                collegeId:
                    req.college._id,

                status:
                    "Approved"

            }).populate(
                "companyId"
            );

        res.json(relationships);

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const assignStudentsToCollege = async (req, res) => {

    try {

        const {
            studentIds
        } = req.body;

        if (
            !Array.isArray(studentIds) ||
            studentIds.length === 0
        ) {

            return res.status(400).json({
                message:
                    "No students supplied."
            });

        }

        await Student.updateMany(

            {
                _id: {
                    $in: studentIds
                }
            },

            {
                $set: {
                    collegeId:
                        req.college._id
                }
            }

        );

        res.json({

            message:
                "Students assigned successfully.",

            count:
                studentIds.length

        });

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const getCollegeStudents = async (req, res) => {

    try {

        const students =
            await Student.find({

                collegeId:
                    req.college._id

            }).select(
                "-__v"
            );

        res.json(students);

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

const uploadCollegeStudents = async (req, res) => {

    if (!req.file) {

        return res.status(400).json({
            message: "No CSV file uploaded."
        });

    }

    const results = [];


    function safeParse(field) {

        try {

            return field
                ? JSON.parse(field.trim())
                : [];

        }
        catch {

            return [];

        }

    }


    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => {

            const date =
                new Date(data.birthdate);


            results.push({

                name:
                    data.name,

                USN:
                    data.USN,

                birthdate:
                    isNaN(date)
                        ? null
                        : date,

                email:
                    data.email,

                phone:
                    String(data.phone || ""),

                Branch:
                    data.Branch,

                year:
                    Number(data.year) || 0,

                CGPA:
                    Number(data.CGPA) || 0,

                skills:
                    safeParse(data.skills),

                CPRating:
                    safeParse(data.CPRating),

                projects:
                    safeParse(data.projects),

                internships:
                    safeParse(data.internships),

                resumeURL:
                    data.resumeURL || "",

                collegeId:
                    req.college._id

            });

        })
        .on("end", async () => {

            try {

                if (results.length === 0) {

                    fs.unlink(
                        req.file.path,
                        () => { }
                    );

                    return res.status(400).json({
                        message:
                            "CSV contains no student records."
                    });

                }


                const operations =
                    results.map(student => ({

                        updateOne: {

                            filter: {
                                USN: student.USN
                            },

                            update: {
                                $set: student
                            },

                            upsert: true

                        }

                    }));


                const result =
                    await Student.bulkWrite(
                        operations
                    );


                fs.unlink(
                    req.file.path,
                    () => { }
                );


                res.status(200).json({

                    message:
                        "Students uploaded successfully.",

                    total:
                        results.length,

                    inserted:
                        result.upsertedCount,

                    updated:
                        result.modifiedCount

                });

            }
            catch (err) {

                console.error(
                    "COLLEGE STUDENT UPLOAD ERROR:",
                    err
                );

                fs.unlink(
                    req.file.path,
                    () => { }
                );

                res.status(500).json({
                    message: err.message
                });

            }

        })
        .on("error", (err) => {

            console.error(err);

            fs.unlink(
                req.file.path,
                () => { }
            );

            res.status(500).json({
                message:
                    "Unable to read CSV file."
            });

        });

};

const getCollegeDrives = async (req, res) => {

    try {

        const Drive =
            require("../models/driveModel");

        const drives =
            await Drive.find({

                targetColleges:
                    req.college._id

            }).lean();


        const approvals =
            await DriveCollegeApproval.find({

                collegeId:
                    req.college._id

            }).lean();


        const approvalMap =
            new Map();


        approvals.forEach(approval => {

            approvalMap.set(
                approval.driveId.toString(),
                approval.status
            );

        });


        const result =
            drives.map(drive => ({

                ...drive,

                collegeStatus:
                    approvalMap.get(
                        drive._id.toString()
                    ) || "Pending"

            }));


        res.json(result);

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};


const approveDrive = async (req, res) => {

    try {

        const Drive =
            require("../models/driveModel");

        const drive =
            await Drive.findById(
                req.params.driveId
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
                id =>
                    id.toString() ===
                    req.college._id.toString()
            )
        ) {

            return res.status(403).json({
                message:
                    "This drive is not targeted to your college."
            });

        }


        const companyRelationship =
            await CollegeCompany.findOne({

                collegeId:
                    req.college._id,

                companyId:
                    drive.companyId,

                status:
                    "Approved"

            });


        if (!companyRelationship) {

            return res.status(403).json({
                message:
                    "This company has not been approved by your college."
            });

        }


        let approval =
            await DriveCollegeApproval.findOne({

                driveId:
                    drive._id,

                collegeId:
                    req.college._id

            });


        if (approval) {

            approval.status =
                "Approved";

            approval.approvedAt =
                new Date();

        }
        else {

            approval =
                new DriveCollegeApproval({

                    driveId:
                        drive._id,

                    collegeId:
                        req.college._id,

                    status:
                        "Approved",

                    approvedAt:
                        new Date()

                });

        }


        await approval.save();


        res.json({

            message:
                "Recruitment drive approved successfully.",

            approval

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};

const getCompaniesForPartnership =
    async (req, res) => {

        try {

            const companies =
                await Company.find({})
                    .select(
                        "companyName website country"
                    )
                    .sort({
                        companyName: 1
                    })
                    .lean();

            const relationships =
                await CollegeCompany.find({
                    collegeId:
                        req.college._id
                }).lean();

            const relationshipMap =
                new Map();

            relationships.forEach(item => {

                relationshipMap.set(
                    item.companyId.toString(),
                    {
                        status:
                            item.status,

                        initiatedBy:
                            item.initiatedBy
                    }
                );

            });

            const result =
                companies.map(company => {

                    const relationship =
                        relationshipMap.get(
                            company._id.toString()
                        );

                    return {

                        ...company,

                        partnershipStatus:
                            relationship
                                ? relationship.status
                                : "Not Requested",

                        initiatedBy:
                            relationship
                                ? relationship.initiatedBy
                                : null

                    };

                });

            res.json(result);

        }
        catch (err) {

            console.error(err);

            res.status(500).json({
                message:
                    err.message
            });

        }

    };


const requestCompany =
    async (req, res) => {

        try {

            const collegeId =
                req.college._id;

            const company =
                await Company.findById(
                    req.params.companyId
                );

            if (!company) {

                return res.status(404).json({
                    message:
                        "Company not found."
                });

            }

            const verificationCode =
                req.body.verificationCode?.trim();

            if (!verificationCode) {

                return res.status(400).json({
                    message:
                        "Verification code is required."
                });

            }

            let relationship =
                await CollegeCompany.findOne({

                    collegeId,

                    companyId:
                        company._id

                });

            if (relationship) {

                if (
                    relationship.status ===
                    "Approved"
                ) {

                    return res.status(400).json({
                        message:
                            "Partnership is already approved."
                    });

                }

                if (
                    relationship.status ===
                    "Verification Required"
                ) {

                    return res.status(400).json({
                        message:
                            "A partnership request is already awaiting verification."
                    });

                }

                relationship.status =
                    "Verification Required";

                relationship.initiatedBy =
                    "college";

                relationship.verificationCode =
                    verificationCode;

                relationship.approvedAt =
                    null;

            }
            else {

                relationship =
                    new CollegeCompany({

                        collegeId,

                        companyId:
                            company._id,

                        status:
                            "Verification Required",

                        initiatedBy:
                            "college",

                        verificationCode:
                            verificationCode

                    });

            }

            await relationship.save();

            res.status(201).json({

                message:
                    "Partnership request sent successfully."

            });

        }
        catch (err) {

            console.error(err);

            res.status(500).json({
                message:
                    err.message
            });

        }

    };


const verifyCompanyPartnership =
    async (req, res) => {

        try {

            const collegeId =
                req.college._id;

            const enteredCode =
                req.body.verificationCode?.trim();

            if (!enteredCode) {

                return res.status(400).json({
                    message:
                        "Verification code is required."
                });

            }

            const relationship =
                await CollegeCompany.findOne({

                    collegeId,

                    companyId:
                        req.params.companyId,

                    status:
                        "Verification Required",

                    initiatedBy:
                        "company"

                });

            if (!relationship) {

                return res.status(404).json({
                    message:
                        "No company-initiated partnership request found."
                });

            }

            if (
                relationship.verificationCode !==
                enteredCode
            ) {

                return res.status(400).json({
                    message:
                        "Verification code does not match."
                });

            }

            relationship.status =
                "Approved";

            relationship.approvedAt =
                new Date();

            await relationship.save();

            res.json({

                message:
                    "Partnership verified successfully."

            });

        }
        catch (err) {

            console.error(err);

            res.status(500).json({
                message:
                    err.message
            });

        }

    };


module.exports = {
    registerCollege,
    loginCollege,
    getProfile,
    getCompanies,
    approveCompany,
    getApprovedCompanies,
    assignStudentsToCollege,
    getCollegeStudents,
    uploadCollegeStudents,
    getCollegeDrives,
    approveDrive,
    getCompaniesForPartnership,
    requestCompany,
    verifyCompanyPartnership
};