const API_BASE =
    "http://localhost:3000/api";

const token =
    localStorage.getItem("collegeToken");


if(!token){

    window.location.href =
        "college-login.html";

}


async function loadDashboard(){

    try{

        const headers = {

            "Authorization":
                "Bearer " + token

        };


        const profileResponse =
            await fetch(
                `${API_BASE}/colleges/profile`,
                {
                    headers
                }
            );


        const college =
            await profileResponse.json();


        if(!profileResponse.ok){

            localStorage.removeItem(
                "collegeToken"
            );

            window.location.href =
                "college-login.html";

            return;

        }


        document.getElementById(
            "collegeName"
        ).textContent =
            college.collegeName;


        const companiesResponse =
            await fetch(
                `${API_BASE}/colleges/approved-companies`,
                {
                    headers
                }
            );


        const companies =
            await companiesResponse.json();


        if(companiesResponse.ok){

            document.getElementById(
                "companyCount"
            ).textContent =
                companies.length;

        }


        const studentsResponse =
            await fetch(
                `${API_BASE}/colleges/students`,
                {
                    headers
                }
            );


        const students =
            await studentsResponse.json();


        if(studentsResponse.ok){

            document.getElementById(
                "studentCount"
            ).textContent =
                students.length;

        }

    }
    catch(err){

        console.log(err);

    }

}


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


loadDashboard();