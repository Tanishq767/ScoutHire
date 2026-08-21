const express = require("express");

const router =
    express.Router();

const authenticateRecruiter =
    require("../middlewares/authenticateRecruiter");

const companyController =
    require("../controllers/companyController");


router.post(
    "/",
    authenticateRecruiter,
    companyController.createCompanyForRecruiter
);

router.get(
    "/approved-colleges",
    authenticateRecruiter,
    companyController.getApprovedColleges
);

router.get(
    "/colleges",
    authenticateRecruiter,
    companyController.getColleges
);


router.post(
    "/colleges/:collegeId/request",
    authenticateRecruiter,
    companyController.requestCollege
);

router.post(
    "/colleges/:collegeId/verify-partnership",
    authenticateRecruiter,
    companyController.verifyCollegePartnership
);


module.exports = router;