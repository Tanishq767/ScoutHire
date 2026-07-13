const Drive = require('../models/driveModel')
const Student = require('../models/studentsmodels')
const {sendOAEmail} = require("../utils/mailSender")

const getEligibleApplis = async(req, res) => {

    try{
        const drive = await Drive.findOne({
            _id: req.params.id,
            createdBy: req.recruiter._id
        });

        if(!drive){
            return res.status(404).json({
                message: "Drive not found."
            });
        }

        const students = await Student.find({
            CGPA: { $gte: drive.minimumCGPA },
            Branch: { $in: drive.eligibleBranches }
        });

        const eligibleStudents = students.filter(student => {

            if(drive.requiredSkills.length === 0){
                return true;
            }

            const studentSkills = student.skills.map(skill =>
                skill.toLowerCase()
            );

            return drive.requiredSkills.every(skill =>
                studentSkills.includes(skill.toLowerCase())
            );

        });
        res.status(200).json(eligibleStudents);
    }

    catch(err){
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
}

const createDrive = async(req, res) => {

    try{
        const {
            jobTitle,
            packageLPA,
            location,
            minimumCGPA,
            eligibleBranches,
            requiredSkills,
            applicationDeadline,
            jobDescription
        } = req.body;

        console.log(req.recruiter);
        const drive = new Drive({
            createdBy: req.recruiter._id,
            companyName: req.recruiter.companyName,
            jobTitle,
            packageLPA,
            location,
            minimumCGPA,
            eligibleBranches,
            requiredSkills,
            applicationDeadline,
            jobDescription
        });

        await drive.save();

        res.status(201).json({
            message: "Drive created successfully."
        });
    }

    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
};
const getMyDrives = async(req, res) => {

    try{
        const drives = await Drive.find({
            createdBy: req.recruiter._id
        }).sort({createdAt: -1});
        res.status(200).json(drives);
    }

    catch(err){
        res.status(500).json({
            message: err.message
        });
    }
};

const getDriveById = async(req, res) => {

    try{
        const drive = await Drive.findOne({
            _id: req.params.id,
            createdBy: req.recruiter._id
        });
        if(!drive){
            return res.status(404).json({
                message: "Drive not found."
            });
        }
        res.status(200).json(drive);
    }

    catch(err){
        res.status(500).json({
            message: err.message
        });
    }

}

const rankEligibleStudents = async(req,res) => {

    try{

        const { weights, top } = req.body;
        const driveId = req.params.id;
        const drive = await Drive.findById(driveId);

        if(!drive){
            return res.status(404).json({
                message:"Drive not found."
            });
        }

        let total = 0;

        for(const key in weights){
            total += Number(weights[key]);
        }

        if(total === 0){
            return res.status(400).json({
                message:"At least one weight must be greater than 0."
            });
        }

        for(const key in weights){
            weights[key] = Number(weights[key]) / total;
        }

        const students = await Student.find({
            CGPA: { $gte: drive.minimumCGPA },
            Branch: { $in: drive.eligibleBranches }
        }).lean();

        const eligibleStudents = students.filter(student=>{

            if(drive.requiredSkills.length===0){
                return true;
            }

            const studentSkills = student.skills.map(skill=>
                skill.toLowerCase()
            );

            return drive.requiredSkills.every(skill=>
                studentSkills.includes(skill.toLowerCase())
            );
        });

        if(eligibleStudents.length===0){
            return res.json([]);
        }

        const maxCGPA = Math.max(...eligibleStudents.map(s=>s.CGPA));

        const maxCPR = Math.max(...eligibleStudents.map(s=>
            s.CPRating.length
                ? Math.max(...s.CPRating.map(cp=>cp.rating))
                : 0
        ));

        const maxProjects = Math.max(...eligibleStudents.map(s=>
            s.projects.length
        ));

        const maxInternships = Math.max(...eligibleStudents.map(s=>
            s.internships.length
        ));

        function metricValue(student,key){

            if(key==="CGPA"){
                return maxCGPA
                    ? student.CGPA/maxCGPA
                    : 0;
            }
            if(key==="CPRating"){
                return maxCPR && student.CPRating.length
                    ? Math.max(...student.CPRating.map(cp=>cp.rating))/maxCPR
                    : 0;
            }
            if(key==="projects"){
                return maxProjects
                    ? student.projects.length/maxProjects
                    : 0;
            }
            if(key==="internships"){
                return maxInternships
                    ? student.internships.length/maxInternships
                    : 0;
            }
            return 0;
        }

        let ranked = eligibleStudents.map(student=>{
            let score = 0;
            for(const key in weights){
                score += metricValue(student,key)*weights[key];
            }
            return{
                student,
                score:Number(score.toFixed(4))
            };
        });

        ranked.sort((a,b)=>b.score-a.score);
        ranked = ranked.map((item,index)=>{
            return{
                rank:index+1,
                score:item.score,
                student:item.student
            };
        });
        const result = top
            ? ranked.slice(0,Number(top))
            : ranked;
        res.json(result);
    }
    catch(err){
        res.status(500).json({
            message:err.message
        });
    }
}

const shortlistStudents = async(req,res)=>{

    try{
        const { students } = req.body;
        const drive = await Drive.findOne({
            _id:req.params.id,
            createdBy:req.recruiter._id
        });
        if(!drive){
            return res.status(404).json({
                message:"Drive not found."
            });
        }
        drive.shortlistedStudents = students;
        await drive.save();
        res.status(200).json({
            message:"Students shortlisted successfully.",
        });

    }
    catch(err){
        res.status(500).json({
            message:err.message
        });
    }
}

const sendOAEmails = async(req,res)=>{
    console.log("Send OA clicked");

    try{
        const drive = await Drive.findOne({
            _id:req.params.id,
            createdBy:req.recruiter._id
        });
        if(!drive){
            return res.status(404).json({
                message:"Drive not found."
            });
        }
        // if(drive.oaSent){
        //     return res.status(400).json({
        //         message:"OA invitations have already been sent."
        //     });
        // }
        const students = await Student.find({
            USN:{
                $in:drive.shortlistedStudents
            }
        });
        for (const student of students) {
            await sendOAEmail(student, drive);

            await new Promise(resolve => setTimeout(resolve, 500));
        }
        drive.oaSent = true;
        await drive.save();
        res.status(200).json({
            message:`OA invitations sent to ${students.length} students.`
        });
    }
    catch(err){
        res.status(500).json({
            message:err.message
        });
    }
}

const deleteDrive = async (req, res) => {
    try {
        const drive = await Drive.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.recruiter._id
        });

        if (!drive) {
            return res.status(404).json({
                message: "Drive not found."
            });
        }

        res.status(200).json({
            message: "Drive deleted successfully."
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = {
    getEligibleApplis,
    createDrive,
    getMyDrives,
    getDriveById,
    rankEligibleStudents,
    shortlistStudents,
    sendOAEmails,
    deleteDrive
}