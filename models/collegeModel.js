const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({

    collegeName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },

    collegeCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /.+\@.+\..+/
    },

    password: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    website: {
        type: String,
        default: ""
    },

    contactPerson: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        default: ""
    },

    verified: {
        type: Boolean,
        default: false
    },

    active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

const College = mongoose.model("College", collegeSchema);

module.exports = College;