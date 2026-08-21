const multer = require("multer");

const oaUpload = multer({
    dest: "uploads/oa-results/",
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {

        if(
            file.mimetype !== "text/csv" &&
            !file.originalname.toLowerCase().endsWith(".csv")
        ){
            return cb(
                new Error("Only CSV OA result files are allowed.")
            );
        }

        cb(null, true);
    }
});

module.exports = oaUpload;