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
    await transporter.sendMail({
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

const sendOAEmail = async(student, drive) => {

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: student.email,
        
        subject: `${drive.companyName} | Online Assessment Invitation`,
        html: `
        <h2>Congratulations ${student.name}!</h2>
        <p>You have been shortlisted for the <b>Online Assessment</b> round.</p>
        <hr>
        <p><b>Company:</b> ${drive.companyName}</p>
        <p><b>Role:</b> ${drive.jobTitle}</p>
        <p><b>Package:</b> ${drive.packageLPA} LPA</p>
        <p><b>Location:</b> ${drive.location}</p>
        <br>
        <p>Our recruitment team will contact you with the assessment link shortly.</p>
        <p>Best of luck!</p>
        <br>
        <p>${drive.companyName} Recruitment Team</p>
        `
    });
}

module.exports = {
    sendVerificationEmail,
    sendOAEmail
}