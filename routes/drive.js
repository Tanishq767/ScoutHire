const express = require('express')
const router = express.Router()
const driveController = require("../controllers/driveController");
const authenticateRecruiter = require("../middlewares/authenticateRecruiter");
router.get("/", authenticateRecruiter, driveController.getMyDrives);

router.post("/", authenticateRecruiter, driveController.createDrive);

router.get('/:id/eligible', authenticateRecruiter, driveController.getEligibleApplis);

router.get("/:id", authenticateRecruiter, driveController.getDriveById);

router.post(":id/rank", authenticateRecruiter, driveController.rankEligibleStudents);

router.post("/:id/shortlist", authenticateRecruiter, driveController.shortlistStudents);

router.post("/:id/send-oa", authenticateRecruiter, driveController.sendOAEmails);

router.delete("/:id", authenticateRecruiter, driveController.deleteDrive);

module.exports = router