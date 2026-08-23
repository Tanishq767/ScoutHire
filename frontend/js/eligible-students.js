const API_BASE = "/api";

const params = new URLSearchParams(window.location.search);

const driveId = params.get("id");

if (!driveId) {

    window.location.href = "dashboard.html";

}

async function loadPage() {

    try {

        const token = localStorage.getItem("token");

        const driveResponse = await fetch(

            `${API_BASE}/drives/${driveId}`,

            {

                headers: {
                    "Authorization": "Bearer " + token
                }

            }

        );

        const drive = await driveResponse.json();

        document.getElementById("jobTitle").textContent =
            drive.jobTitle;

        document.getElementById("companyName").textContent =
            drive.companyName;

        const studentResponse = await fetch(

            `${API_BASE}/drives/${driveId}/eligible`,

            {

                headers: {
                    "Authorization": "Bearer " + token
                }

            }

        );

        const students = await studentResponse.json();

        document.getElementById("matchCount").textContent =
            students.length;

        const table =
            document.getElementById("studentTable");

        students.forEach((student, index) => {

            table.innerHTML += `

            <tr>

                <td>

                    <input type="checkbox" class="studentCheck" value="${student.USN}">

                </td>

                <td>

                    ${index + 1}

                </td>
                <td>
                    -
                </td>
                <td>

                    ${student.name}

                </td>

                <td>

                    ${student.USN}

                </td>

                <td>

                    ${student.Branch}

                </td>

                <td>

                    ${student.CGPA}

                </td>

                <td>
                    ${item.student.resumeURL
                    ? `<a
                            href="${student.resumeURL}"
                            target="_blank"
                            class="resumeBtn"
                        >
                            Resume
                        </a>`
                    : `<span class="noResume">Not Uploaded</span>`
                }
                </td>

                <td>

                    <button>

                        View

                    </button>

                </td>

            </tr>

            `;

        });

    }

    catch (err) {

        console.log(err);

    }

}

loadPage();

async function generateRanking() {

    try {

        const token = localStorage.getItem("token");

        const weights = {
            CGPA: Number(document.getElementById("cgpaWeight").value),
            projects: Number(document.getElementById("projectWeight").value),
            CPRating: Number(document.getElementById("cpWeight").value),
            internships: Number(document.getElementById("internshipWeight").value)
        };

        const top = Number(document.getElementById("topStudents").value);

        const response = await fetch(

            `${API_BASE}/drives/${driveId}/rank`,

            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    weights,
                    top
                })
            }
        );

        const rankedStudents = await response.json();

        const table = document.getElementById("studentTable");

        table.innerHTML = "";

        document.getElementById("matchCount").textContent =
            rankedStudents.length;

        rankedStudents.forEach(item => {

            table.innerHTML += `

            <tr>

                <td>
                    <input type="checkbox" class="studentCheck" value="${item.student.USN}">
                </td>

                <td>
                    ${item.rank}
                </td>

                <td>
                    ${(item.score * 100).toFixed(2)}
                </td>

                <td>
                    ${item.student.name}
                </td>

                <td>
                    ${item.student.USN}
                </td>

                <td>
                    ${item.student.Branch}
                </td>

                <td>
                    ${item.student.CGPA}
                </td>

                <td>
                    ${
                        item.student.resumeURL
                        ? `<a
                            href="${item.student.resumeURL}"
                            target="_blank"
                            class="resumeBtn"
                        >
                            Resume
                        </a>`
                        : `<span class="noResume">Not Uploaded</span>`
                    }
                </td>

                <td>
                    <button
                        class="viewBtn"
                        onclick="viewStudent('${item.student.USN}')">
                        View
                    </button>
                </td>
            </tr>
            `;
        });
    }

    catch (err) {
        console.log(err);
    }
}

async function shortlistStudents() {

    const selected = [];

    document.querySelectorAll(".studentCheck:checked")
        .forEach(box => {
            selected.push(box.value);
        });

    if (selected.length === 0) {
        alert("Please select at least one student.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/drives/${driveId}/shortlist`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    students: selected
                })
            }
        );
        const data = await response.json();
        alert(data.message);
    }

    catch (err) {
        console.log(err);
    }
}

async function sendOAEmails() {
    console.log("Send OA clicked");
    try {
        const response = await fetch(
            `${API_BASE}/drives/${driveId}/send-oa`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            }
        );
        const data = await response.json();
        alert(data.message);
    }

    catch (err) {
        console.log(err);
    }

}

async function searchStudent(){

    try{

        const name = document.getElementById("search").value.trim();

        if(name === ""){
            loadPage();
            return;
        }

        const response = await fetch(
            `${API_BASE}/students/searchStudent/${encodeURIComponent(name)}`,
            {
                method:"GET",
                headers:{
                    "Authorization":"Bearer " + localStorage.getItem("token")
                }
            }
        );

        const student = await response.json();

        if(!response.ok){
            alert(student.message || "Student not found.");
            return;
        }

        const table = document.getElementById("studentTable");

        table.innerHTML = `
            <tr>

                <td>
                    <input
                        type="checkbox"
                        class="studentCheck"
                        value="${student.USN}"
                    >
                </td>

                <td>
                    1
                </td>

                <td>
                    -
                </td>

                <td>
                    ${student.name}
                </td>

                <td>
                    ${student.USN}
                </td>

                <td>
                    ${student.Branch}
                </td>

                <td>
                    ${student.CGPA}
                </td>

                <td>
                    ${
                        student.resumeURL
                        ? `<a
                            href="${student.resumeURL}"
                            target="_blank"
                            class="resumeBtn"
                        >
                            Resume
                        </a>`
                        : `<span class="noResume">
                            Not Uploaded
                        </span>`
                    }
                </td>

                <td>
                    <button
                        class="viewBtn"
                        onclick="viewStudent('${student.USN}')">
                        View
                    </button>
                </td>

            </tr>
        `;

        document.getElementById("matchCount").textContent = 1;

    }
    catch(err){

        console.log(err);

    }

}

function viewStudent(usn){
    window.location.href =
        `student-details.html?usn=${encodeURIComponent(usn)}`;
}

document.getElementById("rankBtn").addEventListener("click", generateRanking);

document.getElementById("shortlistBtn").addEventListener("click", shortlistStudents);

document.getElementById("selectAll").addEventListener("change", function () {
    document.querySelectorAll(".studentCheck")
        .forEach(box => {
            box.checked = this.checked;
        });
});
document.getElementById("sendOABtn").addEventListener("click", sendOAEmails);

document.getElementById("search").addEventListener("keydown", function(e){

    if(e.key === "Enter"){
        searchStudent();
    }

});

