const bcrypt = require('bcrypt')
const crypto = require('crypto')
const Recruiter = require('../models/recruiterModel')
const jwt = require('jsonwebtoken')
const { date } = require('joi')

const registerRecruiter = async(req, res) => {

    try{
        const {recruiterName, companyName, email, password} = req.body

        const existingRecruiter = await Recruiter.findOne({email})

        const hashedPassword = bcrypt.hash(password, 10)

        const verificationToken = crypto.randomBytes(32).toString("hex")

        const verificationTokenExpiry = new Date(
            Date.now() + 30*60*1000
        )
        
        if(existingRecruiter){

            if(existingRecruiter.verified){
                return res.status(400).send("Recruiter already exists")
            }
            if(existingRecruiter.verificationTokenExpiry < Date.now()){
                return res.status(400).send("Verification link expired")
            }
            
            existingRecruiter.recruiterName = recruiterName
            existingRecruiter.companyName = companyName
            existingRecruiter.email = email
            existingRecruiter.password = hashedPassword

            await existingRecruiter.save()

            await sendVerificationEmail(email, verificationToken)

            return res.status(200).send("Registration successful! verification email sent.")
        }

        const newRecruiter = new Recruiter({
            recruiterName,
            companyName,
            email,
            password: hashedPassword,
            verificationToken
        })

        await newRecruiter.save()

        await sendVerificationEmail(email, verificationToken)

        res.status(201).send(
            "Registeration successful! Please verify your email."
        )
    }
    catch(err){
        return res.status(500).send("err.message")
    }
}

const verifyRecruiter = async(req, res) => {
    try{
        const token = req.params.token

        const recruiter = await Recruiter.findOne({verificationToken : token})

        if(!recruiter){
            return res.status(400).send("Invalid or expired token!")
        }
        if(recruiter.verificationTokenExpiry < Date.now()){
            return res.status(400).send("Verification link expired")
        }

        recruiter.verified = True
        recruiter.verificationToken = null
        recruiter.verificationTokenExpiry = null

        await recruiter.save()
        return res.status(200).send("Email verified successfully!")
    }
    catch(err){
        res.status(500).send(err.message)
    }
}

const loginRecruiter = async(req, res) => {
    try{
        const {email, password} = req.body
        
        const recruiter = await Recruiter.findOne({email})

        if(!recruiter){
            return res.status(404).send("Recruiter not found.")
        }
        if(!recruiter.verified){
            return res.status(403).send("Please verify your account first.")
        }
        const isMatch = await bcrypt.compare(password, recruiter.password)

        if(!isMatch){
            return res.status(401).send("Invalid credentials")
        }

        const token = jwt.sign(
            {id : recruiter._id},
            process.env.JWT_SECRET,
            {expiresIn : "7d"}
        )
        res.status(200).send({
            message: "Login successful",
            token
        })

    }
    catch(err){
        return res.status(500).send(err.message)
    }
}   

module.exports = {
    registerRecruiter,
    verifyRecruiter,
    loginRecruiter
}