const API_BASE =
    "http://localhost:3000/api";


const token =
    localStorage.getItem("collegeToken");


if(!token){

    window.location.href =
        "college-login.html";

}


let companies = [];


async function loadCompanies(){

    try{

        const response =
            await fetch(
                `${API_BASE}/colleges/partnerships/companies`,
                {
                    headers:{
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );


        companies =
            await response.json();


        if(!response.ok){

            alert(
                companies.message ||
                "Unable to load companies."
            );

            return;

        }


        populateLocationFilter();

        applyFilters();

    }
    catch(err){

        console.log(err);

        alert(
            "Unable to load companies."
        );

    }

}


function populateLocationFilter(){

    const locationFilter =
        document.getElementById(
            "locationFilter"
        );


    const locations =
        [
            ...new Set(

                companies

                    .map(
                        company =>
                            (
                                company.location ||
                                ""
                            ).trim()
                    )

                    .filter(
                        location =>
                            location !== ""
                    )

            )
        ];


    locations.sort(
        (a,b) =>
            a.localeCompare(b)
    );


    locationFilter.innerHTML = `

        <option value="ALL">
            All Locations
        </option>

    `;


    locations.forEach(
        location => {

            locationFilter.innerHTML += `

                <option value="${location}">
                    ${location}
                </option>

            `;

        }
    );

}


function applyFilters(){

    const searchInput =
        document.getElementById(
            "searchCompany"
        );


    const locationFilter =
        document.getElementById(
            "locationFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedLocation =
        locationFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filtered =
        companies.filter(
            company => {

                const companyName =
                    (
                        company.companyName ||
                        ""
                    )
                    .toLowerCase();


                const searchMatches =
                    companyName.includes(
                        search
                    );


                if(!searchMatches){

                    return false;

                }


                if(
                    selectedLocation !==
                    "ALL"
                ){

                    const location =
                        (
                            company.location ||
                            ""
                        ).trim();


                    if(
                        location !==
                        selectedLocation
                    ){

                        return false;

                    }

                }


                if(
                    selectedStatus !==
                    "ALL"
                ){

                    const partnershipStatus =
                        company.partnershipStatus ||
                        "Not Requested";


                    const initiatedBy =
                        company.initiatedBy;


                    let matchesStatus =
                        false;


                    if(
                        selectedStatus ===
                        "Approved"
                    ){

                        matchesStatus =
                            partnershipStatus ===
                            "Approved";

                    }


                    else if(
                        selectedStatus ===
                        "Sent"
                    ){

                        matchesStatus =

                            partnershipStatus ===
                            "Verification Required"

                            &&

                            initiatedBy ===
                            "college";

                    }


                    else if(
                        selectedStatus ===
                        "Incoming"
                    ){

                        matchesStatus =

                            partnershipStatus ===
                            "Verification Required"

                            &&

                            initiatedBy ===
                            "company";

                    }


                    else if(
                        selectedStatus ===
                        "Not Requested"
                    ){

                        matchesStatus =
                            partnershipStatus ===
                            "Not Requested";

                    }


                    if(!matchesStatus){

                        return false;

                    }

                }


                return true;

            }
        );


    renderCompanies(
        filtered
    );

}


function renderCompanies(list){

    const container =
        document.getElementById(
            "companyList"
        );


    container.innerHTML = "";


    if(list.length === 0){

        container.innerHTML = `

            <p class="loading">
                No companies found.
            </p>

        `;

        return;

    }


    list.forEach(company => {

        const status =
            company.partnershipStatus ||
            "Not Requested";


        const initiatedBy =
            company.initiatedBy;


        let action = "";


        if(
            status ===
            "Approved"
        ){

            action = `

                <button
                    class="approveBtn"
                    disabled>

                    ✓ Partnership Approved

                </button>

            `;

        }


        else if(

            status ===
            "Verification Required"

            &&

            initiatedBy ===
            "company"

        ){

            action = `

                <button
                    class="approveBtn verifyBtn"
                    data-id="${company._id}">

                    Verify Partnership

                </button>

            `;

        }


        else if(

            status ===
            "Verification Required"

            &&

            initiatedBy ===
            "college"

        ){

            action = `

                <button
                    class="approveBtn"
                    disabled>

                    ⏳ Request Sent

                </button>

            `;

        }


        else{

            action = `

                <button
                    class="approveBtn requestBtn"
                    data-id="${company._id}">

                    Request Partnership

                </button>

            `;

        }


        let statusText;


        if(
            status ===
            "Approved"
        ){

            statusText =
                "✓ Connected";

        }


        else if(

            status ===
            "Verification Required"

            &&

            initiatedBy ===
            "company"

        ){

            statusText =
                "Incoming Request";

        }


        else if(

            status ===
            "Verification Required"

            &&

            initiatedBy ===
            "college"

        ){

            statusText =
                "Request Sent";

        }


        else{

            statusText =
                "Not Connected";

        }


        container.innerHTML += `

            <div class="companyCard">

                <h2>
                    ${company.companyName}
                </h2>

                <p>
                    ${company.location || "-"}
                </p>

                ${
                    company.website
                    ?
                    `<p>${company.website}</p>`
                    :
                    ""
                }


                <span class="status">

                    ${statusText}

                </span>


                ${action}

            </div>

        `;

    });


    document
        .querySelectorAll(".verifyBtn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    verifyPartnership(
                        button.dataset.id,
                        button
                    );

                }
            );

        });


    document
        .querySelectorAll(".requestBtn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    requestPartnership(
                        button.dataset.id,
                        button
                    );

                }
            );

        });

}


async function verifyPartnership(
    companyId,
    button
){

    const verificationCode =
        prompt(
            "Enter the verification code agreed upon with this company:"
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
                `${API_BASE}/colleges/partnerships/companies/${companyId}/verify`,
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
                "Verification failed."
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


        await loadCompanies();

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


async function requestPartnership(
    companyId,
    button
){

    const verificationCode =
        prompt(
            "Enter the verification code agreed upon with this company:"
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
                `${API_BASE}/colleges/partnerships/companies/${companyId}/request`,
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


        await loadCompanies();

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


document.getElementById(
    "searchCompany"
).addEventListener(
    "input",
    applyFilters
);


document.getElementById(
    "locationFilter"
).addEventListener(
    "change",
    applyFilters
);


document.getElementById(
    "statusFilter"
).addEventListener(
    "change",
    applyFilters
);


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


loadCompanies();