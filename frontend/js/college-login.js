const API_BASE =
    "http://localhost:3000/api";


document.getElementById(
    "collegeLoginForm"
).addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const email =
            document.getElementById(
                "email"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value;


        try {

            const response =
                await fetch(
                    `${API_BASE}/colleges/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email,
                                password
                            })
                    }
                );

            const data =
                await response.json();

            document.getElementById(
                "message"
            ).textContent =
                data.message;


            if(!response.ok){
                return;
            }


            localStorage.setItem(
                "collegeToken",
                data.token
            );

            localStorage.setItem(
                "college",
                JSON.stringify(
                    data.college
                )
            );


            window.location.href =
                "college-dashboard.html";

        }
        catch(err){

            console.log(err);

            document.getElementById(
                "message"
            ).textContent =
                "Unable to login.";

        }

    }
);