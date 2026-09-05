let electricalItems = [];
let plumbingItems = [];

let currentSection = "electrical";

// ===============================
// LOAD ITEMS FROM JSON
// ===============================

async function loadItems() {
    try {
        const electricalResponse = await fetch("./data/electrical.json");
        electricalItems = await electricalResponse.json();

        const plumbingResponse = await fetch("./data/plumbing.json");
        plumbingItems = await plumbingResponse.json();

        createTable("electrical", electricalItems);
        createTable("plumbing", plumbingItems);

    } catch (error) {
        console.error("Item loading error:", error);
        alert("Items load ஆகவில்லை. JSON files check பண்ணவும்.");
    }
}


// ===============================
// CREATE TABLE
// ===============================

function createTable(type, items) {

    const tbody = document.getElementById(type + "Items");

    if (!tbody) {
        console.error(type + "Items not found");
        return;
    }

    tbody.innerHTML = "";

    items.forEach((item, index) => {

        const tr = document.createElement("tr");

        tr.dataset.sno = item.sno || (index + 1);

        tr.innerHTML = `
            <td class="item-sno">${item.sno || (index + 1)}</td>

            <td class="item-name">
                ${escapeHTML(item.name)}
            </td>

            <td class="qty-cell">
                <input
                    type="number"
                    class="qty-input"
                    min="0"
                    step="1"
                    value=""
                    data-sno="${item.sno || (index + 1)}"
                    oninput="calculateTotal('${type}')"
                >
            </td>
        `;

        tbody.appendChild(tr);
    });

    calculateTotal(type);
}


// ===============================
// OPEN ELECTRICAL
// ===============================

function openElectrical() {

    currentSection = "electrical";

    document.getElementById("electricalForm").style.display = "block";
    document.getElementById("plumbingForm").style.display = "none";

    document.getElementById("electricalForm").scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// OPEN PLUMBING
// ===============================

function openPlumbing() {

    currentSection = "plumbing";

    document.getElementById("electricalForm").style.display = "none";
    document.getElementById("plumbingForm").style.display = "block";

    document.getElementById("plumbingForm").scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// SHOW BOTH FOR PDF
// ===============================

function showBothForms() {

    document.getElementById("electricalForm").style.display = "block";
    document.getElementById("plumbingForm").style.display = "block";
}


// ===============================
// CALCULATE TOTAL
// ===============================

function calculateTotal(type) {

    const form = document.getElementById(type + "Form");

    if (!form) return;

    const inputs = form.querySelectorAll(".qty-input");

    let total = 0;

    inputs.forEach(input => {

        let qty = parseInt(input.value);

        if (!isNaN(qty) && qty > 0) {
            total += qty;
        }
    });

    const totalElement = form.querySelector(".total-qty");

    if (totalElement) {
        totalElement.textContent = total;
    }
}


// ===============================
// GET SELECTED ITEMS
// ===============================

function getSelectedItems(type) {

    const form = document.getElementById(type + "Form");

    if (!form) return [];

    const rows = form.querySelectorAll("tbody tr");

    const selected = [];

    rows.forEach(row => {

        const input = row.querySelector(".qty-input");

        if (!input) return;

        const qty = parseInt(input.value);

        if (!isNaN(qty) && qty > 0) {

            const nameElement = row.querySelector(".item-name");

            selected.push({
                name: nameElement
                    ? nameElement.textContent.trim()
                    : "",
                qty: qty
            });
        }
    });

    return selected;
}


// ===============================
// PREPARE PDF
// ===============================

function preparePDF() {

    // Show both forms
    showBothForms();

    // Remove previous PDF hide
    document.querySelectorAll(".pdf-hide").forEach(row => {
        row.classList.remove("pdf-hide");
    });

    // Hide empty Electrical rows
    hideEmptyRows("electrical");

    // Hide empty Plumbing rows
    hideEmptyRows("plumbing");

    // Renumber Electrical
    renumberPDF("electrical");

    // Renumber Plumbing
    renumberPDF("plumbing");

    // Update totals
    calculateTotal("electrical");
    calculateTotal("plumbing");
}


// ===============================
// HIDE EMPTY ROWS
// ===============================

function hideEmptyRows(type) {

    const form = document.getElementById(type + "Form");

    if (!form) return;

    const rows = form.querySelectorAll("tbody tr");

    rows.forEach(row => {

        const input = row.querySelector(".qty-input");

        if (!input) return;

        const qty = parseInt(input.value);

        if (isNaN(qty) || qty <= 0) {
            row.classList.add("pdf-hide");
        } else {
            row.classList.remove("pdf-hide");
        }
    });
}


// ===============================
// PDF S.NO = 1,2,3,4...
// ===============================

function renumberPDF(type) {

    const form = document.getElementById(type + "Form");

    if (!form) return;

    const rows = form.querySelectorAll("tbody tr:not(.pdf-hide)");

    let number = 1;

    rows.forEach(row => {

        const snoCell = row.querySelector(".item-sno");

        if (snoCell) {
            snoCell.textContent = number;
        }

        number++;
    });
}


// ===============================
// RESTORE ORIGINAL S.NO
// ===============================

function restoreOriginalSno(type) {

    const form = document.getElementById(type + "Form");

    if (!form) return;

    const rows = form.querySelectorAll("tbody tr");

    rows.forEach((row, index) => {

        const snoCell = row.querySelector(".item-sno");

        if (snoCell) {
            snoCell.textContent = index + 1;
        }

        row.classList.remove("pdf-hide");
    });
}


// ===============================
// DOWNLOAD / PRINT PDF
// ===============================

function downloadPDF() {

    preparePDF();

    // Small delay so browser updates the page
    setTimeout(() => {

        window.print();

        // Restore website after print
        setTimeout(() => {

            restoreOriginalSno("electrical");
            restoreOriginalSno("plumbing");

            // Hide plumbing/electrical according to normal website state
            if (currentSection === "electrical") {
                document.getElementById("plumbingForm").style.display = "none";
            }

            if (currentSection === "plumbing") {
                document.getElementById("electricalForm").style.display = "none";
            }

        }, 1000);

    }, 300);
}


// ===============================
// SAVE ORDER - LOCAL STORAGE
// ===============================

function saveOrder() {

    const customerName =
        document.getElementById("customerName")?.value.trim() || "";

    const phone =
        document.getElementById("phone")?.value.trim() || "";

    const cell =
        document.getElementById("cell")?.value.trim() || "";

    const date =
        document.getElementById("date")?.value || "";

    if (!customerName) {
        alert("Customer Name enter பண்ணவும்.");
        return;
    }

    const order = {

        customerName: customerName,

        phone: phone,

        cell: cell,

        date: date,

        electrical: getSelectedItems("electrical"),

        plumbing: getSelectedItems("plumbing"),

        savedAt: new Date().toISOString()
    };

    let orders = [];

    try {
        orders = JSON.parse(
            localStorage.getItem("mvsOrders") || "[]"
        );
    } catch (error) {
        orders = [];
    }

    orders.push(order);

    localStorage.setItem(
        "mvsOrders",
        JSON.stringify(orders)
    );

    alert("Order Saved Successfully ✅");
}


// ===============================
// CLEAR FORM
// ===============================

function clearForm() {

    document.querySelectorAll(".qty-input").forEach(input => {
        input.value = "";
    });

    document.querySelectorAll(
        "#customerName, #phone, #cell, #date"
    ).forEach(input => {
        input.value = "";
    });

    calculateTotal("electrical");
    calculateTotal("plumbing");

    alert("Form cleared ✅");
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    loadItems();

});
