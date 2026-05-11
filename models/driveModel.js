const mongoose = requrie('mongoose')

const driveSchema = new mongoose.Schema({
    driveId : String,
    companyName : String,
    role : [string],
    minCGPA : Number,
    Branches : [string],
    reqSkills : [string],
    backlogsAllowed : Boolean,
    OAWeight : Number,
    interviewWeight : Number,
    appliedStus : [String]
})

const Drive = mongoose.model('Drive' ,driveSchema)
exports.Drive = Drive
