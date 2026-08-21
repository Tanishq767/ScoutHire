const mongoose = require('mongoose')

const recruiterSchema = new mongoose.Schema({
    recruiterName : {type : String, required : true},
    companyName : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    password : {type: String, required : true},
    verified: {type: Boolean, default: false},
    verificationToken: {type: String, default: null},
    verificationTokenExpiry: {type: Date, default: null},
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null},
})

const Recruiter = mongoose.model('Recruiter', recruiterSchema)

module.exports = Recruiter
