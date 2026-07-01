const Drive = require('../models/driveModel')
const Student = require('../models/studentsmodels')

const getEligibleApplis = async(req,res) => {

    try{
        const driveId = req.params.id
        const drive = await Drive.findById(driveId)

        if(!drive){
            return res.status(404).send("Drive not found")
        }

        const Applicants = await Student.find({
            USN : {$in : drive.appliedStus}
        })

        const eligStus = Applicants.filter(student => {
                if(student.CGPA < drive.minCGPA){
                    return false
                }
                if(!drive.Branches.includes(student.branch)){
                    return false
                }
                if(student.activeBacklogs > drive.backlogsAllowed){
                    return false
                }
                return true;
            }
        )
        res.send(eligStus)
    }
    catch(err){
        res.status(500).send(err.message)
    }
}

module.exports = {
    getEligibleApplis
}