const driveForm = document.getElementById("driveForm");
const API_BASE = "/api";

async function loadApprovedColleges() {

    try {

        const response =
            await fetch(
                `${API_BASE}/companies/approved-colleges`,
                {
                    headers: {
                        "Authorization":
                            "Bearer " +
                            localStorage.getItem("token")
                    }
                }
            );


        const colleges =
            await response.json();


        const container =
            document.getElementById(
                "collegeList"
            );


        if (!response.ok) {

            container.innerHTML = `
                <p>
                    ${colleges.message ||
                "Unable to load colleges."}
                </p>
            `;

            return;

        }


        container.innerHTML = "";


        if (colleges.length === 0) {

            container.innerHTML = `
                <p>
                    No colleges have approved your company yet.
                </p>
            `;

            return;

        }


        colleges.forEach(college => {

            container.innerHTML += `

                <label class="collegeOption">

                    <input
                        type="checkbox"
                        name="targetColleges"
                        value="${college._id}"
                    >

                    <div>

                        <div class="collegeName">
                            ${college.collegeName}
                        </div>

                        <div class="collegeCode">
                            ${college.collegeCode}
                            ${college.location
                    ? " • " + college.location
                    : ""}
                        </div>

                    </div>

                </label>

            `;

        });

    }
    catch (err) {

        console.log(err);

        document.getElementById(
            "collegeList"
        ).innerHTML = `
            <p>
                Unable to load approved colleges.
            </p>
        `;

    }

}


loadApprovedColleges();

driveForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const jobTitle = document.getElementById("jobTitle").value.trim();
    const packageLPA = Number(document.getElementById("package").value);
    const location = document.getElementById("location").value.trim();
    const minimumCGPA = Number(document.getElementById("minimumCGPA").value);
    const applicationDeadline = document.getElementById("deadline").value;
    const jobDescription = document.getElementById("description").value.trim();

    const requiredSkills = document.getElementById("skills").value.split(",").map(skill => skill.trim()).filter(skill => skill !== "");

    const eligibleBranches = [];

    const targetColleges =
        Array.from(
            document.querySelectorAll(
                'input[name="targetColleges"]:checked'
            )
        ).map(
            checkbox =>
                checkbox.value
        );


    if (targetColleges.length === 0) {

        alert(
            "Please select at least one college."
        );

        return;

    }

    document.querySelectorAll(".branch:checked").forEach(branch => {
        eligibleBranches.push(branch.value);
    });

    try {

        const response = await fetch(`${API_BASE}/drives`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },

            body: JSON.stringify({

                jobTitle,
                packageLPA,
                location,
                minimumCGPA,
                eligibleBranches,
                requiredSkills,
                applicationDeadline,
                jobDescription,
                targetColleges

            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;

        }

        alert("Drive created successfully!");

        window.location.href = "dashboard.html";

    }

    catch (err) {

        console.log(err);

        alert("Unable to connect to server.");

    }

});
