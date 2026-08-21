const API_BASE = "http://localhost:3000/api";

const token = localStorage.getItem("studentToken");

if(!token){
    window.location.href = "student-login.html";
}

async function loadProfile(){

    try{
        const response = await fetch(
            `${API_BASE}/students/me`,
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );

        if(!response.ok){
            localStorage.removeItem("studentToken");
            window.location.href = "student-login.html";
            return;
        }

        const student = await response.json();

        document.getElementById("studentName").textContent =
            student.name;

        document.getElementById("studentUSN").textContent =
            student.USN;

        document.getElementById("studentEmail").textContent =
            student.email;

        document.getElementById("studentBranch").textContent =
            student.Branch;

        document.getElementById("studentCGPA").textContent =
            student.CGPA;

        if(student.resumeURL){

            document.getElementById("resumeStatus").textContent =
                "You have a resume uploaded.";

            const resumeLink =
                document.getElementById("resumeLink");

            resumeLink.href =
                "http://localhost:3000" + student.resumeURL;

            resumeLink.style.display = "inline-block";
        }
    }
    catch(err){
        console.log(err);
    }
}

document.getElementById("resumeForm").addEventListener(
    "submit",
    async function(e){

        e.preventDefault();

        const file =
            document.getElementById("resume").files[0];

        if(!file){
            alert("Please select a resume.");
            return;
        }

        const formData = new FormData();

        formData.append("resume", file);

        try{
            const response = await fetch(
                `${API_BASE}/students/resume`,
                {
                    method:"POST",
                    headers:{
                        "Authorization":"Bearer " + token
                    },
                    body:formData
                }
            );

            const data = await response.json();

            alert(data.message);

            if(response.ok){
                loadProfile();
                document.getElementById("resumeForm").reset();
            }
        }
        catch(err){
            console.log(err);
            alert("Unable to upload resume.");
        }
    }
);

document.getElementById("logoutBtn").addEventListener(
    "click",
    function(){
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentName");
        localStorage.removeItem("studentUSN");
        localStorage.removeItem("studentBranch");
        localStorage.removeItem("studentEmail");
        localStorage.removeItem("studentId");

        window.location.href = "student-login.html";
    }
);

loadProfile();