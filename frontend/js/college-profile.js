const API_BASE =
    "/api";

const token =
    localStorage.getItem("collegeToken");


if(!token){
    window.location.href = "college-login.html";
}


function setText(id, value, fallback = "—"){
    document.getElementById(id).textContent = value || fallback;
}


async function loadProfile(){

    try{

        const response = await fetch(
            `${API_BASE}/colleges/profile`,
            {
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );

        const college = await response.json();

        if(!response.ok){
            localStorage.removeItem("collegeToken");
            localStorage.removeItem("college");
            window.location.href = "college-login.html";
            return;
        }

        setText("collegeName", college.collegeName);
        setText("collegeLocation", college.location);
        setText("collegeCode", college.collegeCode);
        setText("contactPerson", college.contactPerson);
        setText("collegePhone", college.phone);

        const email = document.getElementById("collegeEmail");
        email.textContent = college.email || "—";
        email.href = college.email ? `mailto:${college.email}` : "#";

        const website = document.getElementById("collegeWebsite");

        if(college.website){
            const websiteUrl = college.website.startsWith("http")
                ? college.website
                : `https://${college.website}`;

            website.textContent = college.website;
            website.href = websiteUrl;
        }

        const status = document.getElementById("verificationStatus");
        const isActive = college.active !== false;

        status.textContent = isActive
            ? "Active on ScoutHire"
            : "Account inactive";

        status.classList.toggle("inactive", !isActive);

    }
    catch(err){
        console.log(err);
        setText("collegeName", "Unable to load profile");
    }

}


document.getElementById("logoutBtn").addEventListener(
    "click",
    event => {
        event.preventDefault();
        localStorage.removeItem("collegeToken");
        localStorage.removeItem("college");
        window.location.href = "college-login.html";
    }
);

document.getElementById("deleteAccountBtn").addEventListener(
    "click",
    async () => {
        if(!confirm("Delete this college account permanently? This cannot be undone.")){
            return;
        }

        const password = prompt("Enter your password to confirm account deletion:");

        if(!password){
            return;
        }

        try{
            const response = await fetch(`${API_BASE}/colleges/me`, {
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer " + token
                },
                body:JSON.stringify({ password })
            });

            const data = await response.json();

            if(!response.ok){
                alert(data.message || "Unable to delete college account.");
                return;
            }

            localStorage.removeItem("collegeToken");
            localStorage.removeItem("college");
            window.location.href = "college-login.html";
        }
        catch(err){
            console.log(err);
            alert("Unable to delete college account.");
        }
    }
);


loadProfile();
