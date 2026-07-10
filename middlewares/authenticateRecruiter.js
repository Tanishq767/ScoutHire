const jwt = require("jsonwebtoken");
const Recruiter = require("../models/recruiterModel");

const authenticateRecruiter = async (req, res, next) => {

    try{

        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){

            return res.status(401).json({
                message: "Access denied."
            });

        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const recruiter = await Recruiter.findById(decoded.id);

        if(!recruiter){

            return res.status(404).json({
                message: "Recruiter not found."
            });

        }

        req.recruiter = recruiter;

        next();

    }
    catch(err){

        return res.status(401).json({
            message: "Invalid or expired token."
        });

    }

};

module.exports = authenticateRecruiter;