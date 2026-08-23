const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary, isCloudinaryEnabled } = require("../utils/cloudinary");

const storage = isCloudinaryEnabled
    ? new CloudinaryStorage({
        cloudinary,
        params: {
            folder: "scouthire/resumes",
            resource_type: "raw",
            public_id: () => `resume-${Date.now()}`
        }
    })
    : multer.diskStorage({
        destination: "uploads/resumes/"
    });

const resumeUpload = multer({
    storage,
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
