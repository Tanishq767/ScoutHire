const registerForm = document.getElementById("registerForm");
const API_BASE = "http://localhost:3000/api";

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const companyName = document.getElementById("companyName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if(password !== confirmPassword){
        alert("Passwords do not match.");
        return;
    }

    try{

        const response = await fetch(
            `${API_BASE}/recruiters/register`,
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    recruiterName : username,
                    companyName,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if(!response.ok){

            alert(data.message || "Registration failed.");

            return;

        }

        sessionStorage.setItem(
            "verificationEmail",
            email
        );

        window.location.href="verify-email.html";

    }

    catch(err){

        console.error(err);

        alert("Could not connect to server.");

    }

});