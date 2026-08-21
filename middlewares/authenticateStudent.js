const jwt = require("jsonwebtoken");
const Student = require("../models/studentsmodels");

const authenticateStudent = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const student = await Student.findById(decoded.id);

        if (!student) {
            return res.status(401).json({
                message: "Student not found."
            });
        }

        req.student = student;

        next();

    }
    catch (err) {

        return res.status(401).json({
            message: "Invalid or expired token."
        });

    }

};

module.exports = authenticateStudent;