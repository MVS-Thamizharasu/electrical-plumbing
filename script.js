let currentCategory = "";
let electricalItems = [];
let plumbingItems = [];

// ===============================
// LOAD ITEMS FROM JSON
// ===============================

async function loadItems() {
    try {
        const electricalResponse =
            await fetch("data/electrical.json");

        const plumbingResponse =
            await fetch("data/plumbing.json");

        electricalItems =
            await electricalResponse.json();

        plumbingItems =
            await plumbingResponse.json();

        createItems(
            electricalItems,
            "electricalItems",
            "electrical"
        );

        createItems(
            plumbingItems,
            "plumbingItems",
            "plumbing"
        );

    } catch (error) {
        console.error(error);

        alert(
            "Items load ஆகவில்லை. JSON files check செய்யவும்."
        );
    }
}


// ===============================
// CREATE ITEM TABLE
// ===============================

function createItems(list, containerId, category) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    list.forEach((item, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td class="sno">
                ${item.sno ?? index + 1}.
            </td>

            <td class="particulars">
                ${escapeHTML(item.name)}
            </td>

            <td class="qty">
                <input
                    type="number"
                    min="0"
                    inputmode="numeric"
                    class="qty-input"
                    data-category="${category}"
                    data-index="${index}"
                    placeholder=""
                    oninput="calculateTotal('${category}')"
                >
            </td>
        `;

        container.appendChild(row);
    });
}


// ===============================
// OPEN FORM
// ===============================

function openForm(type) {

    currentCategory = type;

    document.getElementById("homePage")
        .style.display = "none";

    document.getElementById("electricalPage")
        .style.display = "none";

    document.getElementById("plumbingPage")
        .style.display = "none";


    if (type === "electrical") {

        const page =
            document.getElementById("electricalPage");

        page.style.display = "block";

        page.classList.add("active");

        setToday("electricalDate");

        loadSavedForm("electrical");
    }


    if (type === "plumbing") {

        const page =
            document.getElementById("plumbingPage");

        page.style.display = "block";

        page.classList.add("active");

        setToday("plumbingDate");

        loadSavedForm("plumbing");
    }
}


// ===============================
// HOME
// ===============================

function goHome() {

    document.getElementById("electricalPage")
        .style.display = "none";

    document.getElementById("plumbingPage")
        .style.display = "none";

    document.getElementById("homePage")
        .style.display = "block";
}


// ===============================
// TODAY
// ===============================

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


// ===============================
// TOTAL QUANTITY
// ===============================

function calculateTotal(category) {

    const inputs =
        document.querySelectorAll(
            `.qty-input[data-category="${category}"]`
        );

    let total = 0;

    inputs.forEach(input => {

        total += Number(input.value) || 0;

    });

    const totalElement =
        document.getElementById(
            category + "Total"
        );

    if (totalElement) {
        totalElement.innerText = total;
    }
}


// ===============================
// SAVE FORM
// ===============================

function saveForm(category) {

    const inputs =
        document.querySelectorAll(
            `.qty-input[data-category="${category}"]`
        );

    const itemList =
        category === "electrical"
            ? electricalItems
            : plumbingItems;


    const selectedItems = [];


    inputs.forEach((input, index) => {

        const qty =
            Number(input.value);

        // Qty entered items மட்டும்
        if (qty > 0) {

            selectedItems.push({

                sno:
                    itemList[index].sno ??
                    index + 1,

                name:
                    itemList[index].name,

                qty:
                    qty,

                image:
                    itemList[index].image || ""
            });
        }

    });


    const formData = {

        title: "MVS Electrical",

        category: category,

        sri:
            document.getElementById(
                category + "Sri"
            ).value,

        ph:
            document.getElementById(
                category + "Ph"
            ).value,

        cell:
            document.getElementById(
                category + "Cell"
            ).value,

        date:
            document.getElementById(
                category + "Date"
            ).value,

        items: selectedItems,

        total:
            selectedItems.reduce(
                (sum, item) =>
                    sum + Number(item.qty),
                0
            )
    };


    localStorage.setItem(
        "mvs_" + category,
        JSON.stringify(formData)
    );


    alert(
        selectedItems.length +
        " items saved successfully ✅"
    );
}


// ===============================
// LOAD SAVED FORM
// ===============================

function loadSavedForm(category) {

    const saved =
        localStorage.getItem(
            "mvs_" + category
        );

    if (!saved) return;


    const data =
        JSON.parse(saved);


    document.getElementById(
        category + "Sri"
    ).value =
        data.sri || "";


    document.getElementById(
        category + "Ph"
    ).value =
        data.ph || "";


    document.getElementById(
        category + "Cell"
    ).value =
        data.cell || "";


    document.getElementById(
        category + "Date"
    ).value =
        data.date || "";


    data.items.forEach(savedItem => {

        const inputs =
            document.querySelectorAll(
                `.qty-input[data-category="${category}"]`
            );


        const input =
            Array.from(inputs).find(
                input =>
                    Number(input.dataset.index) ===
                    data.items.indexOf(savedItem)
            );


        if (input) {
            input.value =
                savedItem.qty;
        }

    });


    calculateTotal(category);
}


// ===============================
// GENERATE PDF
// ===============================

function generatePDF(category) {

    const inputs =
        document.querySelectorAll(
            `.qty-input[data-category="${category}"]`
        );


    let selectedCount = 0;


    inputs.forEach(input => {

        if (Number(input.value) > 0) {
            selectedCount++;
        }

    });


    if (selectedCount === 0) {

        alert(
            "PDF-க்கு குறைந்தது ஒரு item-க்கு Qty கொடுக்கவும்."
        );

        return;
    }


    // Save first
    saveForm(category);


    /*
       PDF/Print mode-ல்
       Qty உள்ள rows மட்டும் காட்டப்படும்.
    */

    inputs.forEach(input => {

        const row =
            input.closest("tr");

        if (!row) return;

        if (Number(input.value) > 0) {

            row.classList.add(
                "pdf-selected"
            );

        } else {

            row.classList.add(
                "pdf-hidden"
            );

        }

    });


    setTimeout(() => {

        window.print();


        // Print முடிந்த பிறகு reset
        setTimeout(() => {

            inputs.forEach(input => {

                const row =
                    input.closest("tr");

                if (row) {

                    row.classList.remove(
                        "pdf-selected",
                        "pdf-hidden"
                    );
                }

            });

        }, 1000);

    }, 300);
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


// ===============================
// START
// ===============================

loadItems();
