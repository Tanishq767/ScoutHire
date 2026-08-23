const API = "/api/students/register";

async function registerStudent() {

    const USN = document.getElementById("usn").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    const response = await fetch(API, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            USN,

            email,

            password

        })

    });

    const data = await response.json();

    alert(data.message);

    if (response.ok) {

        window.location = "student-login.html";

    }

}
