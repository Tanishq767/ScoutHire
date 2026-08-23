const API_BASE =
    "/api";


const token =
    localStorage.getItem("collegeToken");


if(!token){

    window.location.href =
        "college-login.html";

}


async function loadCompanies(){

    try{

        const search =
            document.getElementById(
                "searchCompany"
            ).value.trim();

        const location =
            document.getElementById(
                "locationFilter"
            ).value;

        const status =
            document.getElementById(
                "statusFilter"
            ).value;

        const query = new URLSearchParams();

        if(search){
            query.set("search", search);
        }

        if(location !== "ALL"){
            query.set("location", location);
        }

        if(status !== "ALL"){
            query.set("status", status);
        }

        const response =
            await fetch(
                `${API_BASE}/colleges/partnerships/companies?${query.toString()}`,
                {
                    headers:{
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const companies =
            await response.json();


        if(!response.ok){

            alert(
                companies.message ||
                "Unable to load companies."
            );

            return;

        }

        renderCompanies(companies);

    }
    catch(err){

        console.log(err);

        alert(
            "Unable to load companies."
        );

    }

}


async function loadFilterOptions(){

    try{

        const response =
            await fetch(
                `${API_BASE}/colleges/partnerships/companies/filter-options`,
                {
                    headers:{
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message);
        }

        const locationFilter =
            document.getElementById("locationFilter");

        locationFilter.innerHTML = `

        <option value="ALL">
            All Locations
        </option>

    `;


        data.locations.forEach(
        location => {

            locationFilter.innerHTML += `

                <option value="${location}">
                    ${location}
                </option>

            `;

        }
        );

    }
    catch(err){

        console.log(err);

        alert("Unable to load location filters.");

    }

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
        let removeAction = "";


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

        if(status !== "Not Requested"){

            removeAction = `

                <button
                    class="removeBtn"
                    data-id="${company._id}">

                    Remove Partnership

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

                ${removeAction}

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


async function removePartnership(companyId, button){

    const confirmed = confirm(
        "Remove this partnership? The company will no longer be able to create new drives for your college."
    );

    if(!confirmed){
        return;
    }

    button.disabled = true;
    button.textContent = "Removing...";

    try{

        const response = await fetch(
            `${API_BASE}/colleges/partnerships/companies/${companyId}`,
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

        await loadCompanies();

    }
    catch(err){
        console.log(err);
        alert("Unable to remove partnership.");
        button.disabled = false;
        button.textContent = "Remove Partnership";
    }

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


let searchDelay;


document.getElementById(
    "searchCompany"
).addEventListener(
    "input",
    () => {

        clearTimeout(searchDelay);

        searchDelay = setTimeout(
            loadCompanies,
            300
        );

    }
);


document.getElementById(
    "locationFilter"
).addEventListener(
    "change",
    loadCompanies
);


document.getElementById(
    "statusFilter"
).addEventListener(
    "change",
    loadCompanies
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


async function initializePage(){

    await loadFilterOptions();

    loadCompanies();

}


initializePage();
