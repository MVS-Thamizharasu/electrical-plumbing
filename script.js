// ==========================================
// MVS ELECTRICAL - SCRIPT
// ==========================================

let electricalItems = [];
let plumbingItems = [];

let currentSection = null;


// ==========================================
// LOAD JSON ITEMS
// ==========================================

async function loadItems() {

    try {

        const electricalResponse =
            await fetch("./data/electrical.json");

        if (!electricalResponse.ok) {
            throw new Error("Electrical JSON not found");
        }

        electricalItems =
            await electricalResponse.json();


        const plumbingResponse =
            await fetch("./data/plumbing.json");

        if (!plumbingResponse.ok) {
            throw new Error("Plumbing JSON not found");
        }

        plumbingItems =
            await plumbingResponse.json();


        createTable(
            "electrical",
            electricalItems
        );

        createTable(
            "plumbing",
            plumbingItems
        );

    } catch (error) {

        console.error(error);

        alert(
            "Items load ஆகவில்லை.\n\n" +
            "data/electrical.json\n" +
            "data/plumbing.json\n\n" +
            "files check பண்ணவும்."
        );
    }
}


// ==========================================
// CREATE TABLE
// ==========================================

function createTable(type, items) {

    const tbody =
        document.getElementById(type + "Items");

    if (!tbody) {
        console.error(
            type + "Items element not found"
        );
        return;
    }

    tbody.innerHTML = "";

    items.forEach((item, index) => {

        const sno =
            item.sno || (index + 1);

        const tr =
            document.createElement("tr");

        tr.dataset.originalSno = sno;

        tr.innerHTML = `

            <td class="sno item-sno">
                ${sno}
            </td>

            <td class="particulars item-name">
                ${escapeHTML(item.name || "")}
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
    });


    const inputs =
        tbody.querySelectorAll(".qty-input");

    inputs.forEach(input => {

        input.addEventListener(
            "input",
            function () {

                calculateTotal(type);

            }
        );

    });


    calculateTotal(type);
}


// ==========================================
// OPEN FORM
// ==========================================

function openForm(type) {

    currentSection = type;


    // Home hide
    const home =
        document.getElementById("homePage");

    if (home) {
        home.style.display = "none";
    }


    // Electrical hide
    const electrical =
        document.getElementById("electricalForm");

    if (electrical) {
        electrical.classList.remove("active");
        electrical.style.display = "none";
    }


    // Plumbing hide
    const plumbing =
        document.getElementById("plumbingForm");

    if (plumbing) {
        plumbing.classList.remove("active");
        plumbing.style.display = "none";
    }


    // Selected form show
    const selected =
        document.getElementById(
            type + "Form"
        );

    if (selected) {

        selected.classList.add("active");
        selected.style.display = "block";

        selected.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } else {

        alert(
            type + " form கிடைக்கவில்லை."
        );
    }
}


// ==========================================
// GO HOME
// ==========================================

function goHome() {

    currentSection = null;


    const electrical =
        document.getElementById("electricalForm");

    const plumbing =
        document.getElementById("plumbingForm");

    const home =
        document.getElementById("homePage");


    if (electrical) {
        electrical.classList.remove("active");
        electrical.style.display = "none";
    }


    if (plumbing) {
        plumbing.classList.remove("active");
        plumbing.style.display = "none";
    }


    if (home) {
        home.style.display = "block";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateTotal(type) {

    const form =
        document.getElementById(type + "Form");

    if (!form) return;


    const inputs =
        form.querySelectorAll(".qty-input");

    let total = 0;


    inputs.forEach(input => {

        const qty =
            parseInt(input.value);

        if (!isNaN(qty) && qty > 0) {

            total += qty;

        }
    });


    const totalElement =
        document.getElementById(
            type + "Total"
        );

    if (totalElement) {

        totalElement.textContent =
            total;

    }
}


// ==========================================
// GET SELECTED ITEMS
// ONLY TYPED QTY ITEMS
// ==========================================

function getSelectedItems(type) {

    const form =
        document.getElementById(type + "Form");

    if (!form) return [];


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );

    const selected = [];


    rows.forEach(row => {

        const input =
            row.querySelector(".qty-input");

        if (!input) return;


        const qty =
            parseInt(input.value);


        if (!isNaN(qty) && qty > 0) {

            const name =
                row.querySelector(
                    ".item-name"
                );


            selected.push({

                name: name
                    ? name.textContent.trim()
                    : "",

                qty: qty

            });

        }

    });


    return selected;
}


// ==========================================
// HIDE EMPTY ROWS FOR PDF
// ==========================================

function hideEmptyRows(type) {

    const form =
        document.getElementById(type + "Form");

    if (!form) return;


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(row => {

        const input =
            row.querySelector(".qty-input");


        if (!input) return;


        const qty =
            parseInt(input.value);


        if (
            isNaN(qty) ||
            qty <= 0
        ) {

            row.classList.add(
                "pdf-hide"
            );

        } else {

            row.classList.remove(
                "pdf-hide"
            );

        }

    });
}


// ==========================================
// RENUMBER PDF
// 1, 2, 3, 4...
// ==========================================

function renumberPDF(type) {

    const form =
        document.getElementById(type + "Form");

    if (!form) return;


    const rows =
        form.querySelectorAll(
            "tbody tr:not(.pdf-hide)"
        );


    let number = 1;


    rows.forEach(row => {

        const sno =
            row.querySelector(
                ".item-sno"
            );


        if (sno) {

            sno.textContent =
                number;

        }


        number++;

    });
}


// ==========================================
// RESTORE ORIGINAL S.NO
// ==========================================

function restoreOriginalSno(type) {

    const form =
        document.getElementById(type + "Form");

    if (!form) return;


    const rows =
        form.querySelectorAll(
            "tbody tr"
        );


    rows.forEach(row => {

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

    });
}


// ==========================================
// DOWNLOAD PDF
// ==========================================

function downloadPDF() {

    const electricalSelected =
        getSelectedItems("electrical");

    const plumbingSelected =
        getSelectedItems("plumbing");


    // Nothing typed
    if (
        electricalSelected.length === 0 &&
        plumbingSelected.length === 0
    ) {

        alert(
            "முதலில் Qty type பண்ணவும்."
        );

        return;
    }


    const electrical =
        document.getElementById(
            "electricalForm"
        );

    const plumbing =
        document.getElementById(
            "plumbingForm"
        );


    // Hide both first
    electrical.classList.remove("active");
    electrical.style.display = "none";

    plumbing.classList.remove("active");
    plumbing.style.display = "none";


    // Electrical has Qty
    if (
        electricalSelected.length > 0
    ) {

        electrical.classList.add(
            "active"
        );

        electrical.style.display =
            "block";

        hideEmptyRows(
            "electrical"
        );

        renumberPDF(
            "electrical"
        );
    }


    // Plumbing has Qty
    if (
        plumbingSelected.length > 0
    ) {

        plumbing.classList.add(
            "active"
        );

        plumbing.style.display =
            "block";

        hideEmptyRows(
            "plumbing"
        );

        renumberPDF(
            "plumbing"
        );
    }


    calculateTotal("electrical");
    calculateTotal("plumbing");


    setTimeout(() => {

        window.print();

    }, 300);


    // Restore after print
    setTimeout(() => {

        restoreOriginalSno(
            "electrical"
        );

        restoreOriginalSno(
            "plumbing"
        );


        electrical.classList.remove(
            "active"
        );

        plumbing.classList.remove(
            "active"
        );


        electrical.style.display =
            "none";

        plumbing.style.display =
            "none";


        if (currentSection) {

            const current =
                document.getElementById(
                    currentSection + "Form"
                );

            if (current) {

                current.classList.add(
                    "active"
                );

                current.style.display =
                    "block";

            }

        }

    }, 1500);
}


// ==========================================
// SAVE ORDER
// ==========================================

function saveOrder() {

    const customerName =
        document.getElementById(
            currentSection + "Sri"
        )?.value.trim() || "";


    if (!customerName) {

        alert(
            "Customer Name enter பண்ணவும்."
        );

        return;
    }


    const order = {

        customerName:
            customerName,

        electrical:
            getSelectedItems(
                "electrical"
            ),

        plumbing:
            getSelectedItems(
                "plumbing"
            ),

        savedAt:
            new Date().toISOString()

    };


    let orders = [];


    try {

        orders =
            JSON.parse(
                localStorage.getItem(
                    "mvsOrders"
                ) || "[]"
            );

    } catch (error) {

        orders = [];

    }


    orders.push(order);


    localStorage.setItem(
        "mvsOrders",
        JSON.stringify(orders)
    );


    alert(
        "Order Saved Successfully ✅"
    );
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadItems();

    }
);
