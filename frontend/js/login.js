const loginForm = document.getElementById("loginForm");

const API_BASE = "http://localhost:3000/api";

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    try{

        const response = await fetch(
            `${API_BASE}/recruiters/login`,
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    email,
                    password
                })

            }
        );

        const data = await response.json();

        if(!response.ok){

            alert(data.message);

            return;

        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "recruiterName",
            data.recruiter.recruiterName
        );

        localStorage.setItem(
            "companyName",
            data.recruiter.companyName
        );

        window.location.href = "dashboard.html";

    }

    catch(err){

        console.error(err);

        alert("Unable to connect to server.");

    }

});