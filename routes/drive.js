const express = require('express')
const router = express.Router()
const driveController = require("../controllers/driveController");
const authenticateRecruiter = require("../middlewares/authenticateRecruiter");
const oaUpload = require("../middlewares/oaUpload");

router.get("/", authenticateRecruiter, driveController.getMyDrives);

router.post("/", authenticateRecruiter, driveController.createDrive);

router.get('/:id/eligible', authenticateRecruiter, driveController.getEligibleApplis);

router.get("/:id", authenticateRecruiter, driveController.getDriveById);

router.post("/:id/rank", authenticateRecruiter, driveController.rankEligibleStudents);

router.post("/:id/shortlist", authenticateRecruiter, driveController.shortlistStudents);

router.post("/:id/send-oa", authenticateRecruiter, driveController.sendOAEmails);

router.delete("/:id", authenticateRecruiter, driveController.deleteDrive);

router.post("/:id/upload-oa", authenticateRecruiter, oaUpload.single("file"),driveController.uploadOAResults);

router.get("/:id/oa-results", authenticateRecruiter, driveController.getOAResults);

router.post("/:id/interview-candidates", authenticateRecruiter, driveController.saveInterviewCandidates);

router.post("/:id/interview-details", authenticateRecruiter, driveController.saveInterviewDetails);

router.get("/:id/interview-candidates", authenticateRecruiter, driveController.getInterviewCandidates);

router.post("/:id/send-interview-invitations", authenticateRecruiter, driveController.sendInterviewInvitations);

module.exports = router