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
    }//if valid json, return it, else return empty array

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
            year: Number(data.year) || 0, //we dont wanna store NaN
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
            "resumeScore",
            "hackathons",
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
        const ranked = students.map(s => {

            let score = 0

            for(const key in weights){
                score += (s[key] || 0) * weights[key]
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