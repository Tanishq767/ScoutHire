const mongoose = requrie('mongoose')

const driveSchema = new mongoose.Schema({
    companyName : String,
    role : [string],
    minCGPA : Number,
    Branches : [string],
    reqSkills : [string],
    backlogsAllowed : Boolean,
    OAWeight : Number,
    interviewWeight : Number,
    appliedStus : [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true
    }
})

const Drive = mongoose.model('Drive' ,driveSchema)
exports.Drive = Drive
