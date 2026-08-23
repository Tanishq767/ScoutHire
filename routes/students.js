const express = require('express');
const router = express.Router();
const validateStudent = require('../middlewares/validateStudent');
const studentController = require('../controllers/studentcontroller');
const authenticateStudent = require('../middlewares/authenticateStudent');
const upload = require('../middlewares/upload');      
const resumeUpload = require("../middlewares/resumeUpload");
const {uploadStudents} = require('../controllers/studentcontroller'); 

router.get('/searchStudent/:name', studentController.getStudentbyName)

router.get('/usn/:usn', studentController.getStudentbyUSN);

router.post('/upload', upload.single('file'), uploadStudents); 

router.post('/register', studentController.registerStudent);

router.get('/verify/:token', studentController.verifyStudent);

router.post('/login', studentController.loginStudent);

router.get('/me', authenticateStudent, studentController.getLoggedInStudent);

router.get("/eligible-drives", authenticateStudent, studentController.getEligibleDrives);

router.post("/apply/:id", authenticateStudent, studentController.applyToDrive);

router.post("/resume", authenticateStudent, resumeUpload.single("resume"), studentController.uploadResume);

router.delete("/me", authenticateStudent, studentController.deleteStudentAccount);

module.exports = router
