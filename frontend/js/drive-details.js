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

        document.getElementById("applicantCount").textContent = drive.appliedStudents?.length || 0;

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

async function deleteDrive() {

    const confirmDelete = confirm(
        "Are you sure you want to delete this recruitment drive?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/drives/${driveId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }
        );

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            window.location.href = "recruitment-drives.html";
        }

    } catch (err) {
        console.log(err);
    }
}

loadDrive();

document.getElementById("deleteDriveBtn").addEventListener("click", deleteDrive);

document.getElementById("eligibleBtn").addEventListener("click", () => {

    window.location.href =
        `eligible-students.html?id=${driveId}`;

});

document.getElementById("oaResultsBtn").addEventListener("click", () => {

    window.location.href =
        `oa-results.html?id=${driveId}`;

});

document.getElementById("backBtn").addEventListener("click", () => {

    window.location.href = "recruitment-drives.html";

});

document.getElementById("oaResultsBtnBottom").addEventListener("click", () => {

    window.location.href =
        `oa-results.html?id=${driveId}`;

});

document.getElementById("oaUploadForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const file =
        document.getElementById("oaFile").files[0];

    if(!file){

        alert("Please select an OA result CSV file.");

        return;

    }

    const formData = new FormData();

    formData.append("file", file);

    try{

        const response = await fetch(
            `${API_BASE}/drives/${driveId}/upload-oa`,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        "Bearer " +
                        localStorage.getItem("token")
                },

                body: formData
            }
        );

        const text = await response.text();

        console.log("OA UPLOAD STATUS:", response.status);
        console.log("OA UPLOAD RESPONSE:", text);

        let data;

        try {
            data = JSON.parse(text);
        }
        catch {
            alert("Server returned an unexpected error. Check the backend terminal.");
            return;
        }

        if(!response.ok){

            alert(
                data.message ||
                "Unable to upload OA results."
            );

            return;

        }

        alert(
            `OA results uploaded successfully!\n\n` +
            `Updated: ${data.updated}\n` +
            `Skipped: ${data.skipped}`
        );

        window.location.href =
            `oa-results.html?id=${driveId}`;

    }
    catch(err){

        console.error(
            "OA UPLOAD ERROR:",
            err
        );

        alert(
            "Unable to upload OA results."
        );

    }

});