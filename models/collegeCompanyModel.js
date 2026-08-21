const mongoose = require("mongoose");

const collegeCompanySchema = new mongoose.Schema({

    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        required: true
    },

    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Verification Required",
            "Approved",
            "Rejected"
        ],
        default: "Pending"
    },

    initiatedBy: {
        type: String,
        enum: [
            "college",
            "company"
        ],
        required: true
    },

    verificationCode: {
        type: String,
        default: null
    },

    approvedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});


collegeCompanySchema.index(
    {
        collegeId: 1,
        companyId: 1
    },
    {
        unique: true
    }
);


module.exports =
    mongoose.model(
        "CollegeCompany",
        collegeCompanySchema
    );