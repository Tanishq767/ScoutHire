const {Student} = require('../models/studentsmodels')
const csv = require('csv-parser')
const fs = require('fs')

const createStudent = async(req,res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).send(student);
    } catch (err){
        res.status(400).send(err.message);
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
            Branch: data.branch,
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

const filterStudents = async (req,res) => {
    try{

        const { branches, weights, percent } = req.body

        const allowedMetrics = [
            "CGPA",
            "CPRating",
            "internships",
            "projects"
        ]

        for(const key in weights){
            if(!allowedMetrics.includes(key)){
                return res.status(400).send("Invalid metric in weights")
            }
        }
        let total = 0
        for(const key in weights){
            total += weights[key]
        }

        for(const key in weights){
            weights[key] = weights[key] / total
        }

        let query = {}

        if(branches && !branches.includes("ALL")){
            query.Branch = { $in: branches } //in is mongoose operator to find if students Branch is in branches.
        }

        const students = await Student.find(query)

        function getMetricsValue(student, key){
            if(key === "CGPA"){
                return student.CGPA
            }
            if(key === "CPRating"){
                return student.CPRating.length ? Math.max(...student.CPRating.map(r => r.rating)) : 0 //... to spread the student.CPRating and map to create a new array where we got only rating values and r => r.rating is a form of arrow fn in JS, it means r => {return r.rating}
            }
            if(key === "projects"){
                return student.projects.length
            }
            if(key === "internships"){
                return student.internships.length
            }
        }

        const ranked = students.map(s => {

            let score = 0

            for(const key in weights){
                score += getMetricsValue(s, key) * weights[key]
            }

            return {
                ...s._doc,
                score
            }
        })

        ranked.sort((a,b)=> b.score - a.score)

        const count = Math.ceil(ranked.length * (percent / 100))

        const result = ranked.slice(0, count)

        res.send(result)

    } catch(err){
        res.status(500).send(err.message)
    }
}

module.exports = {
    createStudent,
    getStudent,
    getStudentbyUSN,
    uploadStudents,
    filterStudents,
};