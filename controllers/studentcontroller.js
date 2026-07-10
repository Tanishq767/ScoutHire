const {Student} = require('../models/studentsmodels')
const csv = require('csv-parser')
const fs = require('fs')

const createStudent = async(req,res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).send(student);

    } catch (err){
        if(err.name == 'ValidationError'){
            return res.status(400).send({error : "Bad Request", details: "is that a real student? idts! please send valid student data"})
        }
        if(err.code == 11000){
            return res.status(400).send({error : "conflict", details : "Your email ID is quite in demand, it is taken!"})
        }
        console.error("System error details: ", err)
        return res.status(500).send({error : "internal server error", message : "our servers are currently doing backflips, in the meantime go grab some coffee and be back to hit that submit again!"})
    }
};

const getStudent = async(req,res) => {
    try{
        const students = await Student.find();
        res.send(students);
    } catch(err){
        res.status(500).send(err.message);
    }
};

const getStudentbyUSN = async(req,res) => {
    try{
        const student = await Student.findOne({USN : req.params.usn});

        if(!student){
            return res.status(404).send("student not found");
        }

        res.send(student);
    }catch(err){
        res.status(500).send(err.message);
    }
};

const uploadStudents = async (req, res) => {
    if(!req.file){
        return res.status(400).send("No file uploaded")
    }
    const results = []

    function safeParse(field){
        try{
            return field ? JSON.parse(field.trim()) : []
        } catch {
            return []
        }
    }

    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {

        const date = new Date(data.birthdate)

        results.push({
            name: data.name,
            USN: data.USN,
            birthdate: isNaN(date) ? null : date,
            email: data.email,
            phone: String(data.phone),
            Branch: data.Branch,
            year: Number(data.year) || 0,
            CGPA: Number(data.CGPA) || 0,

            skills: safeParse(data.skills),
            CPRating: safeParse(data.CPRating),
            projects: safeParse(data.projects),
            internships: safeParse(data.internships),

            resumeURL: data.resumeURL
        })
    })
    .on('end', async () => {
        try{
            await Student.insertMany(results)
            fs.unlink(req.file.path, () => {})

            res.json({ message: "Students uploaded successfully" })
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    })

}

module.exports = {
    createStudent,
    getStudent,
    getStudentbyUSN,
    uploadStudents,
};