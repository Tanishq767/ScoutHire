const express = require('express')
const router = express.Router();
const validateStudent = require('../middlewares/validateStudent');
const studentController = require('../controllers/studentcontroller')

router.get('/', studentController.getStudent)

router.post('/', 
    studentController.createStudent);

router.get('/usn/:usn', studentController.getStudentbyUSN);

router.post('/filter', studentController.filterStudents); 

const upload = require('../middlewares/upload'); 
const {uploadStudents} = require('../controllers/studentcontroller'); 

router.post('/upload', upload.single('file'), uploadStudents); 

module.exports = router