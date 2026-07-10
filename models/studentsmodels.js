const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name : {type : String, required : true, minlength: 3, maxlength: 30},
    USN : {type : String, required : true, unique : true},
    birthdate : {type : Date, required : true},
    email : {type: String, required : true, match : /.+\@.+\..+/},
    phone : {type : String, required : true, minlength : 10, maxlength : 10},
    Branch : {type : String, required : true},
    year: {type: Number, required: true},
    CGPA : {type : Number, required : true},
    projects : [
        {
            title : String,
            domain : String,
            complexity : String,
        }
    ],
    skills : [String],
    CPRating : [
        {
            platform: String,
            rating : Number
        }
    ],
    internships: [
        {
            role: String,
            company: String,  
            domain: String    
        }
    ],
    resumeURL : {type : String, required : true},
    OAResults: [
        {
            company: String,
            score: Number
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
    }
})

const Student = new mongoose.model('Student', studentSchema) 

module.exports = Student