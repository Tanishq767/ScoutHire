const recruiterName = localStorage.getItem("recruiterName");
const companyName = localStorage.getItem("companyName");

document.getElementById("name").textContent =
    recruiterName;

document.getElementById("company").textContent =
    companyName;

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.clear();

    window.location.href = "login.html";

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
        let shortlisted = 0;
        let oaSent = 0;
        let openDrives = 0;
        let closedDrives = 0;

        drives.forEach(drive => {

            totalCandidates += drive.appliedStudents.length;

            shortlisted += drive.shortlistedStudents.length;

            if(drive.oaSent){
                oaSent += drive.shortlistedStudents.length;
            }

            if(drive.status === "Open"){
                openDrives++;
            } else {
                closedDrives++;
            }

        });

        document.getElementById("totalCandidates").textContent = shortlisted;
        document.getElementById("shortlistedCount").textContent = shortlisted;
        document.getElementById("oaSentCount").textContent = oaSent;
        document.getElementById("openDriveCount").textContent = openDrives;
        document.getElementById("closedDriveCount").textContent = closedDrives;

    }
    catch(err){
        console.log(err);
    }
}

document.getElementById("createDrive").addEventListener("click", () => {
    window.location.href = "create-drive.html";
});

loadDrives();