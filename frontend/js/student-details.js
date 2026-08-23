const API_BASE = "/api";

const params = new URLSearchParams(
    window.location.search
);

const usn = params.get("usn");

const token =
    localStorage.getItem("token");

if(!token){
    window.location.href = "login.html";
}

if(!usn){
    alert("Invalid student.");
    window.location.href = "eligible-students.html";
}

async function loadStudent(){

    try{

        const response = await fetch(
            `${API_BASE}/students/usn/${encodeURIComponent(usn)}`,
            {
                headers:{
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const student =
            await response.json();

        if(!response.ok){

            alert(
                student.message ||
                "Student not found."
            );

            return;

        }

        renderStudent(student);

    }
    catch(err){

        console.log(err);

        document.getElementById(
            "studentContainer"
        ).innerHTML = `
            <p class="error">
                Unable to load student details.
            </p>
        `;

    }

}

function renderStudent(student){

    const container =
        document.getElementById(
            "studentContainer"
        );

    const skills = student.skills?.length
        ? student.skills.map(skill =>
            `<span class="tag">${skill}</span>`
          ).join("")
        : `<span class="muted">No skills listed</span>`;

    const projects = student.projects?.length
        ? student.projects.map(project => `
            <div class="listItem">

                <h4>
                    ${project.title || "Untitled Project"}
                </h4>

                <p>
                    <b>Domain:</b>
                    ${project.domain || "N/A"}
                </p>

                <p>
                    <b>Complexity:</b>
                    ${project.complexity || "N/A"}
                </p>

            </div>
        `).join("")
        : `<p class="muted">No projects listed.</p>`;

    const internships = student.internships?.length
        ? student.internships.map(internship => `
            <div class="listItem">

                <h4>
                    ${internship.role || "Internship"}
                </h4>

                <p>
                    <b>Company:</b>
                    ${internship.company || "N/A"}
                </p>

                <p>
                    <b>Domain:</b>
                    ${internship.domain || "N/A"}
                </p>

            </div>
        `).join("")
        : `<p class="muted">No internships listed.</p>`;

    const cpRatings = student.CPRating?.length
        ? student.CPRating.map(cp => `
            <div class="ratingItem">

                <span>
                    ${cp.platform}
                </span>

                <strong>
                    ${cp.rating}
                </strong>

            </div>
        `).join("")
        : `<p class="muted">No CP ratings listed.</p>`;

    container.innerHTML = `

        <div class="profileHeader">

            <div>

                <h2>
                    ${student.name}
                </h2>

                <p>
                    ${student.USN}
                </p>

            </div>

            <div class="headerActions">

                ${
                    student.resumeURL
                    ? `
                        <a
                            href="${student.resumeURL}"
                            target="_blank"
                            class="resumeBtn">

                            View Resume

                        </a>
                    `
                    : `
                        <span class="noResume">
                            Resume Not Uploaded
                        </span>
                    `
                }

            </div>

        </div>

        <div class="stats">

            <div class="statCard">

                <span>CGPA</span>

                <strong>
                    ${student.CGPA}
                </strong>

            </div>

            <div class="statCard">

                <span>Branch</span>

                <strong>
                    ${student.Branch}
                </strong>

            </div>

            <div class="statCard">

                <span>Year</span>

                <strong>
                    ${student.year}
                </strong>

            </div>

            <div class="statCard">

                <span>Backlogs</span>

                <strong>
                    ${student.activeBacklogs || 0}
                </strong>

            </div>

        </div>

        <div class="detailsGrid">

            <div class="sectionCard">

                <h3>Contact Information</h3>

                <div class="infoRow">

                    <span>Email</span>

                    <strong>
                        ${student.email}
                    </strong>

                </div>

                <div class="infoRow">

                    <span>Phone</span>

                    <strong>
                        ${student.phone}
                    </strong>

                </div>

            </div>

            <div class="sectionCard">

                <h3>Skills</h3>

                <div class="tags">
                    ${skills}
                </div>

            </div>

            <div class="sectionCard">

                <h3>Projects</h3>

                ${projects}

            </div>

            <div class="sectionCard">

                <h3>Internships</h3>

                ${internships}

            </div>

            <div class="sectionCard">

                <h3>Competitive Programming</h3>

                ${cpRatings}

            </div>

        </div>
    `;
}

document.getElementById("backBtn")
    .addEventListener("click", () => {

        window.history.back();

    });

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.clear();

        window.location.href =
            "login.html";

    });

loadStudent();
