const Joi = require('joi');

function validateStudent(req, res, next){

    const schema = Joi.object({

        name: Joi.string().min(3).max(30).required(),

        USN: Joi.string().required(),

        birthdate: Joi.date().required(),

        email: Joi.string().email().required(),

        phone: Joi.string().pattern(/^\d{10}$/).length(10).required(),

        branch: Joi.string().required(),

        year: Joi.number().required(),

        CGPA: Joi.number().min(0).max(10).required(),

        skills: Joi.array().items(Joi.string()).default([]),

        CPRating: Joi.array().items(
            Joi.object({
                platform: Joi.string().required(),
                rating: Joi.number().required()
            })
        ).default([]),

        projects: Joi.array().items(
            Joi.object({
                title: Joi.string().required(),
                domain: Joi.string().required(),
                complexity: Joi.string().valid("basic","intermediate","advanced").required()
            })
        ).default([]),

        internships: Joi.array().items(
            Joi.object({
                role: Joi.string().required(),
                company: Joi.string().required(),
                domain: Joi.string().required()
            })
        ).default([]),

        resumeURL: Joi.string().uri().required()

    });

    const { error } = schema.validate(req.body); //schema.validate(req.body) returns an object, usually stuff like value, error, etc enclosed inside a {} and we do validation only for specific routes, particularly those which create a student

    if(error){
        return res.status(400).send(error.details[0].message) //details is an error and usually has multiple error but joi validation stops at 1st error again usually, so we return only the first error be it password/email whatever
    }

    next(); //done here, move to the next middleware or route handler
}

module.exports = validateStudent;