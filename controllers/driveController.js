const Drive = require('../models/driveModel');
const Student = require('../models/studentsmodels');
const Company = require('../models/companyModel');
const CollegeCompany = require('../models/collegeCompanyModel');
const { sendOAEmail, sendInterviewEmail } = require("../utils/mailSender");
const fs = require('fs');
const csv = require('csv-parser');


const getEligibleApplis = async (req, res) => {

    try {

        const drive = await Drive.findOne({
            _id: req.params.id,
            createdBy: req.recruiter._id
        });

        if (!drive) {
            return res.status(404).json({
                message: "Drive not found."
            });
        }

        const students = await Student.find({
            _id: {
                $in: drive.appliedStudents
            }
        });

        const eligibleStudents = students.filter(student => {

            if (student.CGPA < drive.minimumCGPA) {
                return false;
            }

            if (!drive.eligibleBranches.includes(student.Branch)) {
                return false;
            }

            if (drive.requiredSkills.length === 0) {
                return true;
            }

            const studentSkills = (student.skills || []).map(skill =>
                skill.toLowerCase()
            );

            return drive.requiredSkills.every(skill =>
                studentSkills.includes(skill.toLowerCase())
            );

        });

        res.status(200).json(eligibleStudents);

    }
    catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });

    }

};


const createDrive = async (req, res) => {

    try {

        const {
            jobTitle,
            packageLPA,
            location,
            minimumCGPA,
            eligibleBranches,
            requiredSkills,
            applicationDeadline,
            jobDescription,
            targetColleges
        } = req.body;


        if (
            !Array.isArray(targetColleges) ||
            targetColleges.length === 0
        ) {

            return res.status(400).json({
                message:
                    "Please select at least one target college."
            });

        }


        if (!req.recruiter.companyId) {

            return res.status(400).json({
                message:
                    "Your recruiter account is not linked to a company."
            });

        }


        const uniqueColleges = [
            ...new Set(
                targetColleges.map(
                    id => id.toString()
                )
            )
        ];


        const approvedRelationships =
            await CollegeCompany.find({

                companyId:
                    req.recruiter.companyId,

                collegeId: {
                    $in: uniqueColleges
                },

                status:
                    "Approved"

            });


        if (
            approvedRelationships.length !==
            uniqueColleges.length
        ) {

            return res.status(403).json({

                message:
                    "Your company has not been approved by all selected colleges."

            });

        }


        const company =
            await Company.findById(
                req.recruiter.companyId
            );


        if (!company) {

            return res.status(404).json({
                message:
                    "Company not found."
            });

        }


        const drive = new Drive({

            createdBy:
                req.recruiter._id,

            companyId:
                req.recruiter.companyId,

            companyName:
                company.companyName,

            jobTitle,

            packageLPA,

            location,

            minimumCGPA,

            eligibleBranches,

            requiredSkills,

            applicationDeadline,

            jobDescription,

            targetColleges:
                uniqueColleges

        });


        await drive.save();


        res.status(201).json({

            message:
                "Drive created successfully."

        });

    }

    catch (err) {

        console.error(
            "CREATE DRIVE ERROR:",
            err
        );

        res.status(500).json({
            message: err.message
        });

    }

};


const getMyDrives = async (req, res) => {

    try {

        const drives = await Drive.find({
            createdBy: req.recruiter._id
        }).sort({
            createdAt: -1
        });

        res.status(200).json(drives);

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const getDriveById = async (req, res) => {

    try {

        const drive = await Drive.findOne({

            _id: req.params.id,

            createdBy:
                req.recruiter._id

        });

        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }

        res.status(200).json(drive);

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const rankEligibleStudents = async (req, res) => {

    try {

        const {
            weights,
            top
        } = req.body;

        const driveId =
            req.params.id;

        const drive =
            await Drive.findOne({

                _id:
                    driveId

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        let total = 0;


        for (const key in weights) {

            total +=
                Number(weights[key]);

        }


        if (total === 0) {

            return res.status(400).json({
                message:
                    "At least one weight must be greater than 0."
            });

        }


        for (const key in weights) {

            weights[key] =
                Number(weights[key]) /
                total;

        }


        const students =
            await Student.find({

                _id: {
                    $in:
                        drive.appliedStudents
                }

            }).lean();


        const eligibleStudents =
            students.filter(student => {

                if (
                    student.CGPA <
                    drive.minimumCGPA
                ) {
                    return false;
                }


                if (
                    !drive.eligibleBranches
                        .includes(student.Branch)
                ) {
                    return false;
                }


                if (
                    drive.requiredSkills.length === 0
                ) {
                    return true;
                }


                const studentSkills =
                    (student.skills || [])
                        .map(skill =>
                            skill.toLowerCase()
                        );


                return drive.requiredSkills.every(
                    skill =>
                        studentSkills.includes(
                            skill.toLowerCase()
                        )
                );

            });


        if (
            eligibleStudents.length === 0
        ) {

            return res.json([]);

        }


        const maxCGPA =
            Math.max(
                ...eligibleStudents.map(
                    s => s.CGPA
                )
            );


        const maxCPR =
            Math.max(
                ...eligibleStudents.map(s =>
                    s.CPRating &&
                        s.CPRating.length
                        ? Math.max(
                            ...s.CPRating.map(
                                cp => cp.rating
                            )
                        )
                        : 0
                )
            );


        const maxProjects =
            Math.max(
                ...eligibleStudents.map(s =>
                    (s.projects || []).length
                )
            );


        const maxInternships =
            Math.max(
                ...eligibleStudents.map(s =>
                    (s.internships || []).length
                )
            );


        function metricValue(
            student,
            key
        ) {

            if (key === "CGPA") {

                return maxCGPA
                    ? student.CGPA /
                    maxCGPA
                    : 0;

            }


            if (key === "CPRating") {

                return (
                    maxCPR &&
                    student.CPRating &&
                    student.CPRating.length
                )
                    ? Math.max(
                        ...student.CPRating.map(
                            cp => cp.rating
                        )
                    ) / maxCPR
                    : 0;

            }


            if (key === "projects") {

                return maxProjects
                    ? (student.projects || []).length /
                    maxProjects
                    : 0;

            }


            if (key === "internships") {

                return maxInternships
                    ? (student.internships || []).length /
                    maxInternships
                    : 0;

            }


            return 0;

        }


        let ranked =
            eligibleStudents.map(student => {

                let score = 0;


                for (
                    const key in weights
                ) {

                    score +=
                        metricValue(
                            student,
                            key
                        ) *
                        weights[key];

                }


                return {

                    student,

                    score:
                        Number(
                            score.toFixed(4)
                        )

                };

            });


        ranked.sort(
            (a, b) =>
                b.score -
                a.score
        );


        ranked =
            ranked.map(
                (item, index) => {

                    return {

                        rank:
                            index + 1,

                        score:
                            item.score,

                        student:
                            item.student

                    };

                }
            );


        const result =
            top
                ? ranked.slice(
                    0,
                    Number(top)
                )
                : ranked;


        res.json(result);

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const shortlistStudents = async (req, res) => {

    try {

        const {
            students
        } = req.body;


        const drive =
            await Drive.findOne({

                _id:
                    req.params.id,

                createdBy:
                    req.recruiter._id

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        drive.shortlistedStudents =
            students;


        await drive.save();


        res.status(200).json({

            message:
                "Students shortlisted successfully."

        });

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const sendOAEmails = async (req, res) => {

    console.log("Send OA clicked");

    try {

        const drive =
            await Drive.findOne({

                _id:
                    req.params.id,

                createdBy:
                    req.recruiter._id

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        const students =
            await Student.find({

                USN: {
                    $in:
                        drive.shortlistedStudents
                }

            });


        for (
            const student of students
        ) {

            await sendOAEmail(
                student,
                drive
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );

        }


        drive.oaSent =
            true;


        await drive.save();


        res.status(200).json({

            message:
                `OA invitations sent to ${students.length} students.`

        });

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const deleteDrive = async (req, res) => {

    try {

        const drive =
            await Drive.findOneAndDelete({

                _id:
                    req.params.id,

                createdBy:
                    req.recruiter._id

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        res.status(200).json({

            message:
                "Drive deleted successfully."

        });

    }

    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


const uploadOAResults = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                message:
                    "Please upload an OA result CSV file."
            });
        }

        const drive =
            await Drive.findOne({

                _id:
                    req.params.id,

            });


        if (!drive) {

            fs.unlink(
                req.file.path,
                () => { }
            );

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        if (
            !drive.appliedStudents ||
            drive.appliedStudents.length === 0
        ) {

            fs.unlink(
                req.file.path,
                () => { }
            );

            return res.status(400).json({

                message:
                    "There are no applicants for this drive."

            });

        }


        const results = [];


        const requiredColumns = [

            "USN",
            "Name",
            "Email",
            "SubmissionTimestamp",
            "TotalScore",
            "TotalMarks",
            "TestsPassed",
            "TestsTotal",
            "IntegrityScore",
            "IntegrityFlags"

        ];


        let headersValidated =
            false;


        fs.createReadStream(
            req.file.path
        )

            .pipe(
                csv()
            )

            .on(
                "headers",
                headers => {

                    const missingColumns =
                        requiredColumns.filter(
                            column =>
                                !headers.includes(
                                    column
                                )
                        );


                    if (
                        missingColumns.length > 0
                    ) {

                        headersValidated =
                            false;

                        return res.status(
                            400
                        ).json({

                            message:
                                "Invalid OA CSV format.",

                            missingColumns

                        });

                    }


                    headersValidated =
                        true;

                }
            )

            .on(
                "data",
                data => {

                    if (!headersValidated) {
                        return;
                    }

                    results.push(data);

                }
            )

            .on(
                "end",
                async () => {

                    try {

                        fs.unlink(
                            req.file.path,
                            () => { }
                        );


                        if (
                            results.length === 0
                        ) {

                            return res.status(
                                400
                            ).json({

                                message:
                                    "CSV contains no valid records."

                            });

                        }


                        const errors = [];

                        const validResults = [];


                        for (
                            let i = 0;
                            i < results.length;
                            i++
                        ) {

                            const row =
                                results[i];


                            const rowNumber =
                                i + 2;


                            const USN =
                                row.USN?.trim();


                            const name =
                                row.Name?.trim();


                            const email =
                                row.Email?.trim();


                            const timestamp =
                                new Date(
                                    row.SubmissionTimestamp
                                );


                            const totalScore =
                                Number(
                                    row.TotalScore
                                );


                            const totalMarks =
                                Number(
                                    row.TotalMarks
                                );


                            const testsPassed =
                                Number(
                                    row.TestsPassed
                                );


                            const testsTotal =
                                Number(
                                    row.TestsTotal
                                );


                            const integrityScore =
                                Number(
                                    row.IntegrityScore
                                );


                            const integrityFlags =
                                Number(
                                    row.IntegrityFlags
                                );


                            if (!USN) {

                                errors.push(
                                    `Row ${rowNumber}: Missing USN.`
                                );

                                continue;

                            }


                            if (!name) {

                                errors.push(
                                    `Row ${rowNumber}: Missing Name.`
                                );

                                continue;

                            }


                            if (!email) {

                                errors.push(
                                    `Row ${rowNumber}: Missing Email.`
                                );

                                continue;

                            }


                            if (
                                isNaN(
                                    timestamp.getTime()
                                )
                            ) {

                                errors.push(
                                    `Row ${rowNumber}: Invalid submission timestamp.`
                                );

                                continue;

                            }


                            if (
                                isNaN(totalScore) ||
                                isNaN(totalMarks) ||
                                totalMarks <= 0
                            ) {

                                errors.push(
                                    `Row ${rowNumber}: Invalid score.`
                                );

                                continue;

                            }


                            if (
                                isNaN(testsPassed) ||
                                isNaN(testsTotal) ||
                                testsTotal <= 0 ||
                                testsPassed < 0 ||
                                testsPassed > testsTotal
                            ) {

                                errors.push(
                                    `Row ${rowNumber}: Invalid test case values.`
                                );

                                continue;

                            }


                            if (
                                isNaN(integrityScore) ||
                                integrityScore < 0 ||
                                integrityScore > 100
                            ) {

                                errors.push(
                                    `Row ${rowNumber}: Invalid integrity score.`
                                );

                                continue;

                            }


                            if (
                                isNaN(integrityFlags) ||
                                integrityFlags < 0
                            ) {

                                errors.push(
                                    `Row ${rowNumber}: Invalid integrity flags.`
                                );

                                continue;

                            }


                            validResults.push({

                                USN,

                                name,

                                email,

                                submissionTimestamp:
                                    timestamp,

                                totalScore,

                                totalMarks,

                                testsPassed,

                                testsTotal,

                                integrityScore,

                                integrityFlags

                            });

                        }


                        if (
                            validResults.length === 0
                        ) {

                            return res.status(
                                400
                            ).json({

                                message:
                                    "No valid OA records found.",

                                errors

                            });

                        }


                        const applicants =
                            await Student.find({

                                _id: {
                                    $in:
                                        drive.appliedStudents
                                }

                            }).select("USN");


                        const applicantUSNs =
                            new Set();


                        applicants.forEach(
                            student => {

                                applicantUSNs.add(
                                    student.USN
                                );

                            }
                        );


                        let updated = 0;

                        let skipped = 0;


                        for (
                            const result
                            of validResults
                        ) {

                            console.log(
                                "CSV USN:",
                                JSON.stringify(result.USN)
                            );

                            console.log(
                                "Applicant USNs:",
                                [...applicantUSNs].map(
                                    usn => JSON.stringify(usn)
                                )
                            );

                            console.log(
                                "Drive appliedStudents:",
                                drive.appliedStudents
                            );

                            if (
                                !applicantUSNs.has(
                                    result.USN
                                )
                            ) {

                                skipped++;

                                continue;

                            }


                            await Student.updateOne(

                                {
                                    USN:
                                        result.USN
                                },

                                {
                                    $push: {

                                        OAResults: {

                                            driveId:
                                                drive._id,

                                            company:
                                                drive.companyName,

                                            name:
                                                result.name,

                                            email:
                                                result.email,

                                            submissionTimestamp:
                                                result.submissionTimestamp,

                                            totalScore:
                                                result.totalScore,

                                            totalMarks:
                                                result.totalMarks,

                                            testsPassed:
                                                result.testsPassed,

                                            testsTotal:
                                                result.testsTotal,

                                            integrityScore:
                                                result.integrityScore,

                                            integrityFlags:
                                                result.integrityFlags

                                        }

                                    }

                                }

                            );


                            updated++;

                        }


                        return res.status(
                            200
                        ).json({

                            message:
                                "OA results uploaded successfully.",

                            totalRecords:
                                results.length,

                            validRecords:
                                validResults.length,

                            updated,

                            skipped,

                            errors

                        });

                    }

                    catch (err) {

                        console.error(
                            "OA RESULT PROCESSING ERROR:",
                            err
                        );

                        return res.status(
                            500
                        ).json({
                            message:
                                err.message
                        });

                    }

                }
            )

            .on(
                "error",
                err => {

                    console.error(
                        "CSV READ ERROR:",
                        err
                    );

                    fs.unlink(
                        req.file.path,
                        () => { }
                    );

                }
            );

    }

    catch (err) {

        console.error(
            "UPLOAD OA ERROR:",
            err
        );

        if (req.file) {

            fs.unlink(
                req.file.path,
                () => { }
            );

        }

        return res.status(500).json({
            message:
                err.message
        });

    }

};


const getOAResults = async (req, res) => {

    try {

        const drive =
            await Drive.findOne({

                _id:
                    req.params.id,

                createdBy:
                    req.recruiter._id

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        const students =
            await Student.find({

                _id: {
                    $in:
                        drive.appliedStudents
                }

            }).select(
                "name USN email OAResults"
            );


        const results = [];


        students.forEach(
            student => {

                const result =
                    student.OAResults.find(
                        oa =>
                            oa.driveId &&
                            oa.driveId.toString() ===
                            drive._id.toString()
                    );


                if (result) {

                    results.push({

                        studentId:
                            student._id,

                        USN:
                            student.USN,

                        name:
                            result.name ||
                            student.name,

                        email:
                            result.email ||
                            student.email,

                        submissionTimestamp:
                            result.submissionTimestamp,

                        totalScore:
                            result.totalScore,

                        totalMarks:
                            result.totalMarks,

                        testsPassed:
                            result.testsPassed,

                        testsTotal:
                            result.testsTotal,

                        passRatio:
                            result.testsTotal > 0
                                ? (
                                    result.testsPassed /
                                    result.testsTotal
                                ) * 100
                                : 0,

                        integrityScore:
                            result.integrityScore,

                        integrityFlags:
                            result.integrityFlags

                    });

                }

            }
        );


        results.sort(
            (a, b) =>
                b.totalScore -
                a.totalScore
        );


        res.status(200).json(
            results
        );

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};


const saveInterviewCandidates = async (req, res) => {

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
                    "No candidates selected."

            });

        }


        const drive =
            await Drive.findOne({

                _id:
                    req.params.id,

                createdBy:
                    req.recruiter._id

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        if (drive.interviewEmailsSent) {

            return res.status(400).json({

                message:
                    "Interview emails have already been sent."

            });

        }


        const applicants =
            new Set(

                drive.appliedStudents.map(
                    id =>
                        id.toString()
                )

            );


        for (
            const studentId
            of studentIds
        ) {

            if (
                !applicants.has(
                    studentId.toString()
                )
            ) {

                return res.status(
                    400
                ).json({

                    message:
                        "One or more selected students are not applicants of this drive."

                });

            }

        }


        const students =
            await Student.find({

                _id: {
                    $in:
                        studentIds
                }

            });


        if (
            students.length !==
            studentIds.length
        ) {

            return res.status(
                400
            ).json({

                message:
                    "One or more selected students were not found."

            });

        }


        drive.interviewCandidates =
            studentIds;


        await drive.save();


        res.status(200).json({

            message:
                "Interview candidates saved successfully.",

            count:
                studentIds.length

        });

    }

    catch (err) {

        console.error(
            "SAVE INTERVIEW CANDIDATES ERROR:",
            err
        );

        res.status(500).json({
            message: err.message
        });

    }

};


const saveInterviewDetails = async (req, res) => {

    try {

        const {
            date,
            time,
            location,
            requiredDocuments,
            additionalInstructions
        } = req.body;


        if (
            !date ||
            !time ||
            !location
        ) {

            return res.status(400).json({

                message:
                    "Date, time and location are required."

            });

        }


        const drive =
            await Drive.findOne({

                _id:
                    req.params.id,

                createdBy:
                    req.recruiter._id

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        if (
            !drive.interviewCandidates ||
            drive.interviewCandidates.length === 0
        ) {

            return res.status(400).json({

                message:
                    "No interview candidates have been selected."

            });

        }


        if (drive.interviewEmailsSent) {

            return res.status(400).json({

                message:
                    "Interview invitations have already been sent."

            });

        }


        drive.interviewDetails = {

            date:
                new Date(date),

            time,

            location,

            requiredDocuments:
                Array.isArray(
                    requiredDocuments
                )
                    ? requiredDocuments
                    : [],

            additionalInstructions:
                additionalInstructions ||
                ""

        };


        await drive.save();


        res.status(200).json({

            message:
                "Interview details saved successfully."

        });

    }

    catch (err) {

        console.error(
            "SAVE INTERVIEW DETAILS ERROR:",
            err
        );

        res.status(500).json({
            message: err.message
        });

    }

};


const getInterviewCandidates = async (req, res) => {

    try {

        const drive =
            await Drive.findOne({

                _id:
                    req.params.id,

                createdBy:
                    req.recruiter._id

            });


        if (!drive) {

            return res.status(404).json({
                message:
                    "Drive not found."
            });

        }


        const students =
            await Student.find({

                _id: {
                    $in:
                        drive.interviewCandidates ||
                        []
                }

            }).select(
                "name USN email Branch CGPA resumeURL"
            );


        res.status(200).json(
            students
        );

    }

    catch (err) {

        console.error(
            "GET INTERVIEW CANDIDATES ERROR:",
            err
        );

        res.status(500).json({
            message: err.message
        });

    }

};


const sendInterviewInvitations = async (req, res) => {

    try {
        const drive =
            await Drive.findOne({
                _id: req.params.id,
            });


        if (!drive) {
            return res.status(404).json({
                message:
                    "Drive not found."
            });
        }

        if (
            !drive.interviewCandidates ||
            drive.interviewCandidates.length === 0
        ) {
            return res.status(400).json({
                message:
                    "No interview candidates selected."
            });
        }

        if (
            !drive.interviewDetails ||
            !drive.interviewDetails.date ||
            !drive.interviewDetails.time ||
            !drive.interviewDetails.location
        ) {
            return res.status(400).json({
                message:
                    "Please save interview details before sending invitations."
            });
        }

        if (drive.interviewEmailsSent) {
            return res.status(400).json({
                message:
                    "Interview invitations have already been sent."
            });
        }


        const students =
            await Student.find({
                _id: { $in: drive.interviewCandidates }
            }).select(
                "name email"
            );

        if (students.length === 0) {
            return res.status(404).json({
                message:
                    "No selected students were found."
            });
        }

        const failedEmails = [];

        for (
            const student
            of students
        ) {
            try {

                await sendInterviewEmail({
                    email:
                        student.email,
                    studentName:
                        student.name,
                    companyName:
                        drive.companyName,
                    jobTitle:
                        drive.jobTitle,
                    interviewDate:
                        drive.interviewDetails.date,
                    interviewTime:
                        drive.interviewDetails.time,
                    location:
                        drive.interviewDetails.location,
                    requiredDocuments:
                        drive.interviewDetails
                            .requiredDocuments,
                    additionalInstructions:
                        drive.interviewDetails
                            .additionalInstructions
                });

            }

            catch (emailError) {

                console.error(
                    `Failed to send email to ${student.email}:`,
                    emailError
                );

                failedEmails.push({

                    email:
                        student.email,

                    name:
                        student.name

                });

            }

        }


        if (
            failedEmails.length > 0
        ) {

            return res.status(207).json({

                message:
                    "Some interview invitations could not be sent.",

                totalCandidates:
                    students.length,

                successful:
                    students.length -
                    failedEmails.length,

                failed:
                    failedEmails

            });

        }


        drive.interviewEmailsSent =
            true;


        await drive.save();


        return res.status(200).json({

            message:
                "Interview invitations sent successfully.",

            totalSent:
                students.length

        });

    }

    catch (err) {

        console.error(
            "SEND INTERVIEW INVITATIONS ERROR:",
            err
        );

        return res.status(500).json({
            message: err.message
        });

    }

};


module.exports = {

    getEligibleApplis,

    createDrive,

    getMyDrives,

    getDriveById,

    rankEligibleStudents,

    shortlistStudents,

    sendOAEmails,

    deleteDrive,

    uploadOAResults,

    getOAResults,

    saveInterviewCandidates,

    saveInterviewDetails,

    getInterviewCandidates,

    sendInterviewInvitations

};