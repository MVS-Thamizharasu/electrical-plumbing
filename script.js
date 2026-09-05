/* =========================================================
   MVS ELECTRICAL
   ELECTRICAL + PLUMBING ORDER FORM
========================================================= */

let electricalItems = [];
let plumbingItems = [];
let currentSection = null;


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("MVS Electrical Started");

    loadItems();

    setupAutoSave();

});


/* =========================================================
   LOAD JSON ITEMS
========================================================= */

async function loadItems() {

    try {

        console.log("Loading Electrical JSON...");

        const electricalResponse =
            await fetch("./data/electrical.json");

        if (!electricalResponse.ok) {
            throw new Error("electrical.json not found");
        }

        electricalItems =
            await electricalResponse.json();


        console.log(
            "Electrical items:",
            electricalItems.length
        );


        console.log("Loading Plumbing JSON...");

        const plumbingResponse =
            await fetch("./data/plumbing.json");

        if (!plumbingResponse.ok) {
            throw new Error("plumbing.json not found");
        }

        plumbingItems =
            await plumbingResponse.json();


        console.log(
            "Plumbing items:",
            plumbingItems.length
        );


        /* CREATE TABLES */

        createTable(
            "electrical",
            electricalItems
        );

        createTable(
            "plumbing",
            plumbingItems
        );


        /* CREATE SUGGESTIONS */

        populateDatalist(
            "electricalSuggestions",
            electricalItems
        );

        populateDatalist(
            "plumbingSuggestions",
            plumbingItems
        );


        /* RESTORE SAVED DATA */

        restoreAutoSave();


        console.log(
            "All items loaded successfully"
        );

    }

    catch (error) {

        console.error(
            "ITEM LOAD ERROR:",
            error
        );

        showLoadError();

    }

}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function showLoadError() {

    const errorHTML = `
        <tr>
            <td colspan="3"
                style="
                    text-align:center;
                    padding:25px;
                    color:#dc2626;
                    font-weight:bold;
                ">

                ❌ Items load ஆகவில்லை.

                <br><br>

                Check:

                <br>

                data/electrical.json

                <br>

                data/plumbing.json

            </td>
        </tr>
    `;


    const electrical =
        document.getElementById(
            "electricalItems"
        );

    const plumbing =
        document.getElementById(
            "plumbingItems"
        );


    if (electrical) {
        electrical.innerHTML =
            errorHTML;
    }

    if (plumbing) {
        plumbing.innerHTML =
            errorHTML;
    }

}


/* =========================================================
   CREATE TABLE
========================================================= */

function createTable(type, items) {

    const tbody =
        document.getElementById(
            type + "Items"
        );


    if (!tbody) {

        console.error(
            type +
            "Items element not found"
        );

        return;
    }


    tbody.innerHTML = "";


    if (!Array.isArray(items)) {

        console.error(
            type +
            " JSON is not an array"
        );

        return;
    }


    items.forEach(
        function (item, index) {

            const sno =
                item.sno ||
                (index + 1);


            const name =
                typeof item === "string"
                    ? item
                    : (item.name || "");


            const tr =
                document.createElement("tr");


            tr.dataset.originalSno =
                sno;


            tr.innerHTML = `

                <td class="sno item-sno">
                    ${sno}
                </td>

                <td class="particulars">
                    <input
                        type="text"
                        class="particulars-input item-name"
                        list="${type}Suggestions"
                        value="${escapeHTML(name)}"
                        placeholder="Enter item name..."
                        autocomplete="off"
                    >
                </td>

                <td class="qty qty-cell">

                    <input
                        type="number"
                        class="qty-input"
                        min="0"
                        step="1"
                        inputmode="numeric"
                        data-sno="${sno}"
                    >

                </td>

            `;


            tbody.appendChild(tr);

        }
    );


    /* INPUT EVENTS */

    const inputs =
        tbody.querySelectorAll(
            "input"
        );


    inputs.forEach(
        function (input) {

            input.addEventListener(
                "input",
                function () {

                    const form =
                        input.closest(
                            ".form-page"
                        );

                    if (!form) return;


                    const id =
                        form.id;


                    const type =
                        id.replace(
                            "Form",
                            ""
                        );


                    calculateTotal(
                        type
                    );


                    updateSelectedRows(
                        type
                    );


                    saveCurrentForm();

                }
            );

        }
    );


    calculateTotal(type);

}


/* =========================================================
   DATALIST
========================================================= */

function populateDatalist(
    datalistId,
    items
) {

    const datalist =
        document.getElementById(
            datalistId
        );


    if (
        !datalist ||
        !Array.isArray(items)
    ) {
        return;
    }


    datalist.innerHTML = "";


    items.forEach(
        function (item) {

            const value =
                typeof item === "string"
                    ? item
                    : (
                        item.name ||
                        item.item ||
                        item.particulars ||
                        ""
                    );


            if (!value) return;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                value;


            datalist.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   OPEN FORM
========================================================= */

function openForm(type) {

    currentSection = type;


    const home =
        document.getElementById(
            "homePage"
        );

    const electrical =
        document.getElementById(
            "electricalForm"
        );

    const plumbing =
        document.getElementById(
            "plumbingForm"
        );


    if (home) {
        home.style.display =
            "none";
    }


    if (electrical) {

        electrical.classList.remove(
            "active"
        );

        electrical.style.display =
            "none";
    }


    if (plumbing) {

        plumbing.classList.remove(
            "active"
        );

        plumbing.style.display =
            "none";
    }


    const selected =
        document.getElementById(
            type + "Form"
        );


    if (selected) {

        selected.classList.add(
            "active"
        );

        selected.style.display =
            "block";


        selected.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   GO HOME
========================================================= */

function goHome() {

    currentSection = null;


    const electrical =
        document.getElementById(
            "electricalForm"
        );

    const plumbing =
        document.getElementById(
            "plumbingForm"
        );

    const home =
        document.getElementById(
            "homePage"
        );


    if (electrical) {

        electrical.classList.remove(
            "active"
        );

        electrical.style.display =
            "none";
    }


    if (plumbing) {

        plumbing.classList.remove(
            "active"
        );

        plumbing.style.display =
            "none";
    }


    if (home) {

        home.style.display =
            "block";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateTotal(type) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return;


    const inputs =
        form.querySelectorAll(
            ".qty-input"
        );


    let total = 0;


    inputs.forEach(
        function (input) {

            const qty =
                parseInt(
                    input.value,
                    10
                );


            if (
                !isNaN(qty) &&
                qty > 0
            ) {

                total += qty;

            }

        }
    );


    const totalElement =
        document.getElementById(
            type + "Total"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }

}


/* =========================================================
   GET SELECTED ITEMS
========================================================= */

function getSelectedItems(type) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return [];


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );


    const selected = [];


    rows.forEach(
        function (row) {

            const qtyInput =
                row.querySelector(
                    ".qty-input"
                );


            if (!qtyInput) return;


            const qty =
                parseInt(
                    qtyInput.value,
                    10
                );


            if (
                isNaN(qty) ||
                qty <= 0
            ) {
                return;
            }


            const nameInput =
                row.querySelector(
                    ".particulars-input"
                );


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            if (!name) return;


            selected.push({

                name:
                    name,

                qty:
                    qty

            });

        }
    );


    return selected;

}


/* =========================================================
   HIGHLIGHT SELECTED ROWS
========================================================= */

function updateSelectedRows(type) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return;


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(
        function (row) {

            const input =
                row.querySelector(
                    ".qty-input"
                );


            if (!input) return;


            const qty =
                parseInt(
                    input.value,
                    10
                );


            if (
                !isNaN(qty) &&
                qty > 0
            ) {

                row.classList.add(
                    "selected-row"
                );

            }

            else {

                row.classList.remove(
                    "selected-row"
                );

            }

        }
    );

}


/* =========================================================
   HIDE EMPTY ROWS FOR PDF
========================================================= */

function hideEmptyRows(type) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return;


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(
        function (row) {

            const input =
                row.querySelector(
                    ".qty-input"
                );


            if (!input) return;


            const qty =
                parseInt(
                    input.value,
                    10
                );


            if (
                isNaN(qty) ||
                qty <= 0
            ) {

                row.classList.add(
                    "pdf-hide"
                );

            }

            else {

                row.classList.remove(
                    "pdf-hide"
                );

            }

        }
    );

}


/* =========================================================
   RENUMBER PDF
========================================================= */

function renumberPDF(type) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return;


    const rows =
        form.querySelectorAll(
            "tbody tr:not(.pdf-hide)"
        );


    let number = 1;


    rows.forEach(
        function (row) {

            const sno =
                row.querySelector(
                    ".item-sno"
                );


            if (sno) {

                sno.textContent =
                    number;

            }


            number++;

        }
    );

}


/* =========================================================
   RESTORE ORIGINAL S.NO
========================================================= */

function restoreOriginalSno(type) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return;


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(
        function (row) {

            const sno =
                row.querySelector(
                    ".item-sno"
                );


            if (sno) {

                sno.textContent =
                    row.dataset.originalSno;

            }


            row.classList.remove(
                "pdf-hide"
            );

        }
    );

}


/* =========================================================
   PDF DOWNLOAD
========================================================= */

function downloadPDF(type) {

    const targetType =
        type ||
        currentSection ||
        "electrical";


    const selected =
        getSelectedItems(
            targetType
        );


    if (selected.length === 0) {

        alert(
            "முதலில் ஏதேனும் ஒரு பொருளுக்கு Qty உள்ளிடவும்."
        );

        return;

    }


    const formElement =
        document.getElementById(
            targetType + "Form"
        );


    if (!formElement) return;


    const customerName =
        document.getElementById(
            targetType + "Sri"
        )?.value.trim() || "Order";


    /* HIDE EMPTY ITEMS */

    hideEmptyRows(
        targetType
    );


    /* RENUMBER */

    renumberPDF(
        targetType
    );


    /* PDF */

    if (
        typeof html2pdf !==
        "undefined"
    ) {

        const filename =
            "MVS_" +
            targetType.toUpperCase() +
            "_" +
            safeFileName(
                customerName
            ) +
            ".pdf";


        const options = {

            margin:
                [6, 6, 6, 6],

            filename:
                filename,

            image: {
                type: "jpeg",
                quality: 0.98
            },

            html2canvas: {

                scale: 2,

                useCORS: true

            },

            jsPDF: {

                unit: "mm",

                format: "a4",

                orientation:
                    "portrait"

            }

        };


        html2pdf()
            .set(options)
            .from(formElement)
            .save()
            .then(
                function () {

                    restoreOriginalSno(
                        targetType
                    );

                }
            )
            .catch(
                function (error) {

                    console.error(
                        "PDF Error:",
                        error
                    );


                    restoreOriginalSno(
                        targetType
                    );


                    window.print();

                }
            );

    }

    else {

        window.print();


        setTimeout(
            function () {

                restoreOriginalSno(
                    targetType
                );

            },
            1000
        );

    }

}


/* =========================================================
   WHATSAPP
========================================================= */

function shareWhatsApp(type) {

    const targetType =
        type ||
        currentSection ||
        "electrical";


    const selected =
        getSelectedItems(
            targetType
        );


    if (selected.length === 0) {

        alert(
            "வாட்ஸ்அப்பில் அனுப்ப குறைந்தது ஒரு Qty உள்ளிடவும்."
        );

        return;

    }


    const prefix =
        targetType === "electrical"
            ? "electrical"
            : "plumbing";


    const title =
        targetType === "electrical"
            ? "⚡ *MVS ELECTRICAL ORDER*"
            : "🚰 *MVS PLUMBING ORDER*";


    const name =
        getValue(
            prefix + "Sri"
        );


    const phone =
        getValue(
            prefix + "Ph"
        );


    const cell =
        getValue(
            prefix + "Cell"
        );


    const date =
        getValue(
            prefix + "Date"
        ) ||
        getToday();


    let message = "";


    message +=
        title +
        "\n\n";


    if (name) {

        message +=
            "👤 Customer: " +
            name +
            "\n";

    }


    if (phone) {

        message +=
            "☎️ Ph: " +
            phone +
            "\n";

    }


    if (cell) {

        message +=
            "📱 Cell: " +
            cell +
            "\n";

    }


    message +=
        "📅 Date: " +
        formatDate(date) +
        "\n\n";


    message +=
        "*Items List:*\n";


    message +=
        "--------------------------------\n";


    let totalQty = 0;


    selected.forEach(
        function (item, index) {

            message +=
                (index + 1) +
                ". " +
                item.name +
                " - " +
                item.qty +
                " Qty\n";


            totalQty +=
                item.qty;

        }
    );


    message +=
        "--------------------------------\n";


    message +=
        "*Total Qty: " +
        totalQty +
        "*\n";


    message +=
        "--------------------------------\n";


    message +=
        "_MVS Electrical Portal_";


    const encoded =
        encodeURIComponent(
            message
        );


    const whatsappURL =
        "https://api.whatsapp.com/send?text=" +
        encoded;


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* =========================================================
   AUTO SAVE SETUP
========================================================= */

function setupAutoSave() {

    const ids = [

        "electricalSri",
        "electricalPh",
        "electricalCell",
        "electricalDate",

        "plumbingSri",
        "plumbingPh",
        "plumbingCell",
        "plumbingDate"

    ];


    ids.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) return;


            element.addEventListener(
                "input",
                saveCurrentForm
            );


            element.addEventListener(
                "change",
                saveCurrentForm
            );

        }
    );

}


/* =========================================================
   SAVE CURRENT FORM
========================================================= */

function saveCurrentForm() {

    const data = {

        electrical: {

            customer:
                getValue(
                    "electricalSri"
                ),

            phone:
                getValue(
                    "electricalPh"
                ),

            cell:
                getValue(
                    "electricalCell"
                ),

            date:
                getValue(
                    "electricalDate"
                ),

            items:
                getQtyData(
                    "electrical"
                )

        },


        plumbing: {

            customer:
                getValue(
                    "plumbingSri"
                ),

            phone:
                getValue(
                    "plumbingPh"
                ),

            cell:
                getValue(
                    "plumbingCell"
                ),

            date:
                getValue(
                    "plumbingDate"
                ),

            items:
                getQtyData(
                    "plumbing"
                )

        },


        savedAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        "mvsElectricalOrder",
        JSON.stringify(data)
    );

}


/* =========================================================
   GET QTY DATA
========================================================= */

function getQtyData(type) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return [];


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );


    const data = [];


    rows.forEach(
        function (row) {

            const qty =
                row.querySelector(
                    ".qty-input"
                );


            const name =
                row.querySelector(
                    ".particulars-input"
                );


            if (!qty) return;


            if (
                qty.value !== ""
            ) {

                data.push({

                    sno:
                        row.dataset.originalSno,

                    name:
                        name
                            ? name.value
                            : "",

                    qty:
                        qty.value

                });

            }

        }
    );


    return data;

}


/* =========================================================
   RESTORE AUTO SAVE
========================================================= */

function restoreAutoSave() {

    const saved =
        localStorage.getItem(
            "mvsElectricalOrder"
        );


    if (!saved) {

        setTodayDate();

        return;

    }


    try {

        const data =
            JSON.parse(saved);


        /* ELECTRICAL */

        setValue(
            "electricalSri",
            data.electrical?.customer
        );


        setValue(
            "electricalPh",
            data.electrical?.phone
        );


        setValue(
            "electricalCell",
            data.electrical?.cell
        );


        setValue(
            "electricalDate",
            data.electrical?.date
        );


        /* PLUMBING */

        setValue(
            "plumbingSri",
            data.plumbing?.customer
        );


        setValue(
            "plumbingPh",
            data.plumbing?.phone
        );


        setValue(
            "plumbingCell",
            data.plumbing?.cell
        );


        setValue(
            "plumbingDate",
            data.plumbing?.date
        );


        /* QTY */

        restoreQty(
            "electrical",
            data.electrical?.items || []
        );


        restoreQty(
            "plumbing",
            data.plumbing?.items || []
        );


        calculateTotal(
            "electrical"
        );


        calculateTotal(
            "plumbing"
        );


        updateSelectedRows(
            "electrical"
        );


        updateSelectedRows(
            "plumbing"
        );


        console.log(
            "Saved order restored"
        );

    }

    catch (error) {

        console.error(
            "Restore error:",
            error
        );


        setTodayDate();

    }

}


/* =========================================================
   RESTORE QTY
========================================================= */

function restoreQty(
    type,
    items
) {

    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form) return;


    items.forEach(
        function (savedItem) {

            const rows =
                form.querySelectorAll(
                    "tbody tr"
                );


            rows.forEach(
                function (row) {

                    if (
                        row.dataset.originalSno !==
                        String(
                            savedItem.sno
                        )
                    ) {
                        return;
                    }


                    const qty =
                        row.querySelector(
                            ".qty-input"
                        );


                    const name =
                        row.querySelector(
                            ".particulars-input"
                        );


                    if (qty) {

                        qty.value =
                            savedItem.qty;

                    }


                    if (
                        name &&
                        savedItem.name
                    ) {

                        name.value =
                            savedItem.name;

                    }

                }
            );

        }
    );

}


/* =========================================================
   SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (
        element &&
        value !== undefined &&
        value !== null &&
        value !== ""
    ) {

        element.value =
            value;

    }

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    if (!element) return "";


    return (
        element.value ||
        ""
    ).trim();

}


/* =========================================================
   TODAY DATE
========================================================= */

function getToday() {

    const today =
        new Date();


    return (

        today.getFullYear() +

        "-" +

        String(
            today.getMonth() + 1
        ).padStart(2, "0") +

        "-" +

        String(
            today.getDate()
        ).padStart(2, "0")

    );

}


/* =========================================================
   SET TODAY DATE
========================================================= */

function setTodayDate() {

    const today =
        getToday();


    const electricalDate =
        document.getElementById(
            "electricalDate"
        );


    const plumbingDate =
        document.getElementById(
            "plumbingDate"
        );


    if (
        electricalDate &&
        !electricalDate.value
    ) {

        electricalDate.value =
            today;

    }


    if (
        plumbingDate &&
        !plumbingDate.value
    ) {

        plumbingDate.value =
            today;

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

    }


    return (

        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]

    );

}


/* =========================================================
   SAFE FILE NAME
========================================================= */

function safeFileName(name) {

    return (

        name
            .replace(
                /[\\/:*?"<>|]/g,
                ""
            )
            .replace(
                /\s+/g,
                "_"
            )
            .substring(
                0,
                80
            )

        || "Order"

    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}
