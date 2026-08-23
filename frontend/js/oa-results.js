const API_BASE = "/api";

const params =
    new URLSearchParams(window.location.search);

const driveId =
    params.get("id");

const token =
    localStorage.getItem("token");

if(!token){

    window.location.href =
        "login.html";

}

if(!driveId){

    alert("Invalid Drive.");

    window.location.href =
        "recruitment-drives.html";
}


let oaResults = [];


async function loadResults(){

    try{

        const response =
            await fetch(
                `${API_BASE}/drives/${driveId}/oa-results`,
                {
                    headers:{
                        "Authorization":
                            "Bearer " + token
                    }
                }
            );

        const data =
            await response.json();

        if(!response.ok){

            alert(
                data.message ||
                "Unable to load OA results."
            );

            return;
        }

        oaResults = data;

        updateSummary();

        renderResults();

    }
    catch(err){

        console.log(err);

        document.getElementById(
            "resultsTable"
        ).innerHTML = `
            <tr>
                <td colspan="10"
                    class="loading">

                    Unable to load OA results.

                </td>
            </tr>
        `;

    }

}


function updateSummary(){

    const total =
        oaResults.length;

    document.getElementById(
        "totalResults"
    ).textContent = total;


    if(total === 0){

        document.getElementById(
            "averageScore"
        ).textContent = "0";

        document.getElementById(
            "averageIntegrity"
        ).textContent = "0";

        document.getElementById(
            "averagePassRatio"
        ).textContent = "0%";

        return;
    }


    const averageScore =
        oaResults.reduce(
            (sum,result) =>
                sum + result.totalScore,
            0
        ) / total;


    const averageIntegrity =
        oaResults.reduce(
            (sum,result) =>
                sum + result.integrityScore,
            0
        ) / total;


    const averagePassRatio =
        oaResults.reduce(
            (sum,result) =>
                sum + result.passRatio,
            0
        ) / total;


    document.getElementById(
        "averageScore"
    ).textContent =
        averageScore.toFixed(1);


    document.getElementById(
        "averageIntegrity"
    ).textContent =
        averageIntegrity.toFixed(1);


    document.getElementById(
        "averagePassRatio"
    ).textContent =
        averagePassRatio.toFixed(1) + "%";

}


function renderResults(){

    const table =
        document.getElementById(
            "resultsTable"
        );

    table.innerHTML = "";


    if(oaResults.length === 0){

        table.innerHTML = `
            <tr>

                <td colspan="10"
                    class="loading">

                    No OA results uploaded yet.

                </td>

            </tr>
        `;

        return;
    }


    oaResults.forEach(
        (result,index) => {

            let integrityClass =
                "integrityGood";

            if(result.integrityScore < 90){
                integrityClass =
                    "integrityWarning";
            }

            if(result.integrityScore < 70){
                integrityClass =
                    "integrityBad";
            }


            const submitted =
                new Date(
                    result.submissionTimestamp
                ).toLocaleString();


            table.innerHTML += `

                <tr>

                    <td>

                        <input
                            type="checkbox"
                            class="candidateCheck"
                            value="${result.studentId}">

                    </td>


                    <td>
                        ${index + 1}
                    </td>


                    <td>
                        <strong>
                            ${result.name}
                        </strong>

                        <br>

                        <small>
                            ${result.email}
                        </small>
                    </td>


                    <td>
                        ${result.USN}
                    </td>


                    <td class="score">

                        ${result.totalScore}
                        /
                        ${result.totalMarks}

                    </td>


                    <td class="passRatio">

                        ${result.testsPassed}
                        /
                        ${result.testsTotal}

                        <br>

                        ${result.passRatio.toFixed(1)}%

                    </td>


                    <td class="${integrityClass}">

                        ${result.integrityScore}

                    </td>


                    <td class="flags">

                        ${result.integrityFlags}

                    </td>


                    <td>

                        ${submitted}

                    </td>


                    <td>

                        <button
                            class="viewBtn"
                            onclick="viewStudent('${result.USN}')">

                            View

                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


document.getElementById(
    "sortSelect"
).addEventListener(
    "change",
    function(){

        const value =
            this.value;


        if(value === "score"){

            oaResults.sort(
                (a,b) =>
                    b.totalScore -
                    a.totalScore
            );

        }

        else if(value === "passRatio"){

            oaResults.sort(
                (a,b) =>
                    b.passRatio -
                    a.passRatio
            );

        }

        else if(value === "integrity"){

            oaResults.sort(
                (a,b) =>
                    b.integrityScore -
                    a.integrityScore
            );

        }

        else if(value === "flags"){

            oaResults.sort(
                (a,b) =>
                    a.integrityFlags -
                    b.integrityFlags
            );

        }

        else if(value === "submission"){

            oaResults.sort(
                (a,b) =>
                    new Date(
                        a.submissionTimestamp
                    ) -
                    new Date(
                        b.submissionTimestamp
                    )
            );

        }

        renderResults();

    }
);


document.getElementById(
    "selectAll"
).addEventListener(
    "change",
    function(){

        document
            .querySelectorAll(
                ".candidateCheck"
            )
            .forEach(
                checkbox => {
                    checkbox.checked =
                        this.checked;
                }
            );

    }
);


function viewStudent(usn){

    window.location.href =
        `student-details.html?usn=${encodeURIComponent(usn)}`;

}


document.getElementById(
    "interviewBtn"
).addEventListener(
    "click",
    async () => {

        const selected =
            Array.from(
                document.querySelectorAll(
                    ".candidateCheck:checked"
                )
            ).map(
                checkbox =>
                    checkbox.value
            );

        if (selected.length === 0) {

            alert(
                "Please select at least one candidate."
            );

            return;
        }

        try {

            const response =
                await fetch(
                    `${API_BASE}/drives/${driveId}/interview-candidates`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " + token

                        },

                        body: JSON.stringify({
                            studentIds: selected
                        })

                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                alert(
                    data.message ||
                    "Unable to save candidates."
                );

                return;
            }

            alert(
                `${data.count} interview candidates selected.`
            );

            window.location.href =
                `interview-details.html?id=${driveId}`;

        }
        catch (err) {

            console.log(err);

            alert(
                "Unable to save interview candidates."
            );

        }

    }
);


document.getElementById(
    "backBtn"
).addEventListener(
    "click",
    () => {

        window.history.back();

    }
);


document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    () => {

        localStorage.clear();

        window.location.href =
            "login.html";

    }
);


loadResults();
