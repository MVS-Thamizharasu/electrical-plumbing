let currentCategory = "";

let electricalItems = [];
let plumbingItems = [];


// =====================================
// LOAD ITEMS FROM GITHUB JSON
// =====================================

async function loadItems() {

    try {

        const electricalResponse =
            await fetch("./data/electrical.json");

        const plumbingResponse =
            await fetch("./data/plumbing.json");

        if (!electricalResponse.ok ||
            !plumbingResponse.ok) {

            throw new Error("JSON files not found");

        }

        electricalItems =
            await electricalResponse.json();

        plumbingItems =
            await plumbingResponse.json();


        createTable(
            electricalItems,
            "electricalItems",
            "electrical"
        );

        createTable(
            plumbingItems,
            "plumbingItems",
            "plumbing"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Items load ஆகவில்லை.\n\n" +
            "data/electrical.json மற்றும் " +
            "data/plumbing.json check செய்யவும்."
        );

    }

}


// =====================================
// CREATE ITEM TABLE
// =====================================

function createTable(items, elementId, category) {

    const tbody =
        document.getElementById(elementId);

    tbody.innerHTML = "";


    items.forEach((item, index) => {

        const row =
            document.createElement("tr");

        row.dataset.sno =
            item.sno || index + 1;


        row.innerHTML = `

            <td class="sno">
                ${item.sno || index + 1}
            </td>

            <td>
                ${escapeHTML(item.name)}
            </td>

            <td class="qty">

                <input
                    type="number"
                    min="0"
                    inputmode="numeric"
                    class="qty-input"
                    data-category="${category}"
                    data-sno="${item.sno || index + 1}"
                    placeholder=""
                    oninput="calculateTotal('${category}')"
                >

            </td>

        `;


        tbody.appendChild(row);

    });

}


// =====================================
// OPEN ELECTRICAL / PLUMBING
// =====================================

function openForm(category) {

    currentCategory = category;


    document.getElementById("home")
        .style.display = "none";


    document.getElementById("electricalForm")
        .style.display = "none";


    document.getElementById("plumbingForm")
        .style.display = "none";


    if (category === "electrical") {

        document.getElementById("electricalForm")
            .style.display = "block";


        setToday("electricalDate");

    }


    if (category === "plumbing") {

        document.getElementById("plumbingForm")
            .style.display = "block";


        setToday("plumbingDate");

    }

}


// =====================================
// BACK HOME
// =====================================

function goHome() {

    document.getElementById("electricalForm")
        .style.display = "none";


    document.getElementById("plumbingForm")
        .style.display = "none";


    document.getElementById("home")
        .style.display = "block";

}


// =====================================
// TODAY DATE
// =====================================

function setToday(id) {

    const input =
        document.getElementById(id);


    if (!input.value) {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        input.value = today;

    }

}


// =====================================
// TOTAL QTY
// =====================================

function calculateTotal(category) {

    const inputs =
        document.querySelectorAll(
            `.qty-input[data-category="${category}"]`
        );


    let total = 0;


    inputs.forEach(input => {

        total +=
            Number(input.value) || 0;

    });


    const totalElement =
        document.getElementById(
            category + "Total"
        );


    if (totalElement) {

        totalElement.innerText =
            total;

    }

}


// =====================================
// GET SELECTED ITEMS
// Qty > 0 மட்டும்
// =====================================

function getSelectedItems(category) {

    const inputs =
        document.querySelectorAll(
            `.qty-input[data-category="${category}"]`
        );


    const itemList =
        category === "electrical"
            ? electricalItems
            : plumbingItems;


    const selected = [];


    inputs.forEach(input => {

        const qty =
            Number(input.value) || 0;


        if (qty > 0) {

            const sno =
                Number(input.dataset.sno);


            const item =
                itemList.find(
                    x =>
                        Number(x.sno) === sno
                );


            if (item) {

                selected.push({

                    sno: sno,

                    name: item.name,

                    qty: qty,

                    image:
                        item.image || ""

                });

            }

        }

    });


    return selected;

}


// =====================================
// SAVE ORDER LOCALLY
// =====================================

function saveOrder(category) {

    const selectedItems =
        getSelectedItems(category);


    if (selectedItems.length === 0) {

        alert(
            "குறைந்தது ஒரு item-க்கு Qty கொடுக்கவும்."
        );

        return;

    }


    const customerName =
        document.getElementById(
            category + "Name"
        ).value.trim();


    if (!customerName) {

        alert(
            "Customer Name / Sri name கொடுக்கவும்."
        );

        return;

    }


    const order = {

        id:
            Date.now(),

        customer:
            customerName,

        phone:
            document.getElementById(
                category + "Ph"
            ).value.trim(),

        cell:
            document.getElementById(
                category + "Cell"
            ).value.trim(),

        date:
            document.getElementById(
                category + "Date"
            ).value,

        category:
            category,

        items:
            selectedItems,

        totalQty:
            selectedItems.reduce(
                (total, item) =>
                    total + item.qty,
                0
            )

    };


    let orders =
        JSON.parse(
            localStorage.getItem("mvsOrders")
        ) || [];


    orders.push(order);


    localStorage.setItem(
        "mvsOrders",
        JSON.stringify(orders)
    );


    alert(
        "Order saved successfully ✅\n\n" +
        "Customer: " +
        customerName
    );

}


// =====================================
// PDF
// Qty உள்ள items மட்டும்
// =====================================

function downloadPDF(category) {

    const selectedItems =
        getSelectedItems(category);


    if (selectedItems.length === 0) {

        alert(
            "PDF உருவாக்க குறைந்தது ஒரு item-க்கு Qty கொடுக்கவும்."
        );

        return;

    }


    const customerName =
        document.getElementById(
            category + "Name"
        ).value.trim();


    if (!customerName) {

        alert(
            "Customer Name / Sri name கொடுக்கவும்."
        );

        return;

    }


    const rows =
        document.querySelectorAll(
            `#${category}Items tr`
        );


    // Qty இல்லாத rows PDF-ல் மறைக்கப்படும்

    rows.forEach(row => {

        const input =
            row.querySelector(".qty-input");


        if (!input) return;


        const qty =
            Number(input.value) || 0;


        if (qty > 0) {

            row.classList.remove(
                "pdf-hide"
            );

        } else {

            row.classList.add(
                "pdf-hide"
            );

        }

    });


    saveOrder(category);


    setTimeout(() => {

        window.print();


        setTimeout(() => {

            rows.forEach(row => {

                row.classList.remove(
                    "pdf-hide"
                );

            });

        }, 1000);

    }, 300);

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value || "";


    return div.innerHTML;

}


// =====================================
// START APP
// =====================================

loadItems();
