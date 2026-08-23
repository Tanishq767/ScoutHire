const API_BASE =
    "/api";


document.getElementById(
    "collegeRegisterForm"
).addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const body = {

            collegeName:
                document.getElementById(
                    "collegeName"
                ).value.trim(),

            collegeCode:
                document.getElementById(
                    "collegeCode"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            password:
                document.getElementById(
                    "password"
                ).value,

            location:
                document.getElementById(
                    "location"
                ).value.trim(),

            website:
                document.getElementById(
                    "website"
                ).value.trim(),

            contactPerson:
                document.getElementById(
                    "contactPerson"
                ).value.trim(),

            phone:
                document.getElementById(
                    "phone"
                ).value.trim()

        };


        try {

            const response =
                await fetch(
                    `${API_BASE}/colleges/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(body)
                    }
                );

            const data =
                await response.json();

            document.getElementById(
                "message"
            ).textContent =
                data.message;

            if(response.ok){

                setTimeout(() => {

                    window.location.href =
                        "college-login.html";

                }, 1000);

            }

        }
        catch(err){

            console.log(err);

            document.getElementById(
                "message"
            ).textContent =
                "Unable to register college.";

        }

    }
);
