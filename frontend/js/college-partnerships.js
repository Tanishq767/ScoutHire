const API_BASE =
    "/api";


const token =
    localStorage.getItem("token");


if(!token){

    window.location.href =
        "login.html";

}


let colleges = [];


const authHeaders = {

    "Authorization":
        "Bearer " + token

};


async function loadColleges(){

    try{

        const response =
            await fetch(
                `${API_BASE}/companies/colleges`,
                {
                    headers:
                        authHeaders
                }
            );


        const data =
            await response.json();


        if(!response.ok){

            alert(
                data.message ||
                "Unable to load colleges."
            );

            return;

        }


        colleges =
            data;


        updateStats();

        renderColleges(
            colleges
        );

    }
    catch(err){

        console.log(err);

        document.getElementById(
            "collegeList"
        ).innerHTML = `

            <p class="loading">
                Unable to load colleges.
            </p>

        `;

    }

}


function updateStats(){

    const approved =
        colleges.filter(
            college =>
                college.partnershipStatus ===
                "Approved"
        ).length;


    const pending =
        colleges.filter(
            college =>
                college.partnershipStatus ===
                "Verification Required"
        ).length;


    const available =
        colleges.filter(
            college =>
                college.partnershipStatus ===
                "Not Requested"
        ).length;


    document.getElementById(
        "approvedCount"
    ).textContent =
        approved;


    document.getElementById(
        "pendingCount"
    ).textContent =
        pending;


    document.getElementById(
        "availableCount"
    ).textContent =
        available;

}


function renderColleges(list){

    const container =
        document.getElementById(
            "collegeList"
        );


    container.innerHTML = "";


    if(list.length === 0){

        container.innerHTML = `

            <p class="loading">
                No colleges found.
            </p>

        `;

        return;

    }


    list.forEach(college => {

        const status =
            college.partnershipStatus ||
            "Not Requested";


        const initiatedBy =
            college.initiatedBy;


        let button = "";
        let removeButton = "";


        let statusText = "";


        if(status === "Approved"){

            statusText =
                "✓ Partnership Approved";


            button = `

                <button
                    class="statusBtn approved"
                    disabled>

                    ✓ Partnership Approved

                </button>

            `;

        }


        else if(
            status ===
            "Verification Required" &&
            initiatedBy === "college"
        ){

            statusText =
                "Partnership Request Received";


            button = `

                <button
                    class="requestBtn verifyBtn"
                    data-id="${college._id}">

                    Verify Partnership

                </button>

            `;

        }


        else if(
            status ===
            "Verification Required" &&
            initiatedBy === "company"
        ){

            statusText =
                "Verification Required";


            button = `

                <button
                    class="statusBtn pending"
                    disabled>

                    ⏳ Awaiting College Verification

                </button>

            `;

        }


        else{

            statusText =
                "Not Connected";


            button = `

                <button
                    class="requestBtn"
                    data-id="${college._id}">

                    Request Partnership

                </button>

            `;

        }

        if(status !== "Not Requested"){

            removeButton = `

                <button
                    class="removeBtn"
                    data-id="${college._id}">

                    Remove Partnership

                </button>

            `;

        }


        container.innerHTML += `

            <div class="collegeCard">

                <div class="collegeTop">

                    <div class="collegeIcon">
                        🎓
                    </div>

                    <div>

                        <h2>
                            ${college.collegeName || "-"}
                        </h2>

                        <p>
                            ${college.collegeCode || ""}
                        </p>

                    </div>

                </div>


                <div class="collegeInfo">

                    <span>
                        📍 ${college.location || "-"}
                    </span>

                    <span>
                        🌐 ${college.website || "Website not provided"}
                    </span>

                </div>


                <p class="partnershipStatus">
                    ${statusText}
                </p>


                ${button}

                ${removeButton}

            </div>

        `;

    });


    document
        .querySelectorAll(".requestBtn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if(
                        button.classList.contains(
                            "verifyBtn"
                        )
                    ){

                        verifyPartnership(
                            button.dataset.id,
                            button
                        );

                    }
                    else{

                        requestPartnership(
                            button.dataset.id,
                            button
                        );

                    }

                }
            );

        });


    document
        .querySelectorAll(".removeBtn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => removePartnership(
                    button.dataset.id,
                    button
                )
            );

        });

}


async function removePartnership(collegeId, button){

    const confirmed = confirm(
        "Remove this partnership? The college will no longer be available for new recruitment drives."
    );

    if(!confirmed){
        return;
    }

    button.disabled = true;
    button.textContent = "Removing...";

    try{

        const response = await fetch(
            `${API_BASE}/companies/colleges/${collegeId}/partnership`,
            {
                method:"DELETE",
                headers:{
                    "Authorization":"Bearer " + token
                }
            }
        );

        const data = await response.json();

        if(!response.ok){
            alert(data.message || "Unable to remove partnership.");
            button.disabled = false;
            button.textContent = "Remove Partnership";
            return;
        }

        await loadColleges();

    }
    catch(err){
        console.log(err);
        alert("Unable to remove partnership.");
        button.disabled = false;
        button.textContent = "Remove Partnership";
    }

}


async function requestPartnership(
    collegeId,
    button
){

    const verificationCode =
        prompt(
            "Enter the verification code agreed upon with the college:"
        );


    if(
        !verificationCode ||
        !verificationCode.trim()
    ){

        return;

    }


    const confirmed =
        confirm(
            "Send a partnership request using this verification code?"
        );


    if(!confirmed){

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Sending...";


    try{

        const response =
            await fetch(
                `${API_BASE}/companies/colleges/${collegeId}/request`,
                {

                    method:
                        "POST",

                    headers:{

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token

                    },

                    body:
                        JSON.stringify({

                            verificationCode:
                                verificationCode.trim()

                        })

                }
            );


        const data =
            await response.json();


        if(!response.ok){

            alert(
                data.message ||
                "Unable to send partnership request."
            );

            button.disabled =
                false;

            button.textContent =
                "Request Partnership";

            return;

        }


        alert(
            "Partnership request sent successfully."
        );


        await loadColleges();

    }
    catch(err){

        console.log(err);

        alert(
            "Unable to send partnership request."
        );


        button.disabled =
            false;

        button.textContent =
            "Request Partnership";

    }

}


async function verifyPartnership(
    collegeId,
    button
){

    const verificationCode =
        prompt(
            "Enter the verification code agreed upon with the college:"
        );


    if(
        !verificationCode ||
        !verificationCode.trim()
    ){

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Verifying...";


    try{

        const response =
            await fetch(
                `${API_BASE}/companies/colleges/${collegeId}/verify-partnership`,
                {

                    method:
                        "POST",

                    headers:{

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token

                    },

                    body:
                        JSON.stringify({

                            verificationCode:
                                verificationCode.trim()

                        })

                }
            );


        const data =
            await response.json();


        if(!response.ok){

            alert(
                data.message ||
                "Unable to verify partnership."
            );

            button.disabled =
                false;

            button.textContent =
                "Verify Partnership";

            return;

        }


        alert(
            "Partnership verified successfully!"
        );


        await loadColleges();

    }
    catch(err){

        console.log(err);

        alert(
            "Unable to verify partnership."
        );


        button.disabled =
            false;

        button.textContent =
            "Verify Partnership";

    }

}


function applyFilters(){

        const query =
            document.getElementById("searchCollege").value
                .toLowerCase()
                .trim();

        const selectedStatus =
            document.getElementById("statusFilter").value;


        const filtered =
            colleges.filter(
                college => {

                    const name =
                        (
                            college.collegeName ||
                            ""
                        ).toLowerCase();


                    const code =
                        (
                            college.collegeCode ||
                            ""
                        ).toLowerCase();


                    const location =
                        (
                            college.location ||
                            ""
                        ).toLowerCase();


                    const searchMatches = (
                        name.includes(query) ||
                        code.includes(query) ||
                        location.includes(query)
                    );

                    if(!searchMatches){
                        return false;
                    }

                    if(selectedStatus === "ALL"){
                        return true;
                    }

                    const status = college.partnershipStatus || "Not Requested";
                    const initiatedBy = college.initiatedBy;

                    if(selectedStatus === "Approved"){
                        return status === "Approved";
                    }

                    if(selectedStatus === "Sent"){
                        return status === "Verification Required" && initiatedBy === "company";
                    }

                    if(selectedStatus === "Incoming"){
                        return status === "Verification Required" && initiatedBy === "college";
                    }

                    return status === "Not Requested";

                }
            );


        renderColleges(
            filtered
        );

}


document.getElementById("searchCollege").addEventListener(
    "input",
    applyFilters
);


document.getElementById("statusFilter").addEventListener(
    "change",
    applyFilters
);


document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    e => {

        e.preventDefault();

        localStorage.clear();

        window.location.href =
            "login.html";

    }
);


loadColleges();
