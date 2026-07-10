const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema({

    companyName: {
        type: String,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true
    },

    jobTitle: {
        type: String,
        required: true
    },

    jobDescription: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    packageLPA: {
        type: Number,
        required: true
    },

    minimumCGPA: {
        type: Number,
        required: true
    },

    eligibleBranches: [String],

    shortlistedStudents : [String],

    oaSent: { type: Boolean, default: false },

    requiredSkills: [String],

    backlogsAllowed: {
        type: Boolean,
        default: false
    },

    appliedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],

    applicationDeadline: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open"
    }

}, { timestamps: true });

module.exports = mongoose.model("Drive", driveSchema);