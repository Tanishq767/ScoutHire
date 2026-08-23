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

const Drive =
    require("../models/driveModel");


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

            const search =
                (req.query.search || "").trim();

            const location =
                (req.query.location || "").trim();

            const status =
                req.query.status || "ALL";

            const allowedStatuses = new Set([
                "ALL",
                "Approved",
                "Sent",
                "Incoming",
                "Not Requested"
            ]);

            if (!allowedStatuses.has(status)) {

                return res.status(400).json({
                    message: "Invalid partnership status filter."
                });

            }

            const companyMatch = {};

            if (search) {

                const escapedSearch =
                    search.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );

                companyMatch.companyName = {
                    $regex: escapedSearch,
                    $options: "i"
                };

            }

            if (location) {

                companyMatch.country = location;

            }

            const pipeline = [
                { $match: companyMatch },
                {
                    $lookup: {
                        from: "collegecompanies",
                        let: { companyId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$companyId", "$$companyId"] },
                                            { $eq: ["$collegeId", req.college._id] }
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 0, status: 1, initiatedBy: 1 } }
                        ],
                        as: "relationship"
                    }
                },
                {
                    $set: {
                        relationship: { $arrayElemAt: ["$relationship", 0] }
                    }
                },
                {
                    $set: {
                        partnershipStatus: {
                            $ifNull: ["$relationship.status", "Not Requested"]
                        },
                        initiatedBy: "$relationship.initiatedBy"
                    }
                }
            ];

            if (status === "Approved") {

                pipeline.push({
                    $match: { partnershipStatus: "Approved" }
                });

            }
            else if (status === "Sent") {

                pipeline.push({
                    $match: {
                        partnershipStatus: "Verification Required",
                        initiatedBy: "college"
                    }
                });

            }
            else if (status === "Incoming") {

                pipeline.push({
                    $match: {
                        partnershipStatus: "Verification Required",
                        initiatedBy: "company"
                    }
                });

            }
            else if (status === "Not Requested") {

                pipeline.push({
                    $match: { partnershipStatus: "Not Requested" }
                });

            }

            pipeline.push(
                { $sort: { companyName: 1 } },
                {
                    $project: {
                        companyName: 1,
                        website: 1,
                        location: "$country",
                        partnershipStatus: 1,
                        initiatedBy: 1
                    }
                }
            );

            const companies =
                await Company.aggregate(pipeline);

            res.json(companies);

        }
        catch (err) {

            console.error(err);

            res.status(500).json({
                message:
                    err.message
            });

        }

    };


const getCompanyPartnershipFilterOptions =
    async (req, res) => {

        try {

            const locations =
                await Company.distinct("country", {
                    country: { $ne: "" }
                });

            res.json({
                locations: locations.sort((a, b) =>
                    a.localeCompare(b)
                )
            });

        }
        catch (err) {

            console.error(err);

            res.status(500).json({
                message: err.message
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


const deleteCollegeAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password confirmation is required." });
        }

        const validPassword = await bcrypt.compare(password, req.college.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        await CollegeCompany.deleteMany({ collegeId: req.college._id });
        await DriveCollegeApproval.deleteMany({ collegeId: req.college._id });
        await Student.updateMany(
            { collegeId: req.college._id },
            { $set: { collegeId: null } }
        );
        await Drive.updateMany(
            { targetColleges: req.college._id },
            { $pull: { targetColleges: req.college._id } }
        );
        await College.deleteOne({ _id: req.college._id });

        return res.json({ message: "College account deleted successfully." });
    }
    catch (err) {
        console.error("DELETE COLLEGE ACCOUNT ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};

const deleteCompanyPartnership = async (req, res) => {
    try {
        const relationship = await CollegeCompany.findOneAndDelete({
            collegeId: req.college._id,
            companyId: req.params.companyId
        });

        if (!relationship) {
            return res.status(404).json({ message: "Partnership not found." });
        }

        return res.json({ message: "Partnership removed successfully." });
    }
    catch (err) {
        console.error("DELETE COLLEGE PARTNERSHIP ERROR:", err);
        return res.status(500).json({ message: err.message });
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
    getCompanyPartnershipFilterOptions,
    requestCompany,
    verifyCompanyPartnership,
    deleteCollegeAccount,
    deleteCompanyPartnership
};
