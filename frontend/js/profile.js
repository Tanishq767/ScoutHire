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