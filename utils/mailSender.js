const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service : "gmail",

    auth : {
        user : process.env.EMAIL,
        pass : process.env.EMAIL_PW
    }
})

const sendVerificationEmail = async(email, verificationToken) => {
    const verificationLink = `http://localhost:3000/api/recruiters/verify/${verificationToken}`
    transporter.sendMail({
        from : process.env.EMAIL,
        to : email,
        subject: "Verify your Scout Hire account",
        html : `
            <h2> Welcome to Scout Hire </h2>
            <p>Click the link below to verify your account</p>
            <a href = "${verificationLink}"> verification link </a>
        `
    })
}

module.exports = sendVerificationEmail