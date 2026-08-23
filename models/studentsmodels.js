const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 30 },
    USN: { type: String, required: true, unique: true },
    birthdate: { type: Date, required: true },
    email: { type: String, required: true, match: /.+\@.+\..+/ },
    phone: { type: String, required: true, minlength: 10, maxlength: 10 },
    Branch: { type: String, required: true },
    year: { type: Number, required: true },
    CGPA: { type: Number, required: true },
    projects: [
        {
            title: String,
            domain: String,
            complexity: String,
        }
    ],
    skills: [String],
    CPRating: [
        {
            platform: String,
            rating: Number
        }
    ],
    internships: [
        {
            role: String,
            company: String,
            domain: String
        }
    ],
    resumeURL: {
        type: String,
        default: ""
    },

    resumePublicId: {
        type: String,
        default: ""
    },

    OAResults: [
        {
            driveId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Drive"
            },

            company: String,

            name: String,

            email: String,

            submissionTimestamp: Date,

            totalScore: Number,

            totalMarks: Number,

            testsPassed: Number,

            testsTotal: Number,

            integrityScore: Number,

            integrityFlags: Number
        }
    ],
    interviewResults: [
        {
            company: String,
            round: String,
            score: Number
        }
    ],
    activeBacklogs: {
        type: Number,
        default: 0
    },

    password: {
        type: String,
        required: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationToken: {
        type: String,
        default: null
    },

    appliedDrives: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drive"
    }],

    verificationTokenExpiry: {
        type: Date,
        default: null
    },

    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        required: false,
        default: null
    },
})

const Student = new mongoose.model('Student', studentSchema)

module.exports = Student
