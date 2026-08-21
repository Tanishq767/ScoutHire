const API_BASE =
    "http://localhost:3000/api";

const token =
    localStorage.getItem("collegeToken");


if(!token){

    window.location.href =
        "college-login.html";

}


let students = [];


const authHeaders = {

    "Authorization":
        "Bearer " + token

};


async function loadStudents(){

    try{

        const response =
            await fetch(
                `${API_BASE}/colleges/students`,
                {
                    headers:
                        authHeaders
                }
            );


        const data =
            await response.json();


        if(!response.ok){

            alert(
                data.message ||
                "Unable to load students."
            );

            return;

        }


        students = data;

        document.getElementById(
            "studentSummary"
        ).textContent =
            `${students.length} students associated with your college.`;


        renderStudents(students);

    }
    catch(err){

        console.log(err);

        document.getElementById(
            "studentList"
        ).innerHTML = `
            <p class="loading">
                Unable to load students.
            </p>
        `;

    }

}


function renderStudents(list){

    const container =
        document.getElementById(
            "studentList"
        );


    container.innerHTML = "";


    if(list.length === 0){

        container.innerHTML = `
            <p class="loading">
                No students found.
            </p>
        `;

        return;

    }


    container.innerHTML = `

        <div class="studentRow header">

            <span>
                Student
            </span>

            <span>
                USN
            </span>

            <span>
                Branch
            </span>

            <span>
                CGPA
            </span>

            <span>
                Year
            </span>

        </div>

    `;


    list.forEach(student => {

        container.innerHTML += `

            <div class="studentRow">

                <div>

                    <div class="studentName">
                        ${student.name || "-"}
                    </div>

                    <div class="studentEmail">
                        ${student.email || "-"}
                    </div>

                </div>

                <span>
                    ${student.USN || "-"}
                </span>

                <span class="branch">
                    ${student.Branch || "-"}
                </span>

                <span class="cgpa">
                    ${student.CGPA ?? "-"}
                </span>

                <span class="year">
                    ${student.year || "-"}
                </span>

            </div>

        `;

    });

}


document.getElementById(
    "searchStudent"
).addEventListener(
    "input",
    (e) => {

        const query =
            e.target.value
                .toLowerCase()
                .trim();


        const filtered =
            students.filter(student => {

                const name =
                    (student.name || "")
                        .toLowerCase();

                const usn =
                    (student.USN || "")
                        .toLowerCase();


                return (
                    name.includes(query) ||
                    usn.includes(query)
                );

            });


        renderStudents(filtered);

    }
);


document.getElementById(
    "uploadForm"
).addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const file =
            document.getElementById(
                "studentFile"
            ).files[0];


        if(!file){

            alert(
                "Please select a CSV file."
            );

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        const button =
            document.getElementById(
                "uploadBtn"
            );


        const message =
            document.getElementById(
                "uploadMessage"
            );


        button.disabled = true;

        button.textContent =
            "Uploading...";

        message.textContent = "";


        try{

            const response =
                await fetch(
                    `${API_BASE}/colleges/students/upload`,
                    {
                        method:"POST",

                        headers:
                            authHeaders,

                        body:
                            formData
                    }
                );


            const data =
                await response.json();


            if(!response.ok){

                message.textContent =
                    data.message ||
                    "Upload failed.";

                return;

            }


            message.textContent =
                `${data.message} ${data.total} records processed.`;


            document.getElementById(
                "studentFile"
            ).value = "";


            await loadStudents();

        }
        catch(err){

            console.log(err);

            message.textContent =
                "Unable to upload student data.";

        }
        finally{

            button.disabled = false;

            button.textContent =
                "Upload Students";

        }

    }
);


document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    (e) => {

        e.preventDefault();

        localStorage.removeItem(
            "collegeToken"
        );

        localStorage.removeItem(
            "college"
        );

        window.location.href =
            "college-login.html";

    }
);


loadStudents();