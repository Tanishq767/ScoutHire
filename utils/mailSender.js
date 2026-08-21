const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service : "gmail",

    pool: true,
    maxConnections: 1,
    maxMessages: 100,

    auth : {
        user : process.env.EMAIL,
        pass : process.env.EMAIL_PW
    }
})

const sendVerificationEmail = async(email, verificationToken, userType) => {
    const verificationLink = `http://localhost:3000/api/${userType}/verify/${verificationToken}`
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

const sendInterviewEmail = async ({
    email,
    studentName,
    companyName,
    jobTitle,
    interviewDate,
    interviewTime,
    location,
    requiredDocuments,
    additionalInstructions
}) => {

    const documents = requiredDocuments &&
        requiredDocuments.length > 0
        ? requiredDocuments
            .map(document => `<li>${document}</li>`)
            .join("")
        : "<li>No specific documents mentioned</li>";


    const formattedDate =
        new Date(interviewDate)
            .toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });


    const mailOptions = {

        from: `"ScoutHire" <${process.env.EMAIL_USER}>`,

        to: email,

        subject:
            `Interview Invitation - ${jobTitle}`,

        html: `

            <div style="
                font-family: Arial, sans-serif;
                max-width: 650px;
                margin: auto;
                padding: 30px;
                color: #111827;
                background: #ffffff;
            ">

                <h2 style="
                    color: #4F46E5;
                    margin-bottom: 25px;
                ">
                    ScoutHire
                </h2>


                <p>
                    Dear ${studentName},
                </p>


                <p style="
                    line-height: 1.7;
                ">

                    Congratulations! You have been shortlisted
                    for the interview stage of the recruitment
                    process for the

                    <strong>
                        ${jobTitle}
                    </strong>

                    position at

                    <strong>
                        ${companyName}
                    </strong>.

                </p>


                <h3 style="
                    color: #111827;
                    margin-top: 30px;
                ">
                    Interview Details
                </h3>


                <div style="
                    background: #F5F3FF;
                    padding: 20px;
                    border-radius: 10px;
                    line-height: 2;
                ">

                    <strong>Date:</strong>
                    ${formattedDate}
                    <br>

                    <strong>Time:</strong>
                    ${interviewTime}
                    <br>

                    <strong>Location:</strong>
                    ${location}

                </div>


                <h3 style="
                    margin-top: 30px;
                ">
                    Required Documents
                </h3>


                <ul style="
                    line-height: 1.9;
                ">

                    ${documents}

                </ul>


                ${
                    additionalInstructions
                    ? `

                        <h3 style="
                            margin-top: 30px;
                        ">
                            Additional Instructions
                        </h3>

                        <p style="
                            background:#F9FAFB;
                            padding:15px;
                            border-radius:8px;
                            line-height:1.7;
                        ">

                            ${additionalInstructions}

                        </p>

                    `
                    : ""
                }


                <p style="
                    margin-top: 30px;
                    line-height: 1.7;
                ">

                    Please make sure you are available at the
                    specified time and bring all the required
                    documents.

                </p>


                <p style="
                    margin-top: 30px;
                ">

                    Best regards,<br>

                    <strong>
                        ScoutHire Recruitment Team
                    </strong>

                </p>

            </div>

        `
    };


    await transporter.sendMail(mailOptions);

};

module.exports = {
    sendVerificationEmail,
    sendOAEmail,
    sendInterviewEmail
}