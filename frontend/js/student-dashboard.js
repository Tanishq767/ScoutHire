const API_BASE = "/api";

const token = localStorage.getItem("studentToken");

if(!token){
    window.location.href = "student-login.html";
}

async function loadStudent(){

    try{
        const response = await fetch(`${API_BASE}/students/me`,{
            headers:{
                "Authorization":"Bearer " + token
            }
        });

        if(!response.ok){
            localStorage.removeItem("studentToken");
            window.location.href = "student-login.html";
            return;
        }

        const student = await response.json();

        document.getElementById("studentName").textContent =
            student.name;

        document.getElementById("studentInfo").textContent =
            `${student.USN} • ${student.Branch} • CGPA ${student.CGPA}`;

        document.getElementById("appliedCount").textContent =
            student.appliedDrives.length;

    }
    catch(err){
        console.log(err);
    }
}

async function loadEligibleDrives(){

    try{
        const response = await fetch(
            `${API_BASE}/students/eligible-drives`,
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );

        const drives = await response.json();

        document.getElementById("eligibleCount").textContent =
            drives.length;

        const container =
            document.getElementById("drivesContainer");

        container.innerHTML = "";

        if(drives.length === 0){
            container.innerHTML =
                `<p class="empty">No eligible recruitment drives currently.</p>`;
            return;
        }

        drives.forEach(drive => {

            const alreadyApplied =
                drive.appliedStudents.some(
                    studentId =>
                        String(studentId) ===
                        String(localStorage.getItem("studentId"))
                );

            container.innerHTML += `
                <div class="driveCard">

                    <h3>${drive.companyName} - ${drive.jobTitle}</h3>

                    <p>
                        <b>Package:</b>
                        ${drive.packageLPA} LPA
                    </p>

                    <p>
                        <b>Location:</b>
                        ${drive.location}
                    </p>

                    <p>
                        <b>Minimum CGPA:</b>
                        ${drive.minimumCGPA}
                    </p>

                    <p>
                        <b>Deadline:</b>
                        ${new Date(
                            drive.applicationDeadline
                        ).toLocaleDateString()}
                    </p>

                    <button
                        class="applyBtn"
                        onclick="applyDrive('${drive._id}')"
                        ${alreadyApplied ? "disabled" : ""}
                    >
                        ${alreadyApplied ? "Applied" : "Apply"}
                    </button>

                </div>
            `;
        });

    }
    catch(err){
        console.log(err);
    }
}

async function applyDrive(driveId){

    try{

        const response = await fetch(
            `${API_BASE}/students/apply/${driveId}`,
            {
                method:"POST",
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );

        const data = await response.json();

        alert(data.message);

        if(response.ok){
            loadStudent();
            loadEligibleDrives();
        }

    }
    catch(err){
        console.log(err);
    }
}

document.getElementById("logoutBtn").addEventListener(
    "click",
    () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentName");
        localStorage.removeItem("studentUSN");
        localStorage.removeItem("studentBranch");
        localStorage.removeItem("studentEmail");
        localStorage.removeItem("studentId");

        window.location.href = "student-login.html";
    }
);

loadStudent();
loadEligibleDrives();
