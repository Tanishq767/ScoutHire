const API_BASE =
    "http://localhost:3000/api";

const token =
    localStorage.getItem("collegeToken");


if(!token){

    window.location.href =
        "college-login.html";

}


let drives = [];


async function loadDrives(){

    try{

        const response =
            await fetch(
                `${API_BASE}/colleges/drives`,
                {
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
                "Unable to load drives."
            );

            return;

        }


        drives = data;

        renderDrives(drives);

    }
    catch(err){

        console.log(err);

        document.getElementById(
            "driveList"
        ).innerHTML = `
            <p class="loading">
                Unable to load recruitment drives.
            </p>
        `;

    }

}


function renderDrives(list){

    const container =
        document.getElementById(
            "driveList"
        );


    container.innerHTML = "";


    if(list.length === 0){

        container.innerHTML = `
            <p class="loading">
                No recruitment drives found.
            </p>
        `;

        return;

    }


    list.forEach(drive => {

        const status =
            drive.collegeStatus ||
            "Pending";


        const approved =
            status === "Approved";


        container.innerHTML += `

            <div class="driveCard">

                <h2>
                    ${drive.jobTitle || "Recruitment Drive"}
                </h2>

                <div class="companyName">
                    ${drive.companyName || "Company"}
                </div>

                <div class="driveInfo">

                    <span>
                        Package:
                        ${drive.packageLPA || "-"} LPA
                    </span>

                    <span>
                        Location:
                        ${drive.location || "-"}
                    </span>

                    <span>
                        Minimum CGPA:
                        ${drive.minimumCGPA ?? "-"}
                    </span>

                </div>

                <span class="status ${status.toLowerCase()}">
                    ${approved ? "✓ Approved" : status}
                </span>

                <button
                    class="approveBtn"
                    data-id="${drive._id}"
                    ${approved ? "disabled" : ""}>

                    ${
                        approved
                        ?
                        "Drive Approved"
                        :
                        "Approve Drive"
                    }

                </button>

            </div>

        `;

    });


    document
        .querySelectorAll(".approveBtn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => approveDrive(
                    button.dataset.id,
                    button
                )
            );

        });

}


async function approveDrive(
    driveId,
    button
){

    const confirmed =
        confirm(
            "Approve this recruitment drive for your students?"
        );


    if(!confirmed){
        return;
    }


    button.disabled = true;

    button.textContent =
        "Approving...";


    try{

        const response =
            await fetch(
                `${API_BASE}/colleges/drives/${driveId}/approve`,
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
                "Unable to approve drive."
            );

            button.disabled = false;

            button.textContent =
                "Approve Drive";

            return;

        }


        alert(
            "Recruitment drive approved successfully."
        );


        loadDrives();

    }
    catch(err){

        console.log(err);

        alert(
            "Unable to approve recruitment drive."
        );

        button.disabled = false;

        button.textContent =
            "Approve Drive";

    }

}


document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    (e) => {

        e.preventDefault();

        localStorage.removeItem(
            "collegeToken"
        );

        localStorage.removeItem(
            "college"
        );

        window.location.href =
            "college-login.html";

    }
);


loadDrives();