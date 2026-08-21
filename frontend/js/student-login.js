const API = "http://localhost:3000/api/students/login";

async function loginStudent() {

    const USN = document.getElementById("usn").value;

    const password = document.getElementById("password").value;

    const response = await fetch(API, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            USN,

            password

        })

    });

    const data = await response.json();

    if (!response.ok) {

        alert(data.message);

        return;

    }

    localStorage.setItem(

        "studentToken",

        data.token

    );

    localStorage.setItem(
        "studentId",
        data.student.id
    );

    localStorage.setItem(

        "studentName",

        data.student.name

    );

    localStorage.setItem(

        "studentUSN",

        data.student.USN

    );

    localStorage.setItem(

        "studentBranch",

        data.student.Branch

    );

    localStorage.setItem(

        "studentEmail",

        data.student.email

    );

    window.location = "student-dashboard.html";

}