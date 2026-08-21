const multer = require("multer");

const resumeUpload = multer({
    dest: "uploads/resumes/",
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype !== "application/pdf"){
            return cb(new Error("Only PDF resumes are allowed."));
        }

        cb(null, true);
    }
});

module.exports = resumeUpload;