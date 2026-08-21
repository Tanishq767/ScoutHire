const jwt = require("jsonwebtoken");

const College =
    require("../models/collegeModel");


const authenticateCollege =
    async (req, res, next) => {

        try {

            const header =
                req.headers.authorization;

            if (
                !header ||
                !header.startsWith("Bearer ")
            ) {

                return res.status(401).json({
                    message:
                        "Authentication required."
                });

            }

            const token =
                header.split(" ")[1];

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

            if (
                !decoded.id ||
                decoded.role !== "college"
            ) {

                return res.status(401).json({
                    message:
                        "Invalid college token."
                });

            }

            const college =
                await College.findById(
                    decoded.id
                );

            if (!college) {

                return res.status(401).json({
                    message:
                        "College not found."
                });

            }

            req.college = college;

            next();

        }
        catch (err) {

            return res.status(401).json({
                message:
                    "Invalid or expired token."
            });

        }

    };


module.exports =
    authenticateCollege;