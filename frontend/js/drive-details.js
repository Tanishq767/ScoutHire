const API_BASE = "http://localhost:3000/api";

const params = new URLSearchParams(window.location.search);

const driveId = params.get("id");

if(!driveId){

    alert("Invalid Drive.");

    window.location.href = "dashboard.html";

}

async function loadDrive(){

    try{

        const response = await fetch(`${API_BASE}/drives/${driveId}`,{

            headers:{
                "Authorization":"Bearer " + localStorage.getItem("token")
            }

        });

        const drive = await response.json();

        if(!response.ok){

            alert(drive.message);

            window.location.href = "dashboard.html";

            return;

        }

        document.getElementById("jobTitle").textContent = drive.jobTitle;

        document.getElementById("companyName").textContent = drive.companyName;

        document.getElementById("package").textContent = drive.packageLPA + " LPA";

        document.getElementById("location").textContent = drive.location;

        document.getElementById("cgpa").textContent = drive.minimumCGPA;

        document.getElementById("deadline").textContent =
        new Date(drive.applicationDeadline).toLocaleDateString();

        document.getElementById("description").textContent =
        drive.jobDescription;

        const branches = document.getElementById("branches");

        drive.eligibleBranches.forEach(branch => {

            branches.innerHTML += `<li>${branch}</li>`;

        });

        const skills = document.getElementById("skills");

        drive.requiredSkills.forEach(skill => {

            skills.innerHTML += `<li>${skill}</li>`;

        });

    }

    catch(err){

        console.log(err);

        alert("Unable to load drive.");

    }

}

loadDrive();

document.getElementById("eligibleBtn").addEventListener("click", () => {

    window.location.href =
    `eligible-students.html?id=${driveId}`;

});