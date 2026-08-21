const Company =
    require("../models/companyModel");

const Recruiter =
    require("../models/recruiterModel");

const College =
    require("../models/collegeModel");

const CollegeCompany =
    require("../models/collegeCompanyModel");


const createCompanyForRecruiter =
    async (req, res) => {

        try {

            const recruiter =
                await Recruiter.findById(
                    req.recruiter._id
                );

            if (!recruiter) {

                return res.status(404).json({
                    message:
                        "Recruiter not found."
                });

            }

            if (recruiter.companyId) {

                return res.status(400).json({
                    message:
                        "Recruiter already belongs to a company."
                });

            }

            const {
                companyName,
                website,
                country,
                registrationNumber
            } = req.body;

            let company =
                await Company.findOne({
                    companyName
                });

            if (!company) {

                company =
                    new Company({

                        companyName,
                        website,
                        country,
                        registrationNumber

                    });

                await company.save();

            }

            recruiter.companyId =
                company._id;

            await recruiter.save();

            res.status(201).json({

                message:
                    "Company linked successfully.",

                company

            });

        }
        catch (err) {

            res.status(500).json({
                message: err.message
            });

        }

    };


const getApprovedColleges =
    async (req, res) => {

        try {

            const recruiter =
                req.recruiter;

            if (!recruiter.companyId) {

                return res.status(400).json({
                    message:
                        "Recruiter is not linked to a company."
                });

            }

            const relationships =
                await CollegeCompany.find({

                    companyId:
                        recruiter.companyId,

                    status:
                        "Approved"

                })
                .populate(
                    "collegeId",
                    "collegeName collegeCode location"
                )
                .lean();

            const colleges =
                relationships
                    .filter(
                        item => item.collegeId
                    )
                    .map(
                        item => item.collegeId
                    );

            res.json(colleges);

        }
        catch (err) {

            console.error(err);

            res.status(500).json({
                message: err.message
            });

        }

    };

const getColleges = async (req, res) => {

    try {

        const recruiter =
            await Recruiter.findById(req.recruiter._id);

        if (!recruiter || !recruiter.companyId) {

            return res.status(400).json({
                message:
                    "Recruiter is not linked to a company."
            });

        }

        const colleges =
            await College.find({})
                .select(
                    "collegeName collegeCode location website"
                )
                .sort({
                    collegeName: 1
                })
                .lean();


        const relationships =
            await CollegeCompany.find({
                companyId:
                    recruiter.companyId
            }).lean();


        const relationshipMap =
            new Map();


        relationships.forEach(item => {

            relationshipMap.set(
                item.collegeId.toString(),
                {
                    status: item.status,
                    initiatedBy: item.initiatedBy
                }
            );

        });


        const result =
            colleges.map(college => {

                const relationship =
                    relationshipMap.get(
                        college._id.toString()
                    );


                return {

                    ...college,

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
            message: err.message
        });

    }

};


const requestCollege = async (req, res) => {

    try {

        const recruiter =
            await Recruiter.findById(
                req.recruiter._id
            );


        if (!recruiter || !recruiter.companyId) {

            return res.status(400).json({
                message:
                    "Recruiter is not linked to a company."
            });

        }


        const college =
            await College.findById(
                req.params.collegeId
            );


        if (!college) {

            return res.status(404).json({
                message:
                    "College not found."
            });

        }


        let relationship =
            await CollegeCompany.findOne({

                companyId:
                    recruiter.companyId,

                collegeId:
                    college._id

            });


        if (relationship) {

            if (
                relationship.status ===
                "Approved"
            ) {

                return res.status(400).json({
                    message:
                        "Partnership already approved."
                });

            }


            if (
                relationship.status ===
                "Verification Required"
            ) {

                return res.status(400).json({
                    message:
                        "Partnership request is already awaiting verification."
                });

            }


            relationship.status =
                "Verification Required";

            relationship.initiatedBy =
                "company";

            relationship.verificationCode =
                null;

        }
        else {

            relationship =
                new CollegeCompany({

                    companyId:
                        recruiter.companyId,

                    collegeId:
                        college._id,

                    status:
                        "Verification Required",

                    initiatedBy:
                        "company",

                    verificationCode:
                        null

                });

        }


        await relationship.save();


        res.status(201).json({

            message:
                "Partnership request sent. Agree on a verification code with the college and enter it when requested."

        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            message: err.message
        });

    }

};


const verifyCollegePartnership =
    async (req, res) => {

        try {

            const recruiter =
                await Recruiter.findById(
                    req.recruiter._id
                );


            if (
                !recruiter ||
                !recruiter.companyId
            ) {

                return res.status(400).json({
                    message:
                        "Recruiter is not linked to a company."
                });

            }


            const {
                verificationCode
            } = req.body;


            if (
                !verificationCode ||
                !verificationCode.trim()
            ) {

                return res.status(400).json({
                    message:
                        "Verification code is required."
                });

            }


            const relationship =
                await CollegeCompany.findOne({

                    companyId:
                        recruiter.companyId,

                    collegeId:
                        req.params.collegeId,

                    status:
                        "Verification Required"

                });


            if (!relationship) {

                return res.status(404).json({
                    message:
                        "Partnership verification request not found."
                });

            }


            if (
                relationship.verificationCode !==
                verificationCode.trim()
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
                message: err.message
            });

        }

    };


module.exports = {

    createCompanyForRecruiter,
    getApprovedColleges,
    getColleges,
    requestCollege,
    verifyCollegePartnership

};