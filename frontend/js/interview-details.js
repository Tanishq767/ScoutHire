const API_BASE = "http://localhost:3000/api";

let interviewDetailsSaved = false;

const params =
    new URLSearchParams(window.location.search);

const driveId =
    params.get("id");

const token =
    localStorage.getItem("token");


if(!token){

    window.location.href =
        "login.html";

}


if(!driveId){

    alert("Invalid Drive.");

    window.location.href =
        "recruitment-drives.html";

}


async function loadCandidates(){

    try{

        const response =
            await fetch(
                `${API_BASE}/drives/${driveId}/interview-candidates`,
                {
                    headers:{
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const students =
            await response.json();

        if(!response.ok){

            alert(
                students.message ||
                "Unable to load candidates."
            );

            return;
        }

        document.getElementById(
            "candidateCount"
        ).textContent =
            students.length;

        const container =
            document.getElementById(
                "candidateList"
            );

        container.innerHTML = "";

        if(students.length === 0){

            container.innerHTML = `
                <p class="loading">
                    No candidates selected.
                </p>
            `;

            return;
        }

        students.forEach(student => {

            container.innerHTML += `

                <div class="candidate">

                    <strong>
                        ${student.name}
                    </strong>

                    <span>
                        ${student.USN}
                    </span>

                    <span>
                        ${student.email}
                    </span>

                </div>

            `;

        });

    }
    catch(err){

        console.log(err);

        alert(
            "Unable to load candidates."
        );

    }

}


async function loadInterviewStatus(){

    try{

        const response =
            await fetch(
                `${API_BASE}/drives/${driveId}`,
                {
                    headers:{
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const drive =
            await response.json();

        if(!response.ok){

            return;

        }

        const button =
            document.getElementById(
                "sendInvitationsBtn"
            );


        if(
            drive.interviewDetails &&
            drive.interviewDetails.date &&
            drive.interviewDetails.time &&
            drive.interviewDetails.location
        ){

            interviewDetailsSaved = true;

            if(drive.interviewEmailsSent){

                button.disabled = true;

                button.textContent =
                    "✓ Invitations Sent";

            }
            else{

                button.disabled = false;

            }

        }

    }
    catch(err){

        console.log(err);

    }

}


document.getElementById(
    "interviewForm"
).addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const date =
            document.getElementById(
                "interviewDate"
            ).value;


        const time =
            document.getElementById(
                "interviewTime"
            ).value;


        const location =
            document.getElementById(
                "location"
            ).value.trim();


        const instructions =
            document.getElementById(
                "instructions"
            ).value.trim();


        const requiredDocuments =
            Array.from(
                document.querySelectorAll(
                    'input[name="documents"]:checked'
                )
            ).map(
                checkbox =>
                    checkbox.value
            );


        try{

            const response =
                await fetch(
                    `${API_BASE}/drives/${driveId}/interview-details`,
                    {
                        method:"POST",

                        headers:{

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token

                        },

                        body:JSON.stringify({

                            date,

                            time,

                            location,

                            requiredDocuments,

                            additionalInstructions:
                                instructions

                        })

                    }
                );


            const data =
                await response.json();


            if(!response.ok){

                alert(
                    data.message ||
                    "Unable to save interview details."
                );

                return;

            }


            interviewDetailsSaved = true;


            document.getElementById(
                "sendInvitationsBtn"
            ).disabled = false;


            alert(
                "Interview details saved successfully!"
            );

        }
        catch(err){

            console.log(err);

            alert(
                "Unable to save interview details."
            );

        }

    }
);


document.getElementById(
    "sendInvitationsBtn"
).addEventListener(
    "click",
    async () => {

        if(!interviewDetailsSaved){

            alert(
                "Please save interview details first."
            );

            return;

        }


        const confirmed =
            confirm(
                "Are you sure you want to send interview invitations to all selected candidates?"
            );


        if(!confirmed){

            return;

        }


        const button =
            document.getElementById(
                "sendInvitationsBtn"
            );


        button.disabled = true;

        button.textContent =
            "Sending Invitations...";


        try{

            const response =
                await fetch(
                    `${API_BASE}/drives/${driveId}/send-interview-invitations`,
                    {
                        method:"POST",

                        headers:{
                            "Authorization":
                                "Bearer " + token
                        }
                    }
                );


            const data =
                await response.json();


            if(!response.ok){

                alert(
                    data.message ||
                    "Unable to send interview invitations."
                );

                button.disabled = false;

                button.textContent =
                    "✉ Send Interview Invitations";

                return;

            }


            alert(
                `${data.message}\n\n` +
                `Invitations sent: ${data.totalSent}`
            );


            button.textContent =
                "✓ Invitations Sent";

            button.disabled = true;

        }
        catch(err){

            console.log(err);

            alert(
                "Unable to send interview invitations."
            );


            button.disabled = false;

            button.textContent =
                "✉ Send Interview Invitations";

        }

    }
);


document.getElementById(
    "backBtn"
).addEventListener(
    "click",
    () => {

        window.location.href =
            `oa-results.html?id=${driveId}`;

    }
);


document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    () => {

        localStorage.clear();

        window.location.href =
            "login.html";

    }
);


loadCandidates();

loadInterviewStatus();