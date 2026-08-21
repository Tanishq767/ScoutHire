const express = require("express");

const router =
    express.Router();

const collegeController =
    require("../controllers/collegeController");

const authenticateCollege =
    require("../middlewares/authenticateCollege");

const upload =
    require("../middlewares/upload");


router.post(
    "/register",
    collegeController.registerCollege
);


router.post(
    "/login",
    collegeController.loginCollege
);


router.get(
    "/profile",
    authenticateCollege,
    collegeController.getProfile
);


router.get(
    "/companies",
    authenticateCollege,
    collegeController.getCompanies
);


router.post(
    "/companies/:companyId/approve",
    authenticateCollege,
    collegeController.approveCompany
);


router.get(
    "/approved-companies",
    authenticateCollege,
    collegeController.getApprovedCompanies
);


router.post(
    "/students/assign",
    authenticateCollege,
    collegeController.assignStudentsToCollege
);


router.get(
    "/students",
    authenticateCollege,
    collegeController.getCollegeStudents
);

router.post(
    "/students/upload",
    authenticateCollege,
    upload.single("file"),
    collegeController.uploadCollegeStudents
);

router.get(
    "/drives",
    authenticateCollege,
    collegeController.getCollegeDrives
);


router.post(
    "/drives/:driveId/approve",
    authenticateCollege,
    collegeController.approveDrive
);

router.get(
    "/partnerships/companies",
    authenticateCollege,
    collegeController.getCompaniesForPartnership
);

router.post(
    "/partnerships/companies/:companyId/request",
    authenticateCollege,
    collegeController.requestCompany
);

router.post(
    "/partnerships/companies/:companyId/verify",
    authenticateCollege,
    collegeController.verifyCompanyPartnership
);

module.exports = router;