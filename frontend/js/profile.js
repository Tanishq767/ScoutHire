const recruiterName = localStorage.getItem("recruiterName");
const companyName = localStorage.getItem("companyName");
const email = localStorage.getItem("email");

if(!recruiterName){
    window.location.href = "login.html";
}

document.getElementById("recruiterName").textContent = recruiterName;
document.getElementById("companyName").textContent = companyName;
document.getElementById("company").textContent = companyName;
document.getElementById("email").textContent = email;

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.clear();

    window.location.href = "login.html";

});

document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
    if(!confirm("Delete your recruiter account and drives permanently? This cannot be undone.")){
        return;
    }

    const password = prompt("Enter your password to confirm account deletion:");

    if(!password){
        return;
    }

    try{
        const response = await fetch("/api/recruiters/me", {
            method:"DELETE",
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer " + localStorage.getItem("token")
            },
            body:JSON.stringify({ password })
        });

        const data = await response.json();

        if(!response.ok){
            alert(data.message || "Unable to delete account.");
            return;
        }

        localStorage.clear();
        window.location.href = "login.html";
    }
    catch(err){
        console.log(err);
        alert("Unable to delete account.");
    }
});
