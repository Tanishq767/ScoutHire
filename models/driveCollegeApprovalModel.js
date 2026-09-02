const mongoose = require("mongoose");

const driveCollegeApprovalSchema =
    new mongoose.Schema({

        driveId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref:
                "Drive",

            required:true

        },

        collegeId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref:
                "College",

            required:true

        },

        status: {

            type:String,

            enum:[
                "Pending",
                "Approved",
                "Rejected"
            ],

            default:"Pending"

        },

        approvedAt: {
            type:Date,
            default:null
        }

    },{
        timestamps:true
    });


driveCollegeApprovalSchema.index(
    {
        driveId:1,
        collegeId:1
    },
    {
        unique:true
    }
);


const DriveCollegeApproval =
    mongoose.model(
        "DriveCollegeApproval",
        driveCollegeApprovalSchema
    );


module.exports =
    DriveCollegeApproval;