const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({

    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    website: {
        type: String,
        default: ""
    },

    country: {
        type: String,
        default: "India"
    },

    registrationNumber: {
        type: String,
        default: ""
    },

    verificationStatus: {
        type: String,
        enum: [
            "Pending",
            "Verified",
            "Rejected"
        ],
        default: "Pending"
    },

    verified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

const Company =
    mongoose.model("Company", companySchema);

module.exports = Company;