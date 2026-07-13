const recruiterName = localStorage.getItem("recruiterName");
const companyName = localStorage.getItem("companyName");

if (!recruiterName) {
    window.location.href = "login.html";
}

async function loadDrives(){

    try{
        const response = await fetch("http://localhost:3000/api/drives",{
            headers:{
                "Authorization":"Bearer " + localStorage.getItem("token")
            }
        });

        const drives = await response.json();

        const container = document.getElementById("drivesContainer");

        container.innerHTML = "";
        if(drives.length === 0){
            container.innerHTML = "<p>No recruitment drives yet.</p>";
            return;
        }

        drives.forEach(drive => {
            container.innerHTML += `
            <div class="driveCard" data-id="${drive._id}">
                <h3>${drive.companyName}</h3>
                <p><b>Role:</b> ${drive.jobTitle}</p>
                <p><b>Package:</b> ${drive.packageLPA} LPA</p>
                <p><b>Location:</b> ${drive.location}</p>
                <p><b>Applicants:</b> ${(drive.appliedStudents || []).length}</p>
                <p><b>Status:</b> ${drive.status}</p>
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

document.getElementById("createDrive").addEventListener("click", () => {
    window.location.href = "create-drive.html";
});

loadDrives();