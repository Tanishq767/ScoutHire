const recruiterName =
    localStorage.getItem("recruiterName");

const companyName =
    localStorage.getItem("companyName");

if(!recruiterName){

    window.location.href = "login.html";

}

document.getElementById("name").textContent =
    recruiterName;

document.getElementById("company").textContent =
    companyName;

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.clear();

    window.location.href = "login.html";

});

document.getElementById("createDrive")
.addEventListener("click", () => {

    window.location.href = "create-drive.html";

});
async function loadDrives(){

    try{

        const response = await fetch("http://localhost:3000/api/drives",{

            headers:{
                "Authorization":"Bearer " + localStorage.getItem("token")
            }

        });

        const drives = await response.json();

        document.getElementById("activeDrives").textContent = drives.length;

        let totalCandidates = 0;

        drives.forEach(drive => {

            if(drive.appliedStudents){

                totalCandidates += drive.appliedStudents.length;

            }

        });

        document.getElementById("totalCandidates").textContent =
        totalCandidates;

        const container = document.getElementById("drivesContainer");

        container.innerHTML = "";

        if(drives.length === 0){

            container.innerHTML = "<p>No recruitment drives yet.</p>";

            return;

        }

        drives.forEach(drive => {

            container.innerHTML += `
                <div class="driveCard" data-id="${drive._id}">
                    <h3>${drive.jobTitle}</h3>
                    <p><b>Package:</b> ${drive.packageLPA} LPA</p>
                    <p><b>Location:</b> ${drive.location}</p>
                    <p><b>Deadline:</b> ${new Date(drive.applicationDeadline).toLocaleDateString()}</p>
                </div>
            `;

        });
        document.querySelectorAll(".driveCard").forEach(card => {

            card.addEventListener("click", () => {

                window.location.href =
                    `drive-details.html?id=${card.dataset.id}`;

            });

        });

    }

    catch(err){

        console.log(err);

    }

}

loadDrives();