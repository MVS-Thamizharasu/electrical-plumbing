/* =========================================================
   MVS ELECTRICAL & PLUMBING
   script.js
   Supports:
   - JSON: { name, sizes, customSize }
   - Separate Qty for every size
   - Custom size/rating
   - PDF only selected Qty items
   - Automatic PDF S.No.
   - Save to localStorage
   ========================================================= */

let electricalData = [];
let plumbingData = [];

let currentForm = null;


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    setToday();

    loadItems();

});


/* =========================================================
   TODAY DATE
   ========================================================= */

function setToday() {

    const today = new Date().toISOString().split("T")[0];

    const electricalDate =
        document.getElementById("electricalDate");

    const plumbingDate =
        document.getElementById("plumbingDate");

    if (electricalDate && !electricalDate.value) {
        electricalDate.value = today;
    }

    if (plumbingDate && !plumbingDate.value) {
        plumbingDate.value = today;
    }
}


/* =========================================================
   LOAD JSON FILES
   ========================================================= */

async function loadItems() {

    try {

        const electricalResponse =
            await fetch("./data/electrical.json", {
                cache: "no-store"
            });

        if (!electricalResponse.ok) {
            throw new Error(
                "Electrical JSON load failed: " +
                electricalResponse.status
            );
        }

        electricalData =
            await electricalResponse.json();


        const plumbingResponse =
            await fetch("./data/plumbing.json", {
                cache: "no-store"
            });

        if (!plumbingResponse.ok) {
            throw new Error(
                "Plumbing JSON load failed: " +
                plumbingResponse.status
            );
        }

        plumbingData =
            await plumbingResponse.json();


        console.log(
            "Electrical items:",
            electricalData.length
        );

        console.log(
            "Plumbing items:",
            plumbingData.length
        );


        createTable(
            "electrical",
            electricalData
        );

        createTable(
            "plumbing",
            plumbingData
        );


    } catch (error) {

        console.error(error);

        showLoadError(
            "electricalItems",
            "Electrical items load ஆகவில்லை. data/electrical.json check பண்ணவும்."
        );

        showLoadError(
            "plumbingItems",
            "Plumbing items load ஆகவில்லை. data/plumbing.json check பண்ணவும்."
        );
    }
}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

function showLoadError(id, message) {

    const tbody = document.getElementById(id);

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="3"
                style="
                    color:red;
                    text-align:center;
                    padding:20px;
                    font-weight:bold;
                ">
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}


/* =========================================================
   CREATE TABLE
   ========================================================= */

function createTable(type, items) {

    const tbody =
        document.getElementById(
            type + "Items"
        );

    if (!tbody) return;

    tbody.innerHTML = "";


    if (!Array.isArray(items)) {

        showLoadError(
            type + "Items",
            "JSON format சரியாக இல்லை."
        );

        return;
    }


    items.forEach(function (item, index) {

        /*
         JSON examples:

         {
            "name": "MCB",
            "sizes": ["6A","10A","16A","20A","32A"],
            "customSize": true
         }

         OR

         {
            "name": "1 Way Switch"
         }
        */


        const row =
            createItemRow(
                type,
                item,
                index
            );

        tbody.appendChild(row);

    });


    calculateTotal(type);
}


/* =========================================================
   CREATE ONE ITEM ROW
   ========================================================= */

function createItemRow(type, item, index) {

    const tr =
        document.createElement("tr");

    tr.className = "item-row";

    tr.dataset.itemIndex = index;


    const sno =
        document.createElement("td");

    sno.className = "sno";

    /*
       Website S.No. is generated from JSON order.
       PDF will renumber selected items.
    */

    sno.textContent = index + 1;


    const particulars =
        document.createElement("td");

    particulars.className =
        "particulars-cell";


    const qty =
        document.createElement("td");

    qty.className = "qty-cell";


    /* =====================================================
       ITEM NAME
       ===================================================== */

    const nameDiv =
        document.createElement("div");

    nameDiv.className =
        "item-main-name";

    nameDiv.textContent =
        item.name || "Item";


    particulars.appendChild(nameDiv);


    /* =====================================================
       NO SIZES
       ===================================================== */

    if (
        !Array.isArray(item.sizes) ||
        item.sizes.length === 0
    ) {

        const qtyInput =
            createQtyInput(
                type,
                index,
                null
            );

        qty.appendChild(qtyInput);

    }


/* =====================================================
   SIZE DROPDOWN BESIDE ITEM NAME
   ===================================================== */

if (
    Array.isArray(item.sizes) &&
    item.sizes.length > 0
) {

    const sizeContainer =
        document.createElement("div");

    sizeContainer.className =
        "size-options-container";


    function addSizeRow() {

        const sizeEntry =
            document.createElement("div");

        sizeEntry.className =
            "size-entry";


        /* UNIQUE ENTRY ID */

        const entryId =
            "size-" +
            type +
            "-" +
            index +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8);

        sizeEntry.dataset.entryId =
            entryId;


        /* SIZE DROPDOWN */

        const sizeSelect =
            document.createElement("select");

        sizeSelect.className =
            "size-dropdown";

        sizeSelect.dataset.entryId =
            entryId;


        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Select Size";

        sizeSelect.appendChild(
            defaultOption
        );


        item.sizes.forEach(
            function (size) {

                const option =
                    document.createElement("option");

                option.value = size;

                option.textContent = size;

                sizeSelect.appendChild(
                    option
                );

            }
        );


        /* CUSTOM SIZE OPTION */

        if (item.customSize === true) {

            const customOption =
                document.createElement("option");

            customOption.value =
                "__CUSTOM__";

            customOption.textContent =
                "Custom Size / Rating";

            sizeSelect.appendChild(
                customOption
            );

        }


        /* CUSTOM SIZE INPUT */

        const customInput =
            document.createElement("input");

        customInput.type = "text";

        customInput.className =
            "custom-size-input";

        customInput.placeholder =
            "Custom Size / Rating";

        customInput.style.display =
            "none";

        customInput.dataset.entryId =
            entryId;


        /* QTY INPUT */

        const sizeQty =
            createQtyInput(
                type,
                index,
                "size"
            );

        sizeQty.dataset.entryId =
            entryId;


        /* REMOVE BUTTON */

        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.textContent = "×";

        removeButton.className =
            "remove-size-btn";


        removeButton.addEventListener(
            "click",
            function () {

                sizeEntry.remove();

                sizeQty.remove();

                calculateTotal(type);

            }
        );


        /* SIZE CHANGE */

        sizeSelect.addEventListener(
            "change",
            function () {

                if (
                    this.value ===
                    "__CUSTOM__"
                ) {

                    customInput.style.display =
                        "inline-block";

                } else {

                    customInput.style.display =
                        "none";

                    customInput.value = "";

                }

                updateSelectedRow(sizeQty);

            }
        );


        /* CUSTOM INPUT CHANGE */

        customInput.addEventListener(
            "input",
            function () {

                updateSelectedRow(sizeQty);

            }
        );


        /* PARTICULARS */

        sizeEntry.appendChild(
            sizeSelect
        );

        sizeEntry.appendChild(
            customInput
        );

        sizeEntry.appendChild(
            removeButton
        );


        sizeContainer.appendChild(
            sizeEntry
        );


        /* QTY COLUMN */

        qty.appendChild(
            sizeQty
        );

    }


    /* FIRST SIZE */

    addSizeRow();


    /* ADD SIZE BUTTON */

    const addSizeButton =
        document.createElement("button");

    addSizeButton.type = "button";

    addSizeButton.textContent =
        "+ Add Size";

    addSizeButton.className =
        "add-size-btn";


    addSizeButton.addEventListener(
        "click",
        function () {

            addSizeRow();

        }
    );


    particulars.appendChild(
        sizeContainer
    );

    particulars.appendChild(
        addSizeButton
    );

}

    tr.appendChild(sno);

    tr.appendChild(particulars);

    tr.appendChild(qty);


    return tr;
}


/* =========================================================
   CREATE QTY INPUT
   ========================================================= */

function createQtyInput(
    type,
    itemIndex,
    sizeIndex
) {

    const input =
        document.createElement("input");

    input.type = "number";

    input.min = "0";

    input.step = "1";

    input.value = "";

    input.placeholder = "0";

    input.inputMode = "numeric";

    input.className =
        "qty-input";


    input.dataset.type = type;

    input.dataset.itemIndex =
        itemIndex;

    input.dataset.sizeIndex =
        sizeIndex === null
            ? ""
            : String(sizeIndex);


    input.addEventListener(
        "input",
        function () {

            if (
                Number(this.value) < 0
            ) {
                this.value = "";
            }

            calculateTotal(type);

            updateSelectedRow(this);

        }
    );


    return input;
}


/* =========================================================
   SELECTED ROW HIGHLIGHT
   ========================================================= */

function updateSelectedRow(input) {

    const row =
        input.closest("tr");

    if (!row) return;


    const inputs =
        row.querySelectorAll(
            ".qty-input"
        );


    let selected = false;


    inputs.forEach(function (qty) {

        /*
           FIX: a custom-size qty only "counts" as
           selected if the paired custom-size text
           is also filled in — otherwise it never
           makes it into getSelectedItems() and the
           highlight would be misleading.
        */

        if (
            qty.value !== "" &&
            Number(qty.value) > 0
        ) {

            if (qty.dataset.sizeIndex === "custom") {

                const customInput =
                    row.querySelector(
                        ".custom-size-input"
                    );

                if (
                    customInput &&
                    customInput.value.trim() !== ""
                ) {
                    selected = true;
                }

            } else {

                selected = true;

            }

        }

    });


    if (selected) {

        row.classList.add(
            "selected-row"
        );

    } else {

        row.classList.remove(
            "selected-row"
        );

    }
}


/* =========================================================
   CUSTOM ROW STATE (text field changes)
   ========================================================= */

function updateCustomRowState(customInput) {

    const row =
        customInput.closest("tr");

    if (!row) return;


    const customQtyInput =
        Array.from(
            row.querySelectorAll(".qty-input")
        ).find(function (el) {

            return (
                el.dataset.sizeIndex === "custom"
            );

        });


    if (customQtyInput) {

        updateSelectedRow(customQtyInput);

    }
}


/* =========================================================
   CALCULATE TOTAL
   ========================================================= */

function calculateTotal(type) {

    const container =
        document.getElementById(
            type + "Items"
        );

    const totalElement =
        document.getElementById(
            type + "Total"
        );

    if (!container || !totalElement)
        return;


    const inputs =
        container.querySelectorAll(
            ".qty-input"
        );


    let total = 0;


    inputs.forEach(function (input) {

        const value =
            Number(input.value);

        if (
            !isNaN(value) &&
            value > 0
        ) {
            total += value;
        }

    });


    totalElement.textContent =
        total;
}


/* =========================================================
   OPEN FORM
   ========================================================= */

function openForm(type) {

    document.getElementById(
        "homePage"
    ).style.display = "none";


    document.getElementById(
        "electricalForm"
    ).style.display =
        type === "electrical"
            ? "block"
            : "none";


    document.getElementById(
        "plumbingForm"
    ).style.display =
        type === "plumbing"
            ? "block"
            : "none";


    currentForm = type;

    window.scrollTo(
        0,
        0
    );
}


/* =========================================================
   GO HOME
   ========================================================= */

function goHome() {

    document.getElementById(
        "homePage"
    ).style.display = "block";


    document.getElementById(
        "electricalForm"
    ).style.display = "none";


    document.getElementById(
        "plumbingForm"
    ).style.display = "none";


    currentForm = null;

    window.scrollTo(
        0,
        0
    );
}


/* =========================================================
   GET CUSTOMER DETAILS
   ========================================================= */

function getCustomerDetails(type) {

    return {

        name:
            getValue(
                type + "Sri"
            ),

        ph:
            getValue(
                type + "Ph"
            ),

        date:
            getValue(
                type + "Date"
            )

    };
}


/* =========================================================
   GET INPUT VALUE
   ========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}


/* =========================================================
   GET SELECTED ITEMS
   ========================================================= */

function getSelectedItems(type) {

    const data =
        type === "electrical"
            ? electricalData
            : plumbingData;


    const tbody =
        document.getElementById(
            type + "Items"
        );


    if (!tbody)
        return [];


    const rows =
        tbody.querySelectorAll(
            "tr.item-row"
        );


    const selected = [];


    rows.forEach(
        function (row) {

            const itemIndex =
                Number(
                    row.dataset.itemIndex
                );


            const item =
                data[itemIndex];


            if (!item)
                return;


            const qtyInputs =
                row.querySelectorAll(
                    ".qty-input"
                );


            /* =============================================
               ITEM WITHOUT SIZES
               ============================================= */

            if (
                !Array.isArray(item.sizes) ||
                item.sizes.length === 0
            ) {

                const qty =
                    Number(
                        qtyInputs[0]?.value
                    );


                if (
                    !isNaN(qty) &&
                    qty > 0
                ) {

                    selected.push({

                        name:
                            item.name,

                        size:
                            "",

                        qty:
                            qty

                    });

                }

                return;
            }


            /* =============================================
               SIZE ITEMS
               ============================================= */

            item.sizes.forEach(
                function (size, sizeIndex) {

                    const input =
                        Array.from(
                            qtyInputs
                        ).find(
                            function (el) {

                                return (
                                    el.dataset.sizeIndex ===
                                    String(sizeIndex)
                                );

                            }
                        );


                    const qty =
                        Number(
                            input?.value
                        );


                    if (
                        !isNaN(qty) &&
                        qty > 0
                    ) {

                        selected.push({

                            name:
                                item.name,

                            size:
                                size,

                            qty:
                                qty

                        });

                    }

                }
            );


            /* =============================================
               CUSTOM SIZE
               ============================================= */

            if (
                item.customSize === true
            ) {

                const customInput =
                    row.querySelector(
                        ".custom-size-input"
                    );


                const customQtyInput =
                    Array.from(
                        qtyInputs
                    ).find(
                        function (el) {

                            return (
                                el.dataset.sizeIndex ===
                                "custom"
                            );

                        }
                    );


                const customSize =
                    customInput
                        ? customInput.value.trim()
                        : "";


                const customQty =
                    Number(
                        customQtyInput?.value
                    );


                if (
                    customSize !== "" &&
                    !isNaN(customQty) &&
                    customQty > 0
                ) {

                    selected.push({

                        name:
                            item.name,

                        size:
                            customSize,

                        qty:
                            customQty

                    });

                }

            }

        }
    );


    return selected;
}


/* =========================================================
   HIDE EMPTY ROWS FOR PDF
   ========================================================= */

function hideEmptyRows(type) {

    const tbody =
        document.getElementById(
            type + "Items"
        );


    if (!tbody)
        return;


    const rows =
        tbody.querySelectorAll(
            "tr.item-row"
        );


    rows.forEach(
        function (row) {

            const inputs =
                row.querySelectorAll(
                    ".qty-input"
                );


            let hasQty = false;


            inputs.forEach(
                function (input) {

                    if (
                        Number(input.value) > 0
                    ) {
                        hasQty = true;
                    }

                }
            );


            row.dataset.originalDisplay =
                row.style.display || "";


            if (hasQty) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        }
    );

}


/* =========================================================
   RESTORE EMPTY ROWS
   ========================================================= */

function restoreEmptyRows(type) {

    const tbody =
        document.getElementById(
            type + "Items"
        );


    if (!tbody)
        return;


    const rows =
        tbody.querySelectorAll(
            "tr.item-row"
        );


    rows.forEach(
        function (row) {

            row.style.display =
                row.dataset.originalDisplay ||
                "";

        }
    );

}


/* =========================================================
   PDF RENUMBER
   ========================================================= */

function renumberPDF(type) {

    const tbody =
        document.getElementById(
            type + "Items"
        );


    if (!tbody)
        return;


    const rows =
        tbody.querySelectorAll(
            "tr.item-row"
        );


    let number = 1;


    rows.forEach(
        function (row) {

            if (
                row.style.display === "none"
            ) {
                return;
            }


            const sno =
                row.querySelector(
                    ".sno"
                );


            if (sno) {

                sno.textContent =
                    number++;

            }

        }
    );

}


/* =========================================================
   RESTORE ORIGINAL S.NO
   ========================================================= */

function restoreOriginalSno(type) {

    const data =
        type === "electrical"
            ? electricalData
            : plumbingData;


    const tbody =
        document.getElementById(
            type + "Items"
        );


    if (!tbody)
        return;


    const rows =
        tbody.querySelectorAll(
            "tr.item-row"
        );


    rows.forEach(
        function (row) {

            const index =
                Number(
                    row.dataset.itemIndex
                );


            const sno =
                row.querySelector(
                    ".sno"
                );


            if (sno) {

                sno.textContent =
                    index + 1;

            }

        }
    );

}


/* =========================================================
   PREPARE PDF
   ========================================================= */

function preparePDF(type) {

    hideEmptyRows(type);

    renumberPDF(type);

}


/* =========================================================
   DOWNLOAD PDF
   ========================================================= */

async function downloadPDF(type) {

    const selected =
        getSelectedItems(type);


    if (selected.length === 0) {

        alert(
            "முதலில் Qty enter செய்யவும்."
        );

        return;
    }


    const form =
        document.getElementById(
            type + "Form"
        );


    if (!form)
        return;


    preparePDF(type);


    const customer =
        getCustomerDetails(type);


    const customerName =
        customer.name ||
        "Customer";


    const date =
        customer.date ||
        new Date()
            .toISOString()
            .split("T")[0];


    const fileName =
        "MVS-" +
        type +
        "-" +
        safeFileName(customerName) +
        "-" +
        date +
        ".pdf";


    const options = {

        margin: 8,

        filename:
            fileName,

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {

            scale: 2,

            useCORS: true,

            backgroundColor:
                "#ffffff"

        },

        jsPDF: {

            unit: "mm",

            format: "a4",

            orientation:
                "portrait"

        },

        pagebreak: {

            mode: [
                "css",
                "legacy"
            ]

        }

    };


    try {

        if (
            typeof html2pdf !==
            "undefined"
        ) {

            await html2pdf()
                .set(options)
                .from(form)
                .save();

        } else {

            /*
               FIX: html2pdf missing — instead of
               window.print() on the WHOLE page (which
               would also print the hidden sibling form
               / home page unless CSS scopes @media print
               to only the active form), scope the print
               to just this form by toggling a body class
               that print CSS can target. Falls back to
               the old behavior if no such CSS exists,
               but keeps the hook available.
            */

            document.body.classList.add(
                "printing-" + type
            );

            window.print();

            document.body.classList.remove(
                "printing-" + type
            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "PDF உருவாக்க முடியவில்லை."
        );

    } finally {

        restoreEmptyRows(type);

        restoreOriginalSno(type);

    }

}


/* =========================================================
   SAVE ORDER - LOCAL STORAGE
   ========================================================= */

function saveOrder(type) {

    const customer =
        getCustomerDetails(type);


    const selected =
        getSelectedItems(type);


    if (selected.length === 0) {

        alert(
            "முதலில் Qty enter செய்யவும்."
        );

        return;
    }


    const order = {

        type:
            type,

        customer:
            customer,

        items:
            selected,

        createdAt:
            new Date().toISOString()

    };


    /*
       FIX: JSON.parse can throw if localStorage
       ever holds corrupted / manually-edited data.
       Wrap it so one bad entry doesn't block every
       future save.
    */

    let oldOrders = [];

    try {

        oldOrders =
            JSON.parse(
                localStorage.getItem(
                    "mvsOrders"
                ) || "[]"
            );

        if (!Array.isArray(oldOrders)) {
            oldOrders = [];
        }

    } catch (error) {

        console.error(
            "Corrupted mvsOrders in localStorage, resetting.",
            error
        );

        oldOrders = [];

    }


    oldOrders.push(order);


    try {

        localStorage.setItem(
            "mvsOrders",
            JSON.stringify(
                oldOrders
            )
        );

        alert(
            "Order Save ஆகிவிட்டது ✅"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Order save ஆகவில்லை. Storage full-ah இருக்கலாம்."
        );

    }

}


/* =========================================================
   WHATSAPP
   ========================================================= */

function shareWhatsApp(type) {

    const customer =
        getCustomerDetails(type);


    const selected =
        getSelectedItems(type);


    if (selected.length === 0) {

        alert(
            "முதலில் Qty enter செய்யவும்."
        );

        return;
    }


    let message = "";


    message +=
        "*MVS ELECTRICAL*\n";

    message +=
        "*ORDER FORM*\n\n";


    message +=
        "Customer: " +
        (
            customer.name ||
            "-"
        ) +
        "\n";


    message +=
        "Ph: " +
        (
            customer.ph ||
            "-"
        ) +
        "\n";


    message +=
        "Date: " +
        (
            customer.date ||
            "-"
        ) +
        "\n\n";


    message +=
        "*" +
        capitalize(type) +
        "*\n";


    let sno = 1;


    selected.forEach(
        function (item) {

            message +=
                sno +
                ". " +
                item.name;


            if (item.size) {

                message +=
                    " - " +
                    item.size;

            }


            message +=
                " : Qty " +
                item.qty +
                "\n";


            sno++;

        }
    );


    const cleanPhone =
    (customer.ph || "").replace(/\D/g, "");

if (!cleanPhone) {
    alert("Phone number enter செய்யவும்.");
    return;
}

let targetPhone = cleanPhone;

if (cleanPhone.length === 10) {
    targetPhone = "91" + cleanPhone;
}

const url =
    "https://wa.me/" +
    targetPhone +
    "?text=" +
    encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   SAFE FILE NAME
   ========================================================= */

function safeFileName(name) {

    return name
        .replace(
            /[<>:"/\\|?*]+/g,
            ""
        )
        .replace(
            /\s+/g,
            "_"
        )
        .substring(
            0,
            80
        ) || "Customer";
}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalize(text) {

    if (!text)
        return "";

    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

function filterItems(type) {

    const searchInput =
        document.getElementById(type + "Search");

    const selectedCheckbox =
        document.getElementById(type + "SelectedOnly");

    const tbody =
        document.getElementById(type + "Items");

    if (!tbody) return;

    const search =
        (searchInput?.value || "")
            .toLowerCase()
            .trim();

    const selectedOnly =
        selectedCheckbox?.checked || false;

    const rows =
        tbody.querySelectorAll(".item-row");

    rows.forEach(function(row) {

        const text =
            row.textContent.toLowerCase();

        const inputs =
            row.querySelectorAll(".qty-input");

        let hasQty = false;

        inputs.forEach(function(input) {

            if (Number(input.value) > 0) {
                hasQty = true;
            }

        });

        const matchesSearch =
            !search ||
            text.includes(search);

        const matchesSelected =
            !selectedOnly ||
            hasQty;

        row.style.display =
            matchesSearch && matchesSelected
                ? ""
                : "none";

    });

}

function resetSection(type) {

    const tbody =
        document.getElementById(type + "Items");

    if (!tbody) return;

    const inputs =
        tbody.querySelectorAll(".qty-input");

    inputs.forEach(function(input) {
        input.value = "";
    });

    const search =
        document.getElementById(type + "Search");

    if (search) {
        search.value = "";
    }

    const selected =
        document.getElementById(type + "SelectedOnly");

    if (selected) {
        selected.checked = false;
    }

    tbody
        .querySelectorAll(".item-row")
        .forEach(function(row) {

            row.style.display = "";

            row.classList.remove(
                "selected-row"
            );

        });

    calculateTotal(type);
}
