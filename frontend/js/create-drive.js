const driveForm = document.getElementById("driveForm");
const API_BASE = "http://localhost:3000/api";

driveForm.addEventListener("submit", async(e) => {

    e.preventDefault();

    const jobTitle = document.getElementById("jobTitle").value.trim();
    const packageLPA = Number(document.getElementById("package").value);
    const location = document.getElementById("location").value.trim();
    const minimumCGPA = Number(document.getElementById("minimumCGPA").value);
    const applicationDeadline = document.getElementById("deadline").value;
    const jobDescription = document.getElementById("description").value.trim();

    const requiredSkills = document
        .getElementById("skills")
        .value
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill !== "");

    const eligibleBranches = [];

    document.querySelectorAll(".branch:checked").forEach(branch => {
        eligibleBranches.push(branch.value);
    });

    try{

        const response = await fetch(`${API_BASE}/drives`,{

            method:"POST",

            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + localStorage.getItem("token")
            },

            body:JSON.stringify({

                jobTitle,
                packageLPA,
                location,
                minimumCGPA,
                eligibleBranches,
                requiredSkills,
                applicationDeadline,
                jobDescription

            })

        });

        const data = await response.json();

        if(!response.ok){

            alert(data.message);

            return;

        }

        alert("Drive created successfully!");

        window.location.href = "dashboard.html";

    }

    catch(err){

        console.log(err);

        alert("Unable to connect to server.");

    }

});