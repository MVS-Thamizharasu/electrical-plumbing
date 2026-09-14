/* =========================================================
   MVS ELECTRICAL & PLUMBING
   script.js
   Supports:
   - JSON: { name, sizes, colors, customSize }
   - Separate Qty for every size
   - Custom size/rating
   - PDF only selected Qty items
   - Automatic PDF S.No.
   - Save to localStorage
   ========================================================= */

let electricalData = [];
let plumbingData = [];
let commonColors = [];
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

        const electricalJson =
            await electricalResponse.json();

        electricalData =
            electricalJson.items;

        commonColors =
            electricalJson.commonColors || [];

        populateFinalElectricalItems();
        setupFinalElectricalOptions();
        setupFinalAddItem();

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


    /* =====================================================
    ITEM IMAGE - SHOW ONLY IF IMAGE EXISTS
    ===================================================== */

    if (type === "electrical") {

        const image =
            document.createElement("img");

        image.className =
            "item-thumb";

        image.alt =
            "";

        image.style.display =
            "none";


        const itemName =
            item.name || "";

        const fileName =
            itemName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");


        const imagePaths = [
            `./images/electrical/${fileName}.jpg`,
            `./images/electrical/${fileName}.jpeg`,
            `./images/electrical/${fileName}.png`
        ];


        let imageIndex = 0;


        image.src =
            imagePaths[imageIndex];


        image.addEventListener(
            "load",
            function () {

                image.style.display =
                    "inline-block";

            }
        );


        image.addEventListener(
            "error",
            function () {

                imageIndex++;

                if (
                    imageIndex <
                    imagePaths.length
                ) {

                    image.src =
                        imagePaths[imageIndex];

                } else {

                    image.remove();

                }

            }
        );


        image.addEventListener(
            "click",
            function () {

                openItemImage(image.src);

            }
        );


        nameDiv.appendChild(image);
    }


    /* =====================================================
   ITEM NAME
   ===================================================== */

    const nameText =
        document.createElement("strong");

    nameText.textContent =
        item.name || "Item";


    /* ITEM NAME */

    nameDiv.appendChild(nameText);

    particulars.appendChild(nameDiv);


    /* =====================================================
       NO SIZES
       ===================================================== */

    if (
        !Array.isArray(item.sizes) ||
        item.sizes.length === 0
    ) {

        const isLedStripLight =
            String(item.name || "")
                .trim()
                .toLowerCase() === "led strip light";

        if (isLedStripLight) {

            /* ==========================================
            LED STRIP OPTIONS
            FIRST HIDDEN
            ========================================== */

            const stripContainer =
                document.createElement("div");

            stripContainer.className =
                "led-strip-main-options";

            stripContainer.style.display =
                "none";


            /* WIDTH */

            const widthSelect =
                document.createElement("select");

            widthSelect.className =
                "led-strip-width-main";

            widthSelect.innerHTML =
                `<option value="">Select Width</option>`;

            if (Array.isArray(item.widths)) {

                item.widths.forEach(function (width) {

                    const option =
                        document.createElement("option");

                    option.value = width;
                    option.textContent = width;

                    widthSelect.appendChild(option);
                });
            }


            /* CUSTOM WIDTH */

            if (item.customSize === true) {

                const customOption =
                    document.createElement("option");

                customOption.value =
                    "__CUSTOM__";

                customOption.textContent =
                    "+ Add Size";

                widthSelect.appendChild(
                    customOption
                );
            }


            const customWidth =
                document.createElement("input");

            customWidth.type =
                "text";

            customWidth.placeholder =
                "Enter Width";

            customWidth.className =
                "led-strip-custom-width-main";

            customWidth.style.display =
                "none";


            /* COLOR */

            const colorSelect =
                document.createElement("select");

            colorSelect.className =
                "led-strip-color-main";

            colorSelect.innerHTML =
                `<option value="">Select Color</option>`;

            if (Array.isArray(item.colors)) {

                item.colors.forEach(function (color) {

                    const option =
                        document.createElement("option");

                    option.value = color;
                    option.textContent = color;

                    colorSelect.appendChild(option);
                });
            }

            colorSelect.style.display =
                "none";


            /* LENGTH */

            const lengthInput =
                document.createElement("input");

            lengthInput.type =
                "number";

            lengthInput.min =
                "0";

            lengthInput.step =
                "0.01";

            lengthInput.placeholder =
                "Length";

            lengthInput.style.display =
                "none";


            /* METER / FEET */

            const unitSelect =
                document.createElement("select");

            unitSelect.className =
                "led-strip-length-unit-main";

            unitSelect.innerHTML = `
                <option value="meter">Meter</option>
                <option value="feet">Feet</option>
            `;

            unitSelect.style.display =
                "none";


            /* ADD IN ORDER */

            stripContainer.appendChild(
                widthSelect
            );

            stripContainer.appendChild(
                customWidth
            );

            stripContainer.appendChild(
                colorSelect
            );

            stripContainer.appendChild(
                lengthInput
            );

            stripContainer.appendChild(
                unitSelect
            );

            particulars.appendChild(
                stripContainer
            );


            /* ==========================================
            CLICK ITEM NAME → SHOW WIDTH
            ========================================== */

            nameText.style.cursor =
                "pointer";

            nameText.addEventListener(
                "click",
                function () {

                    stripContainer.style.display =
                        "flex";

                }
            );


            /* ==========================================
               WIDTH → COLOR
               ========================================== */

            widthSelect.addEventListener(
                "change",
                function () {

                    if (
                        widthSelect.value ===
                        "__CUSTOM__"
                    ) {

                        customWidth.style.display =
                            "inline-block";

                        colorSelect.style.display =
                            "none";

                        lengthInput.style.display =
                            "none";

                        unitSelect.style.display =
                            "none";

                        customWidth.focus();

                    } else {

                        customWidth.style.display =
                            "none";

                        customWidth.value = "";

                        if (
                            widthSelect.value !== ""
                        ) {

                            colorSelect.style.display =
                                "inline-block";

                        } else {

                            colorSelect.style.display =
                                "none";
                        }

                        lengthInput.style.display =
                            "none";

                        unitSelect.style.display =
                            "none";
                    }
                }
            );


            /* ==========================================
               CUSTOM WIDTH → COLOR
               ========================================== */

            customWidth.addEventListener(
                "input",
                function () {

                    if (
                        customWidth.value.trim() !== ""
                    ) {

                        colorSelect.style.display =
                            "inline-block";

                    } else {

                        colorSelect.style.display =
                            "none";
                    }

                    lengthInput.style.display =
                        "none";

                    unitSelect.style.display =
                        "none";
                }
            );


            /* ==========================================
               COLOR → LENGTH
               ========================================== */

            colorSelect.addEventListener(
                "change",
                function () {

                    if (
                        colorSelect.value !== ""
                    ) {

                        lengthInput.style.display =
                            "inline-block";

                        unitSelect.style.display =
                            "inline-block";

                    } else {

                        lengthInput.style.display =
                            "none";

                        unitSelect.style.display =
                            "none";
                    }
                }
            );


            /* QTY */

            const qtyInput =
                createQtyInput(
                    type,
                    index,
                    null
                );

            qty.appendChild(
                qtyInput
            );

        } else {

            /* COLOR DROPDOWN FOR NO-SIZE ITEMS */

            if (
                item.useColors === true &&
                commonColors.length > 0
            ) {
                const colorSelect =
                    document.createElement("select");

                colorSelect.className =
                    "color-dropdown";

                const colorDefault =
                    document.createElement("option");

                colorDefault.value = "";
                colorDefault.textContent =
                    "Select Color";

                colorSelect.appendChild(
                    colorDefault
                );

                commonColors.forEach(function (color) {

                    const option =
                        document.createElement("option");

                    option.value = color;
                    option.textContent = color;

                    colorSelect.appendChild(option);
                });

                particulars.appendChild(
                    colorSelect
                );
            }

            const qtyInput =
                createQtyInput(
                    type,
                    index,
                    null
                );

            qty.appendChild(
                qtyInput
            );
        }
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

            const sizeDefault =
                document.createElement("option");

            sizeDefault.value = "";

            const ampKeywords = [
                "switch",
                "socket",
                "mcb",
                "rccb",
                "rcbo",
                "contactor",
                "isolator",
                "fuse",
                "overload relay",
                "rotary"
            ];

            const itemNameLower =
                String(item.name || "").toLowerCase();

            const isAmpItem =
                ampKeywords.some(function (keyword) {
                    return itemNameLower.includes(keyword);
                });

            sizeDefault.textContent =
                isAmpItem
                    ? "Select Amp"
                    : "Select Size";

            sizeSelect.appendChild(
                sizeDefault
            );


            /* COLOR DROPDOWN */

            let colorSelect = null;

            if (
                item.useColors === true &&
                commonColors.length > 0
            ) {
                colorSelect =
                    document.createElement("select");

                colorSelect.className =
                    "color-dropdown";

                colorSelect.dataset.entryId =
                    entryId;

                const colorDefault =
                    document.createElement("option");

                colorDefault.value = "";
                colorDefault.textContent =
                    "Select Color";

                colorSelect.appendChild(
                    colorDefault
                );

                commonColors.forEach(function (color) {

                    const option =
                        document.createElement("option");

                    option.value = color;
                    option.textContent = color;

                    colorSelect.appendChild(option);
                });
            }


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

            const sizeQty = createQtyInput(
                type,
                index,
                null
            );

            sizeQty.dataset.entryId = entryId;
            sizeQty.dataset.sizeIndex = "";


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

                    /* SET SIZE INDEX */

                    if (this.value === "__CUSTOM__") {

                        sizeQty.dataset.sizeIndex = "custom";

                        customInput.style.display =
                            "inline-block";

                    } else {

                        const selectedIndex =
                            this.selectedIndex - 1;

                        sizeQty.dataset.sizeIndex =
                            String(selectedIndex);

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

            if (colorSelect) {
                sizeEntry.appendChild(
                    colorSelect
                );
            }

            sizeEntry.appendChild(
                customInput
            );

            sizeEntry.appendChild(
                removeButton
            );


            /* QTY COLUMN */

            qty.appendChild(
                sizeQty
            );
            sizeContainer.appendChild(
                sizeEntry
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

    /* HOME HIDE */

    document.getElementById(
        "homePage"
    ).style.display = "none";


    /* ELECTRICAL FORM */

    document.getElementById(
        "electricalForm"
    ).style.display =
        type === "electrical"
            ? "block"
            : "none";


    /* PLUMBING FORM */

    document.getElementById(
        "plumbingForm"
    ).style.display =
        type === "plumbing"
            ? "block"
            : "none";


    /* ORDER NUMBER */

    const orderNoElement =
        document.getElementById(
            type === "electrical"
                ? "electricalOrderNo"
                : "plumbingOrderNo"
        );


    if (orderNoElement) {

        const key =
            type === "electrical"
                ? "mvsElectricalOrderNo"
                : "mvsPlumbingOrderNo";


        const number =
            Number(
                localStorage.getItem(key) || "1000"
            ) + 1;


        const prefix =
            type === "electrical"
                ? "MVS-E"
                : "MVS-P";


        orderNoElement.textContent =
            prefix + number;
    }


    /* CURRENT FORM */

    currentForm = type;


    /* SCROLL TOP */

    window.scrollTo(
        0,
        0
    );
}

/* =========================================================
   GO HOME
   ========================================================= */

function getElectricalImage(itemName) {

    const fileName = itemName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    return `./images/electrical/${fileName}`;
}


function openItemImage(imageSrc) {

    let modal =
        document.getElementById("item-image-modal");

    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "item-image-modal";

        modal.innerHTML = `
            <div class="item-image-overlay">

                <button
                    type="button"
                    class="item-image-close">
                    ×
                </button>

                <img
                    class="item-large-image"
                    alt="">
            </div>
        `;

        document.body.appendChild(modal);

        modal
            .querySelector(".item-image-close")
            .addEventListener("click", function () {
                modal.style.display = "none";
            });

        modal
            .querySelector(".item-image-overlay")
            .addEventListener("click", function (event) {
                if (event.target === this) {
                    modal.style.display = "none";
                }
            });
    }

    const largeImage =
        modal.querySelector(".item-large-image");

    largeImage.src = imageSrc;

    modal.style.display = "flex";
}

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


    const homePlanning =
        document.getElementById(
            "homePlanning"
        );

    if (homePlanning) {

        homePlanning.style.display =
            "none";

    }


    currentForm = null;

    window.scrollTo(
        0,
        0
    );
}

function openHomePlanning() {

    document.getElementById(
        "homePage"
    ).style.display = "none";


    document.getElementById(
        "electricalForm"
    ).style.display = "none";


    document.getElementById(
        "plumbingForm"
    ).style.display = "none";


    const homePlanning =
        document.getElementById(
            "homePlanning"
        );

    if (homePlanning) {

        homePlanning.style.display =
            "block";

    }

    // AUTO DATE

    const homeDate =
        document.getElementById("homeDate");

    if (homeDate && !homeDate.value) {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        homeDate.value =
            `${year}-${month}-${day}`;
    }


    window.scrollTo(
        0,
        0
    );
}

function addFloor() {

    const floorList =
        document.getElementById("floorList");

    if (!floorList) return;

    const floorCount =
        floorList.querySelectorAll(".home-floor").length + 1;

    const floor = document.createElement("div");

    floor.className = "home-floor";

    floor.innerHTML = `
        <div class="floor-header">

            <strong>
                ${getFloorName(floorCount)}
            </strong>

            <button
                type="button"
                onclick="addRoom(this)">
                ＋ Add Room
            </button>

        </div>

        <div class="room-list">
        </div>
    `;

    floorList.appendChild(floor);
}

function getFloorName(number) {

    if (number === 1) {
        return "Ground Floor";
    }

    if (number === 2) {
        return "First Floor";
    }

    if (number === 3) {
        return "Second Floor";
    }

    if (number === 4) {
        return "Third Floor";
    }

    return "Floor " + number;
}

const roomNames = [
    "Main Entrance / Foyer",
    "Living Room",
    "Hall",
    "Kitchen",
    "Dining",
    "Pooja Room",
    "Master Bedroom",
    "Bedroom",
    "Guest Bedroom",
    "Kids Bedroom",
    "Bathroom",
    "Attached Bathroom",
    "Common Toilet",
    "Utility Room",
    "Store Room",
    "Laundry Room",
    "Study Room",
    "Office Room",
    "Dress Room",
    "Home Theater",
    "Balcony",
    "Verandah",
    "Corridor / Passage",
    "Staircase",
    "Terrace",
    "Portico / Car Porch",
    "Parking",
    "Compound Wall / Gate",
    "Garden / Lawn",
    "Motor / Pump Room",
    "Servant Room",
    "Gym / Fitness Area",
    "Other"
];

function addRoom(button) {

    const floor = button.closest(".home-floor");
    if (!floor) return;

    const roomList = floor.querySelector(".room-list");
    if (!roomList) return;

    const roomBox = document.createElement("div");
    roomBox.className = "room-box";

    roomBox.innerHTML = `

        <div class="room-select-row">

            <div class="room-search-wrap">

                <input
                    type="text"
                    class="room-dropdown"
                    placeholder="Select or type room name..."
                    autocomplete="off"
                    onfocus="showRoomNames(this)"
                    oninput="searchRoomNames(this)"
                >

                <div class="room-suggestions"></div>

            </div>

        </div>

        <div class="room-points">
        </div>

    `;

    roomList.appendChild(roomBox);
}

function showRoomNames(input) {
    searchRoomNames(input, false);
}

function searchRoomNames(input, showAll = false) {

    const wrap = input.closest(".room-search-wrap");
    if (!wrap) return;

    const suggestions = wrap.querySelector(".room-suggestions");
    if (!suggestions) return;

    const text = input.value.trim().toLowerCase();

    const filtered = text
        ? roomNames.filter(name =>
            name.toLowerCase().includes(text)
        )
        : roomNames;

    suggestions.innerHTML = "";

    filtered.forEach(name => {

        const item = document.createElement("div");

        item.className = "room-suggestion-item";
        item.textContent = name;

        item.onclick = function () {

            input.value = name;

            suggestions.innerHTML = "";
            suggestions.style.display = "none";

            createSelectedRoom(input);
        };

        suggestions.appendChild(item);
    });

    suggestions.style.display =
        filtered.length ? "block" : "none";
}

function createSelectedRoom(select) {

    const roomBox =
        select.closest(".room-box");

    if (!roomBox) return;

    const roomName =
        select.value;

    if (!roomName) return;


    let finalName =
        roomName;


    /*
     * Repeat ஆக இருக்கக்கூடிய room types
     */
    const numberedRooms = [
        "Bedroom",
        "Master Bedroom",
        "Guest Bedroom",
        "Kids Bedroom",
        "Bathroom",
        "Attached Bathroom",
        "Common Toilet",
        "Balcony",
        "Store Room",
        "Utility Room"
    ];


    /*
     * Same room type மீண்டும் வந்தால்
     * 1, 2, 3... auto numbering
     */
    if (numberedRooms.includes(roomName)) {

        const floor =
            roomBox.closest(".home-floor");

        if (floor) {

            const roomList =
                floor.querySelector(".room-list");

            if (roomList) {

                const existingRooms =
                    roomList.querySelectorAll(
                        `[data-room-type="${roomName}"]`
                    ).length;

                finalName =
                    `${roomName} ${existingRooms + 1}`;
            }
        }
    }


    roomBox.dataset.roomType =
        roomName;

    roomBox.dataset.roomName =
        finalName;


    select.outerHTML = `
        <strong class="selected-room-name">
            ${finalName}
        </strong>

        <button
            type="button"
            onclick="openRoomPoints(this)">
            Open Room
        </button>
    `;
}

function openRoomPoints(button) {

    const roomBox = button.closest(".room-box");
    if (!roomBox) return;

    const roomPoints = roomBox.querySelector(".room-points");
    if (!roomPoints) return;

    // மற்ற rooms minimize மட்டும்
    document.querySelectorAll(".room-box .room-points").forEach(points => {
        if (points !== roomPoints) {
            points.style.display = "none";
        }
    });

    // ஏற்கனவே content இருந்தால் அதை அழிக்கக்கூடாது
    if (roomPoints.innerHTML.trim() !== "") {
        roomPoints.style.display =
            roomPoints.style.display === "block"
                ? "none"
                : "block";

        return;
    }

    const roomName =
        roomBox.dataset.roomName || "Room";

    roomPoints.innerHTML = `

        <div class="room-points-header">
            <strong>${roomName}</strong>
        </div>

        <div class="room-basic-items">

            <div class="basic-item-row">

                <label>Fan</label>

                <select class="room-fan-select">
                    <option value="">
                        Select Fan
                    </option>
                </select>

                <select
                    class="room-fan-size-select"
                    style="display:none;">
                    <option value="">
                        Select Size
                    </option>
                </select>

                <input
                    type="number"
                    min="0"
                    value="0"
                    class="room-fan-qty"
                >

                <button
                    type="button"
                    class="add-fan-btn"
                    onclick="addRoomFan(this)">
                    + Add Fan
                </button>

            </div>

<div class="room-extra-fans"></div>

            <div class="basic-item-row light-row">

                <label>Light</label>

                <select class="room-light-select">
                    <option value="">
                        Select Light
                    </option>
                </select>

                <input
                    type="number"
                    min="0"
                    value="0"
                    class="room-light-qty"
                >

                <button
                    type="button"
                    class="add-light-btn"
                    onclick="addRoomLight(this)">
                    + Add Light
                    </button>

                </div>

                <div class="room-extra-lights"></div>

            <div class="basic-item-row">

                <label>Round Sheet</label>

                <select class="room-round-sheet-select">
                    <option value="">
                        Select Round Sheet
                    </option>
                </select>

                <input
                    type="number"
                    min="0"
                    value="0"
                    class="room-round-sheet-qty"
                >

                <button
                    type="button"
                    class="add-round-sheet-btn"
                    onclick="addRoomRoundSheet(this)">
                    + Add Round Sheet
                </button>

            </div>

            <div class="room-extra-round-sheets"></div>

            <div class="basic-item-row ceiling-rose-row">

                <label>Ceiling Rose</label>

                <select class="room-ceiling-rose-select">
                    <option value="">Select Ceiling Rose</option>
                </select>

                <input
                    type="number"
                    min="0"
                    value="0"
                    class="room-ceiling-rose-qty"
                >
                <button
                    type="button"
                    class="add-ceiling-rose-btn"
                    onclick="addRoomCeilingRose(this)"
                >
                    + Add Ceiling Rose
                </button>   
            </div>

            <div class="room-extra-ceiling-roses"></div>

        </div>

        <div class="plates-container"></div>

        <button
            type="button"
            class="add-plate-btn"
            onclick="addHomePlanningPlate(this)">
            ＋ Add Plate
        </button>

    `;

    populateRoomBasicItems(roomPoints);

    roomPoints.style.display = "block";
}

function addRoomLight(button) {

    const roomPoints =
        button.closest(".room-points");

    if (!roomPoints) return;

    const container =
        roomPoints.querySelector(".room-extra-lights");

    if (!container) return;

    const row =
        document.createElement("div");

    row.className =
        "basic-item-row extra-light-row";

    row.innerHTML = `

        <label>Light</label>

        <select class="room-light-select">

            <option value="">
                Select Light
            </option>

        </select>

        <input
            type="number"
            min="0"
            value="0"
            class="room-light-qty"
        >

        <button
            type="button"
            class="remove-light-btn"
            onclick="removeExtraLight(this)">
            ×
        </button>

    `;

    container.appendChild(row);

    const lightSelect =
        row.querySelector(".room-light-select");

    populateLightSelect(lightSelect);

    /* ==========================================
       LIGHT CHANGE
       Every added Light row-க்கும்
       ========================================== */

    lightSelect.addEventListener(
        "change",
        function () {

            setupLightRowExtras(
                lightSelect,
                roomPoints
            );

        }
    );
}

function addRoomCeilingRose(button) {
    const roomPoints = button.closest(".room-points");
    if (!roomPoints) return;

    const container = roomPoints.querySelector(".room-extra-ceiling-roses");
    if (!container) return;

    const row = document.createElement("div");
    row.className = "basic-item-row extra-ceiling-rose-row";

    row.innerHTML = `
        <label>Ceiling Rose</label>

        <select class="room-extra-ceiling-rose-select">
            <option value="">Select Ceiling Rose</option>
        </select>

        <input
            type="number"
            min="0"
            value="0"
            class="room-extra-ceiling-rose-qty"
        >

        <button
            type="button"
            class="remove-extra-btn"
            onclick="this.closest('.extra-ceiling-rose-row').remove(); updateHomeFinalTotal();"
        >
            ×
        </button>
    `;

    container.appendChild(row);

    const select = row.querySelector(".room-extra-ceiling-rose-select");

    electricalData.forEach(function (item, index) {
        if (!item || !item.name) return;

        const lowerName = item.name.trim().toLowerCase();

        if (
            lowerName === "jumbo ceiling rose" ||
            lowerName === "ceiling rose 2 plate"
        ) {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = item.name;
            select.appendChild(option);
        }
    });

    select.addEventListener("change", updateHomeFinalTotal);

    row.querySelector(".room-extra-ceiling-rose-qty")
        .addEventListener("input", updateHomeFinalTotal);

    updateHomeFinalTotal();
}

function removeExtraLight(button) {

    const row =
        button.closest(".extra-light-row");

    if (!row) return;

    const extras =
        row.nextElementSibling;

    if (
        extras &&
        extras.classList.contains(
            "light-row-extras"
        )
    ) {
        extras.remove();
    }

    row.remove();

    updateHomeFinalTotal();
}

function setupLightRowExtras(lightSelect, roomPoints) {

    if (!lightSelect || !roomPoints) return;

    const row =
        lightSelect.closest(".extra-light-row");

    if (!row) return;


    /* ==========================================
       OLD EXTRA OPTIONS REMOVE
       ========================================== */

    const oldExtras =
        row.querySelector(".light-row-extras");

    if (oldExtras) {
        oldExtras.remove();
    }


    const item =
        electricalData[
        Number(lightSelect.value)
        ];

    if (!item) return;


    /* ==========================================
       EXTRA CONTAINER
       ========================================== */

    const extras =
        document.createElement("div");

    extras.className =
        "light-row-extras";


    /* ==========================================
       LED STRIP LIGHT
       ========================================== */

    if (
        String(item.name || "")
            .trim()
            .toLowerCase() === "led strip light"
    ) {

        extras.innerHTML = `

            <div class="basic-item-row">

                <label>Width</label>

                <select class="room-extra-strip-width">

                    <option value="">
                        Select Width
                    </option>

                </select>

                <input
                    type="text"
                    class="room-extra-custom-width"
                    placeholder="Enter custom width"
                    style="display:none;"
                >

            </div>


            <div class="basic-item-row">

                <label>Color</label>

                <select class="room-extra-strip-color">

                    <option value="">
                        Select Color
                    </option>

                </select>

            </div>


            <div class="basic-item-row">

                <label>Length</label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value="0"
                    class="room-extra-strip-length"
                    placeholder="Enter length"
                >

                <select class="room-extra-strip-unit">

                    <option value="meter">
                        Meter
                    </option>

                    <option value="feet">
                        Feet
                    </option>

                </select>

            </div>


            <div class="basic-item-row">

                <label>LED Driver</label>

                <select class="room-extra-driver-select">

                    <option value="">
                        Select LED Driver
                    </option>

                </select>

                <input
                    type="number"
                    min="0"
                    value="0"
                    class="room-extra-driver-qty"
                >

            </div>

        `;

        row.insertAdjacentElement(
            "afterend",
            extras
        );


        /* ======================================
           GET STRIP ITEM FROM JSON
           ====================================== */

        const stripItem =
            electricalData.find(function (item) {

                return (
                    String(item.name || "")
                        .trim()
                        .toLowerCase() ===
                    "led strip light"
                );

            });


        if (!stripItem) return;


        /* ======================================
           WIDTH FROM JSON
           ====================================== */

        const widthSelect =
            extras.querySelector(
                ".room-extra-strip-width"
            );

        if (widthSelect) {

            if (
                Array.isArray(
                    stripItem.widths
                )
            ) {

                stripItem.widths.forEach(
                    function (width) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value = width;
                        option.textContent = width;

                        widthSelect.appendChild(
                            option
                        );

                    }
                );

            }

            const addSize =
                document.createElement(
                    "option"
                );

            addSize.value =
                "__add_size__";

            addSize.textContent =
                "+ Add Size";

            widthSelect.appendChild(
                addSize
            );
        }


        /* ======================================
           COLOR FROM JSON
           ====================================== */

        const colorSelect =
            extras.querySelector(
                ".room-extra-strip-color"
            );

        if (colorSelect) {

            if (
                Array.isArray(
                    stripItem.colors
                )
            ) {

                stripItem.colors.forEach(
                    function (color) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value = color;
                        option.textContent = color;

                        colorSelect.appendChild(
                            option
                        );

                    }
                );

            }

        }


        /* ======================================
           DRIVER FROM JSON
           ====================================== */

        const driverSelect =
            extras.querySelector(
                ".room-extra-driver-select"
            );

        if (driverSelect) {

            electricalData.forEach(
                function (driverItem) {

                    const name =
                        String(
                            driverItem.name || ""
                        ).trim();

                    const lowerName =
                        name.toLowerCase();

                    if (
                        lowerName ===
                        "smps led driver" ||
                        lowerName ===
                        "led driver / choke for tubelight"
                    ) {

                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value =
                            electricalData.indexOf(
                                driverItem
                            );

                        option.textContent =
                            name;

                        driverSelect.appendChild(
                            option
                        );

                    }

                }
            );

        }


        /* ======================================
           ADD SIZE
           ====================================== */

        const customWidth =
            extras.querySelector(
                ".room-extra-custom-width"
            );

        if (
            widthSelect &&
            customWidth
        ) {

            widthSelect.addEventListener(
                "change",
                function () {

                    if (
                        widthSelect.value ===
                        "__add_size__"
                    ) {

                        customWidth.style.display =
                            "block";

                        customWidth.value = "";

                        customWidth.focus();

                    } else {

                        customWidth.style.display =
                            "none";

                        customWidth.value = "";

                    }

                }
            );

        }

    }
}

function populateLightSelect(select) {

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select Light
        </option>
    `;

    electricalData.forEach(function (item, index) {

        const name =
            String(item.name || "").trim();

        const lowerName =
            name.toLowerCase();

        if (
            lowerName === "led bulb" ||
            lowerName === "led tube light" ||
            lowerName === "led panel light" ||
            lowerName === "led panel light round" ||
            lowerName === "led panel light square" ||
            lowerName === "led down light" ||
            lowerName === "spot light" ||
            lowerName === "cob spotlight" ||
            lowerName === "led strip light" ||
            lowerName === "flood light"
        ) {

            const option =
                document.createElement("option");

            option.value = index;
            option.textContent = name;

            select.appendChild(option);
        }
    });
}

function populateRoomBasicItems(roomPoints) {

    const fanSelect =
        roomPoints.querySelector(".room-fan-select");

    const fanSizeSelect =
        roomPoints.querySelector(".room-fan-size-select");

    const lightSelect =
        roomPoints.querySelector(".room-light-select");

    const roundSheetSelect =
        roomPoints.querySelector(".room-round-sheet-select");

    const ceilingRoseSelect =
        roomPoints.querySelector(".room-ceiling-rose-select");

    if (
        !fanSelect ||
        !fanSizeSelect ||
        !lightSelect ||
        !roundSheetSelect ||
        !ceilingRoseSelect
    ) {
        return;
    }

    fanSelect.addEventListener("change", function () {

        if (!fanSizeSelect) return;

        fanSizeSelect.innerHTML = `
        <option value="">
            Select Size
        </option>
    `;

        const itemIndex =
            Number(fanSelect.value);

        const item =
            electricalData[itemIndex];

        if (!item) {
            fanSizeSelect.style.display = "none";
            return;
        }

        if (
            Array.isArray(item.sizes) &&
            item.sizes.length > 0
        ) {

            item.sizes.forEach(function (size) {

                const option =
                    document.createElement("option");

                option.value = size;
                option.textContent = size;

                fanSizeSelect.appendChild(option);
            });

            fanSizeSelect.style.display = "block";

        } else {

            fanSizeSelect.style.display = "none";
        }

    });

    /* ==========================================
       CLEAR OLD OPTIONS
       ========================================== */

    fanSelect.innerHTML =
        `<option value="">Select Fan</option>`;

    lightSelect.innerHTML =
        `<option value="">Select Light</option>`;

    roundSheetSelect.innerHTML =
        `<option value="">Select Round Sheet</option>`;

    ceilingRoseSelect.innerHTML =
        `<option value="">Select Ceiling Rose</option>`;

    /* ==========================================
       FAN
       ========================================== */

    electricalData.forEach(function (item, index) {

        const name =
            String(item.name || "").trim();

        const lowerName =
            name.toLowerCase();


        if (
            lowerName === "ceiling fan" ||
            lowerName === "exhaust fan heavy duty"
        ) {

            const option =
                document.createElement("option");

            option.value = index;
            option.textContent = name;

            fanSelect.appendChild(option);
        }


        /* ======================================
           LIGHT
           ====================================== */

        if (
            lowerName === "led bulb" ||
            lowerName === "led tube light" ||
            lowerName === "led panel light" ||
            lowerName === "led panel light round" ||
            lowerName === "led panel light square" ||
            lowerName === "led down light" ||
            lowerName === "spot light" ||
            lowerName === "cob spotlight" ||
            lowerName === "led strip light" ||
            lowerName === "flood light"
        ) {

            const option =
                document.createElement("option");

            option.value = index;
            option.textContent = name;

            lightSelect.appendChild(option);
        }


        /* ======================================
           ROUND SHEET
           ====================================== */

        if (
            lowerName === "round sheet"
        ) {

            const option =
                document.createElement("option");

            option.value = index;
            option.textContent = name;

            roundSheetSelect.appendChild(option);
        }

        if (
            lowerName === "jumbo ceiling rose" ||
            lowerName === "ceiling rose 2 plate"
        ) {

            const option =
                document.createElement("option");

            option.value = index;
            option.textContent = name;

            ceilingRoseSelect.appendChild(option);
        }

    });


    /* ==========================================
   LED STRIP LIGHT EXTRA OPTIONS
   ========================================== */

    const lightRow =
        lightSelect.closest(".basic-item-row");

    if (!lightRow) return;

    let stripOptions =
        roomPoints.querySelector(".led-strip-options");

    if (!stripOptions) {

        stripOptions =
            document.createElement("div");

        stripOptions.className =
            "led-strip-options";

        stripOptions.style.display =
            "none";

        stripOptions.innerHTML = `

        <div class="basic-item-row">

            <label>Width</label>

            <select class="room-strip-width-select">

                <option value="">
                    Select Width
                </option>

                <option value="__add_size__">
                    + Add Size
                </option>

            </select>

            <input
                type="text"
                class="room-strip-custom-width"
                placeholder="Enter custom width"
                style="display:none;"
            >

        </div>


        <div class="basic-item-row">

            <label>Color</label>

            <select class="room-strip-color-select">

                <option value="">
                    Select Color
                </option>

            </select>

        </div>


        <div class="basic-item-row">

            <label>Length</label>

            <input
                type="number"
                min="0"
                step="0.01"
                value="0"
                class="room-strip-length"
                placeholder="Enter length"
            >

            <select class="room-strip-length-unit">

                <option value="meter">
                    Meter
                </option>

                <option value="feet">
                    Feet
                </option>

            </select>

        </div>

    `;

        lightRow.insertAdjacentElement(
            "afterend",
            stripOptions
        );
    }


    /* ==========================================
       GET LED STRIP LIGHT FROM JSON
       ========================================== */

    const stripItem =
        electricalData.find(item =>
            String(item.name || "")
                .trim()
                .toLowerCase() === "led strip light"
        );


    if (stripItem) {

        /* ======================================
           WIDTH FROM JSON
           ====================================== */

        const widthSelect =
            stripOptions.querySelector(
                ".room-strip-width-select"
            );

        if (widthSelect) {

            widthSelect.innerHTML = `
            <option value="">
                Select Width
            </option>
        `;

            if (
                Array.isArray(stripItem.widths)
            ) {

                stripItem.widths.forEach(width => {

                    const option =
                        document.createElement("option");

                    option.value = width;
                    option.textContent = width;

                    widthSelect.appendChild(
                        option
                    );

                });

            }

            const addSizeOption =
                document.createElement("option");

            addSizeOption.value =
                "__add_size__";

            addSizeOption.textContent =
                "+ Add Size";

            widthSelect.appendChild(
                addSizeOption
            );
        }


        /* ======================================
           COLOR FROM JSON
           ====================================== */

        const colorSelect =
            stripOptions.querySelector(
                ".room-strip-color-select"
            );

        if (colorSelect) {

            colorSelect.innerHTML = `
            <option value="">
                Select Color
            </option>
        `;

            if (
                Array.isArray(stripItem.colors)
            ) {

                stripItem.colors.forEach(color => {

                    const option =
                        document.createElement("option");

                    option.value = color;
                    option.textContent = color;

                    colorSelect.appendChild(
                        option
                    );

                });

            }

        }

    }


    /* ==========================================
       CUSTOM WIDTH
       ========================================== */

    const widthSelect =
        stripOptions.querySelector(
            ".room-strip-width-select"
        );

    const customWidth =
        stripOptions.querySelector(
            ".room-strip-custom-width"
        );


    if (widthSelect && customWidth) {

        widthSelect.addEventListener(
            "change",
            function () {

                if (
                    widthSelect.value ===
                    "__add_size__"
                ) {

                    customWidth.style.display =
                        "block";

                    customWidth.value = "";

                    customWidth.focus();

                } else {

                    customWidth.style.display =
                        "none";

                    customWidth.value = "";

                }

            }
        );

    }


    /* ==========================================
       SHOW STRIP OPTIONS
       ONLY FOR LED STRIP LIGHT
       ========================================== */

    lightSelect.addEventListener(
        "change",
        function () {

            const selectedOption =
                lightSelect.options[
                lightSelect.selectedIndex
                ];

            const selectedName =
                selectedOption
                    ? selectedOption.textContent
                        .trim()
                        .toLowerCase()
                    : "";


            if (
                selectedName ===
                "led strip light"
            ) {

                stripOptions.style.display =
                    "block";

            } else {

                stripOptions.style.display =
                    "none";

            }

        }
    );


    /* ==========================================
       LED DRIVER
       ========================================== */

    let driverRow =
        roomPoints.querySelector(".led-driver-row");

    if (!driverRow) {

        driverRow =
            document.createElement("div");

        driverRow.className =
            "basic-item-row led-driver-row";

        driverRow.style.display =
            "none";

        driverRow.innerHTML = `

            <label>LED Driver</label>

            <select class="room-driver-select">

                <option value="">
                    Select LED Driver
                </option>

            </select>

            <input
                type="number"
                min="0"
                value="0"
                class="room-driver-qty"
            >

        `;

        roomPoints
            .querySelector(".led-strip-options")
            .insertAdjacentElement(
                "afterend",
                driverRow
            );
    }


    /* ==========================================
       DRIVER OPTIONS
       ========================================== */

    const driverSelect =
        driverRow.querySelector(".room-driver-select");

    driverSelect.innerHTML =
        `<option value="">Select LED Driver</option>`;

    electricalData.forEach(function (item, index) {

        const name =
            String(item.name || "").trim();

        const lowerName =
            name.toLowerCase();

        if (
            lowerName === "smps led driver" ||
            lowerName === "led driver / choke for tubelight"
        ) {

            const option =
                document.createElement("option");

            option.value = index;
            option.textContent = name;

            driverSelect.appendChild(option);
        }

    });


    /* ==========================================
       SHOW DRIVER ONLY FOR LED STRIP LIGHT
       ========================================== */

    lightSelect.addEventListener(
        "change",
        function () {

            const selectedOption =
                lightSelect.options[
                lightSelect.selectedIndex
                ];

            const selectedName =
                selectedOption
                    ? selectedOption.textContent
                        .trim()
                        .toLowerCase()
                    : "";

            if (
                selectedName === "led strip light"
            ) {

                driverRow.style.display =
                    "grid";

            } else {

                driverRow.style.display =
                    "none";

                driverSelect.value = "";
            }

        }
    );

    /* ==========================================
   UPDATE FINAL TOTAL WHEN ROOM ITEM CHANGES
   ========================================== */

    [
        fanSelect,
        lightSelect,
        roundSheetSelect,

        roomPoints.querySelector(".room-fan-qty"),
        roomPoints.querySelector(".room-light-qty"),
        roomPoints.querySelector(".room-round-sheet-qty")
    ].forEach(function (control) {

        if (!control) return;

        control.addEventListener("change", function () {
            updateHomeFinalTotal();
        });

        control.addEventListener("input", function () {
            updateHomeFinalTotal();
        });

    });
}

function populateFinalElectricalItems() {

    const select =
        document.getElementById("final-item-select");

    if (!select) return;

    // பழைய options clear
    select.innerHTML = `
        <option value="">Select Item</option>
    `;

    electricalData.forEach(function (item, index) {

        const option =
            document.createElement("option");

        option.value = index;
        option.textContent = item.name;

        select.appendChild(option);
    });
}

function setupFinalAddItem() {

    const addButton =
        document.getElementById("final-add-item-btn");

    if (!addButton) return;

    addButton.onclick = function () {

        const itemSelect =
            document.getElementById("final-item-select");

        const sizeSelect =
            document.getElementById("final-size-select");

        const colorSelect =
            document.getElementById("final-color-select");

        const qtyInput =
            document.getElementById("final-item-qty");


        const itemIndex =
            Number(itemSelect.value);

        const item =
            electricalData[itemIndex];

        const qty =
            Number(qtyInput.value) || 0;


        if (!item) {
            alert("Electrical Item select பண்ணு.");
            return;
        }

        if (qty <= 0) {
            alert("Qty enter பண்ணு.");
            return;
        }


        const size =
            sizeSelect.value || "";

        const color =
            colorSelect.value || "";


        /*
         * FINAL TOTAL LIST
         * existing total-க்கு புதிய qty சேர்க்கும்
         */
        addFinalItemToTotal(
            item,
            size,
            color,
            qty
        );


        // reset
        itemSelect.value = "";

        sizeSelect.innerHTML =
            `<option value="">Select</option>`;

        colorSelect.innerHTML =
            `<option value="">Select Color</option>`;

        sizeSelect.style.display = "none";
        colorSelect.style.display = "none";

        qtyInput.value = 1;
    };
}

function setupFinalElectricalOptions() {

    const itemSelect =
        document.getElementById("final-item-select");

    const sizeSelect =
        document.getElementById("final-size-select");

    const colorSelect =
        document.getElementById("final-color-select");

    if (
        !itemSelect ||
        !sizeSelect ||
        !colorSelect
    ) {
        return;
    }

    /* முதலில் மறைத்து வைக்க */
    sizeSelect.style.display = "none";
    colorSelect.style.display = "none";


    itemSelect.addEventListener("change", function () {

        const item =
            electricalData[Number(this.value)];

        sizeSelect.innerHTML =
            `<option value="">Select</option>`;

        colorSelect.innerHTML =
            `<option value="">Select Color</option>`;

        sizeSelect.style.display = "none";
        colorSelect.style.display = "none";


        if (!item) return;


        /* =========================
           AMP / SIZE
           ========================= */

        if (
            Array.isArray(item.sizes) &&
            item.sizes.length > 0
        ) {

            item.sizes.forEach(function (size) {

                const option =
                    document.createElement("option");

                option.value = size;
                option.textContent = size;

                sizeSelect.appendChild(option);

            });

            sizeSelect.style.display = "inline-block";
        }


        /* =========================
           COLOR
           ========================= */

        if (
            item.useColors === true &&
            commonColors.length > 0
        ) {

            commonColors.forEach(function (color) {

                const option =
                    document.createElement("option");

                option.value = color;
                option.textContent = color;

                colorSelect.appendChild(option);

            });

            colorSelect.style.display = "inline-block";
        }

    });
}

function updateHomeItemOptions(select) {

    const roomPoints =
        select.closest(".room-points");

    if (!roomPoints) return;

    const item =
        electricalData[Number(select.value)];

    if (!item) return;


    const sizeSelect =
        roomPoints.querySelector(".home-size-select");

    const colorSelect =
        roomPoints.querySelector(".home-color-select");

    const sizeLabel =
        roomPoints.querySelector(".home-size-label");

    const colorLabel =
        roomPoints.querySelector(".home-color-label");


    if (!sizeSelect || !colorSelect) return;


    /* ==========================================
       RESET
       ========================================== */

    sizeSelect.innerHTML =
        `<option value="">Select</option>`;

    colorSelect.innerHTML =
        `<option value="">Select Color</option>`;

    sizeSelect.style.display = "none";
    colorSelect.style.display = "none";

    if (sizeLabel)
        sizeLabel.style.display = "none";

    if (colorLabel)
        colorLabel.style.display = "none";


    /* ==========================================
       AMP / SIZE
       sizes இருந்தால் மட்டும் SHOW
       ========================================== */

    if (
        Array.isArray(item.sizes) &&
        item.sizes.length > 0
    ) {

        item.sizes.forEach(function (size) {

            const option =
                document.createElement("option");

            option.value = size;
            option.textContent = size;

            sizeSelect.appendChild(option);
        });

        sizeSelect.style.display = "block";
    }


    /* ==========================================
       COLOR
       useColors:true இருந்தால் மட்டும் SHOW
       ========================================== */

    if (
        item.useColors === true &&
        commonColors.length > 0
    ) {

        commonColors.forEach(function (color) {

            const option =
                document.createElement("option");

            option.value = color;
            option.textContent = color;

            colorSelect.appendChild(option);
        });

        colorSelect.style.display = "block";
    }
}

function addHomePlanningItem(button) {

    // இந்த Add Item எந்த Plate-க்குள் இருக்கிறதோ அந்த Plate-ஐ மட்டும் எடுத்துக்கொள்ளும்
    const plateBox = button.closest(".home-plate-box");

    if (!plateBox) return;

    const plateSelect =
        plateBox.querySelector(".home-plate-select");

    const itemSelect =
        plateBox.querySelector(".home-item-select");

    const sizeSelect =
        plateBox.querySelector(".home-size-select");

    const colorSelect =
        plateBox.querySelector(".home-color-select");

    const qtyInput =
        plateBox.querySelector(".home-item-qty");

    const plate =
        Number(plateSelect.value);

    const item =
        electricalData[Number(itemSelect.value)];

    const qty =
        Number(qtyInput.value) || 0;

    if (!plate) {
        alert("முதலில் Module Plate select பண்ணு.");
        return;
    }

    if (!item) {
        alert("Electrical Item select பண்ணு.");
        return;
    }

    if (qty <= 0) {
        alert("Qty enter பண்ணு.");
        return;
    }

    const size =
        sizeSelect.value;

    const color =
        colorSelect.value;

    const module =
        Number(item.module) || 0;

    const selectedList =
        plateBox.querySelector(".selected-item-list");

    if (!selectedList) return;

    const row =
        document.createElement("div");

    row.className =
        "home-selected-row";

    row.dataset.module =
        String(module * qty);

    row.innerHTML = `
        <span>
            ${item.name}
            ${size ? " • " + size : ""}
            ${color ? " • " + color : ""}
        </span>

        <span>
            Qty ${qty}
        </span>

        <strong>
            ${module > 0 ? (module * qty) + "M" : "-"}
        </strong>

        <button
            type="button"
            onclick="removeHomePlanningItem(this)">
            ×
        </button>
    `;

    selectedList.appendChild(row);

    // இந்த Plate-க்கு மட்டும் calculation
    calculateHomeModules(plateBox);

    updateHomeFinalTotal();

    // Reset
    itemSelect.value = "";

    sizeSelect.innerHTML =
        `<option value="">Select</option>`;

    colorSelect.innerHTML =
        `<option value="">Select Color</option>`;

    colorSelect.style.display = "none";

    qtyInput.value = 0;
}

function addHomePlanningPlate(button) {

    const roomPoints =
        button.closest(".room-points");

    if (!roomPoints) return;

    /* ==========================================
    MINIMIZE PREVIOUS PLATES
    ========================================== */

    const allPlates =
        roomPoints.querySelectorAll(".home-plate-box");

    allPlates.forEach(function (plate) {

        const header =
            plate.querySelector(".plate-header");

        const sections = [
            plate.querySelector(".home-item-selector"),
            plate.querySelector(".home-selected-items"),
            plate.querySelector(".module-calculation")
        ];

        sections.forEach(function (section) {

            if (section) {
                section.style.display = "none";
            }

        });

        if (header) {
            header.style.cursor = "pointer";

            header.onclick = function () {

                sections.forEach(function (section) {

                    if (!section) return;

                    section.style.display =
                        section.style.display === "none"
                            ? ""
                            : "none";

                });

            };
        }

    });

    const platesContainer =
        roomPoints.querySelector(".plates-container");

    if (!platesContainer) return;

    const plateNumber =
        platesContainer.querySelectorAll(".home-plate-box").length + 1;

    const plateBox =
        document.createElement("div");

    plateBox.className =
        "home-plate-box";

    plateBox.innerHTML = `
        <div class="plate-header">
            <strong>Plate ${plateNumber}</strong>
        </div>

        <div class="home-item-selector">

            <label>Module Plate</label>

            <select class="home-plate-select">
                <option value="">Select Plate</option>
            </select>

            <label>Electrical Item</label>

            <select class="home-item-select">
                <option value="">Select Item</option>
            </select>

            <label>Amp / Size</label>

            <select class="home-size-select">
                <option value="">Select</option>
            </select>

            <label>Color</label>

            <select class="home-color-select">
                <option value="">Select Color</option>
            </select>

            <label>Qty</label>

            <input
                type="number"
                min="0"
                value="0"
                class="home-item-qty"
            >

            <button
                type="button"
                class="add-btn"
                onclick="addHomePlanningItem(this)">
                ＋ Add Item
            </button>

        </div>

        <div class="home-selected-items">

            <strong>SELECTED ITEMS</strong>

            <div class="selected-item-list"></div>

        </div>

        <div class="module-calculation">

            <div>
                Plate :
                <strong class="plate-total">
                    0M
                </strong>
            </div>

            <div>
                Used Module :
                <strong class="used-module">
                    0M
                </strong>
            </div>

            <div>
                Blank Module :
                <strong class="blank-module">
                    0M
                </strong>
            </div>

            <div class="module-warning"></div>

        </div>
    `;

    platesContainer.appendChild(plateBox);

    const newPlateSections = [
        plateBox.querySelector(".home-item-selector"),
        plateBox.querySelector(".home-selected-items"),
        plateBox.querySelector(".module-calculation")
    ];

    newPlateSections.forEach(function (section) {

        if (section) {
            section.style.display = "";
        }

    });

    const newPlateHeader =
        plateBox.querySelector(".plate-header");

    if (newPlateHeader) {

        newPlateHeader.style.cursor = "pointer";

        newPlateHeader.onclick = function () {

            newPlateSections.forEach(function (section) {

                if (!section) return;

                section.style.display =
                    section.style.display === "none"
                        ? ""
                        : "none";

            });

        };

    }

    updateHomeFinalTotal();



    /* =====================================================
       1. MODULE PLATE
       electrical.json → "Modular Plate"
       ===================================================== */

    const plateSelect =
        plateBox.querySelector(".home-plate-select");

    const modularPlate =
        electricalData.find(function (item) {
            return item.name === "Modular Plate";
        });

    if (modularPlate && Array.isArray(modularPlate.sizes)) {

        modularPlate.sizes.forEach(function (size) {

            const option =
                document.createElement("option");

            /*
             * Example:
             * 1M     → 1
             * 2M     → 2
             * 4M     → 4
             * 8M H   → 8
             * 8M SQ  → 8
             */

            const moduleValue =
                parseInt(size);

            option.value =
                moduleValue;

            option.textContent =
                size;

            plateSelect.appendChild(option);
        });
    }


    /* =====================================================
       2. ELECTRICAL ITEMS
       electrical.json-லிருந்து மட்டும்
       Module உள்ள items மட்டும் Plate-க்குள் வரும்
       ===================================================== */

    const itemSelect =
        plateBox.querySelector(".home-item-select");

    electricalData.forEach(function (item, index) {

        /*
         * Modular Plate-ஐ Electrical Item list-ல் காட்ட வேண்டாம்.
         *
         * module > 0 உள்ள items மட்டும்
         * plate-க்குள் பயன்படுத்தப்படும்.
         */

        if (
            item.name === "Modular Plate" ||
            !(Number(item.module) > 0)
        ) {
            return;
        }

        const option =
            document.createElement("option");

        option.value =
            index;

        option.textContent =
            item.name;

        itemSelect.appendChild(option);
    });


    /* =====================================================
       3. ITEM SELECT CHANGE
       Amp / Size / Color
       ===================================================== */

    itemSelect.addEventListener(
        "change",
        function () {

            updateHomeItemOptions(this);

        }
    );


    /* =====================================================
       4. PLATE CHANGE
       Plate select செய்தவுடன் calculation
       ===================================================== */

    plateSelect.addEventListener(
        "change",
        function () {

            calculateHomeModules(plateBox);

        }
    );
}

function toggleHomePlate(plateBox) {

    if (!plateBox) return;

    const sections = [
        plateBox.querySelector(".home-item-selector"),
        plateBox.querySelector(".home-selected-items"),
        plateBox.querySelector(".module-calculation")
    ];

    const isOpen =
        sections.some(function (section) {
            return section && section.style.display !== "none";
        });


    /* மற்ற எல்லா plates-ஐ minimize */
    document.querySelectorAll(".home-plate-box").forEach(function (plate) {

        if (plate === plateBox) return;

        const otherSections = [
            plate.querySelector(".home-item-selector"),
            plate.querySelector(".home-selected-items"),
            plate.querySelector(".module-calculation")
        ];

        otherSections.forEach(function (section) {

            if (section) {
                section.style.display = "none";
            }

        });

    });


    /* இந்த plate open / close */
    sections.forEach(function (section) {

        if (!section) return;

        section.style.display =
            isOpen ? "none" : "";

    });


    /* Final total refresh */
    updateHomeFinalTotal();
}

function calculateHomeModules(plateBox) {

    if (!plateBox) return;

    const plateSelect =
        plateBox.querySelector(".home-plate-select");

    if (!plateSelect) return;

    const plate =
        Number(plateSelect.value) || 0;

    const rows =
        plateBox.querySelectorAll(".home-selected-row");

    let used = 0;

    rows.forEach(function (row) {
        used += Number(row.dataset.module) || 0;
    });

    const blank =
        Math.max(plate - used, 0);

    const calculation =
        plateBox.querySelector(".module-calculation");

    if (!calculation) return;

    calculation.innerHTML = `
        <div>
            Plate :
            <strong>${plate}M</strong>
        </div>

        <div>
            Used Module :
            <strong>${used}M</strong>
        </div>

        <div>
            Blank Module :
            <strong>${blank}M</strong>
        </div>

        ${used > plate
            ? `
                    <div class="module-warning">
                        ⚠ Module capacity exceeded by ${used - plate}M
                    </div>
                `
            : ""
        }
    `;
}

function updateHomeFinalTotal() {

    const finalBox =
        document.getElementById("homeFinalTotal");

    if (!finalBox) return;

    const totals = {};

    /* ==============================
   MODULE PLATES
   ============================== */

    document.querySelectorAll(".home-plate-box").forEach(function (plateBox) {

        const plateSelect =
            plateBox.querySelector(".home-plate-select");

        if (!plateSelect || !plateSelect.value) return;

        const plateName =
            plateSelect.options[
                plateSelect.selectedIndex
            ]?.textContent.trim();

        if (!plateName) return;

        const key =
            plateName + " Modular Plate";

        totals[key] =
            (totals[key] || 0) + 1;

    });

    // ==============================
    // ROOM BASIC ITEMS
    // ==============================

    document.querySelectorAll(".room-points").forEach(function (roomPoints) {

        const selects = [
            ".room-fan-select",
            ".room-light-select",
            ".room-round-sheet-select"
        ];

        selects.forEach(function (selector) {

            const select =
                roomPoints.querySelector(selector);

            if (!select) return;

            const index =
                Number(select.value);

            const item =
                electricalData[index];

            if (!item) return;

            const qtyInput =
                select.parentElement.querySelector(
                    'input[type="number"]'
                );

            const qty =
                Number(qtyInput?.value) || 0;

            if (qty <= 0) return;

            const key =
                item.name;

            totals[key] =
                (totals[key] || 0) + qty;

        });

    });


    // ==============================
    // PLATE ITEMS
    // ==============================

    document.querySelectorAll(
        ".home-selected-row"
    ).forEach(function (row) {

        const text =
            row.querySelector("span")?.textContent.trim();

        if (!text) return;

        const qtyText =
            row.querySelectorAll("span")[1]?.textContent || "";

        const match =
            qtyText.match(/Qty\s+(\d+)/i);

        const qty =
            match ? Number(match[1]) : 0;

        if (qty <= 0) return;

        // Item name மட்டும் எடுக்க
        const itemName =
            text.split("•")[0].trim();

        totals[itemName] =
            (totals[itemName] || 0) + qty;

    });


    // ==============================
    // EMPTY
    // ==============================

    if (Object.keys(totals).length === 0) {

        finalBox.innerHTML = `
            <div class="final-empty">
                No items added
            </div>
        `;

        return;
    }


    // ==============================
    // GROUP BY CATEGORY
    // ==============================

    const categories = {

        "Switches": [
            "Switch"
        ],

        "Sockets": [
            "Socket",
            "Plug"
        ],

        "Lights": [
            "Light",
            "Bulb",
            "Tube"
        ],

        "Holders": [
            "Holder",
            "Ceiling Rose"
        ],

        "Protection": [
            "MCB",
            "RCCB",
            "Fuse",
            "Main Switch"
        ],

        "Conduit": [
            "Conduit",
            "Elbow",
            "Bend",
            "Tee",
            "Coupling",
            "Junction Box"
        ],

        "Wires & Accessories": [
            "Wire",
            "Tape",
            "Cement"
        ]

    };


    let html = "";


    Object.keys(categories).forEach(function (category) {

        const items = Object.keys(totals).filter(function (name) {

            const lower =
                name.toLowerCase();

            return categories[category].some(function (keyword) {

                return lower.includes(
                    keyword.toLowerCase()
                );

            });

        });


        if (items.length === 0) return;


        html += `
            <div class="final-category">

                <h3>
                    ${category}
                </h3>
        `;


        items.forEach(function (name) {

            html += `
                <div class="final-total-row">

                    <span>
                        ${name}
                    </span>

                    <strong>
                        Total: ${totals[name]}
                    </strong>

                </div>
            `;

        });


        html += `
            </div>
        `;

    });


    // ==============================
    // OTHER ITEMS
    // ==============================

    const knownItems =
        Object.keys(categories)
            .flatMap(function (category) {
                return categories[category];
            });


    const otherItems =
        Object.keys(totals).filter(function (name) {

            const lower =
                name.toLowerCase();

            return !knownItems.some(function (keyword) {

                return lower.includes(
                    keyword.toLowerCase()
                );

            });

        });


    if (otherItems.length > 0) {

        html += `
            <div class="final-category">

                <h3>
                    Other
                </h3>
        `;


        otherItems.forEach(function (name) {

            html += `
                <div class="final-total-row">

                    <span>
                        ${name}
                    </span>

                    <strong>
                        Total: ${totals[name]}
                    </strong>

                </div>
            `;

        });


        html += `
            </div>
        `;
    }


    finalBox.innerHTML = html;
}

function removeHomePlanningItem(button) {

    const row =
        button.closest(".home-selected-row");

    const plateBox =
        button.closest(".home-plate-box");

    if (row) {
        row.remove();
    }

    if (plateBox) {
        calculateHomeModules(plateBox);
    }

    updateHomeFinalTotal();
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
   GET SELECTED ITEMS - FINAL
   ========================================================= */

function getSelectedItems(type) {

    const data =
        type === "electrical"
            ? electricalData
            : plumbingData;

    const tbody =
        document.getElementById(type + "Items");

    if (!tbody) {
        return [];
    }

    const rows =
        tbody.querySelectorAll("tr.item-row");

    const selected = [];

    rows.forEach(function (row) {

        const itemIndex =
            Number(row.dataset.itemIndex);

        const item =
            data[itemIndex];

        if (!item) {
            return;
        }

        const qtyInputs =
            row.querySelectorAll(".qty-input");


        /* ==============================================
           NO SIZE ITEM
           ============================================== */

        if (
            !Array.isArray(item.sizes) ||
            item.sizes.length === 0
        ) {

            qtyInputs.forEach(function (input) {

                const qty =
                    parseInt(input.value, 10);

                if (
                    !isNaN(qty) &&
                    qty > 0
                ) {

                    const colorSelect =
                        row.querySelector(
                            ".color-dropdown"
                        );

                    const color =
                        colorSelect
                            ? colorSelect.value
                            : "";

                    selected.push({
                        name: item.name,
                        size: "",
                        color: color,
                        qty: qty
                    });

                }

            });

            return;
        }


        /* ==============================================
           SIZE ITEM
           ============================================== */

        qtyInputs.forEach(function (input) {

            const qty =
                parseInt(input.value, 10);

            if (
                isNaN(qty) ||
                qty <= 0
            ) {
                return;
            }


            const sizeEntry =
                input.closest(".size-entry");

            if (!sizeEntry) {
                return;
            }


            const sizeSelect =
                sizeEntry.querySelector(
                    ".size-dropdown"
                );


            const customInput =
                sizeEntry.querySelector(
                    ".custom-size-input"
                );


            if (!sizeSelect) {
                return;
            }


            /* CUSTOM SIZE */

            if (
                sizeSelect.value === "__CUSTOM__"
            ) {

                const customSize =
                    customInput
                        ? customInput.value.trim()
                        : "";

                if (customSize === "") {
                    return;
                }

                const colorSelect =
                    row.querySelector(
                        ".color-dropdown"
                    );

                const color =
                    colorSelect
                        ? colorSelect.value
                        : "";

                selected.push({
                    name: item.name,
                    size: "customSize",
                    color: color,
                    qty: qty
                });

                return;
            }


            /* NORMAL SIZE */

            const size =
                sizeSelect.value;

            if (size === "") {
                return;
            }

            const colorSelect =
                sizeEntry.querySelector(
                    ".color-dropdown"
                );

            const color =
                colorSelect
                    ? colorSelect.value
                    : "";

            selected.push({
                name: item.name,
                size: size,
                color: color,
                qty: qty
            });

        });

    });


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
   ORDER ID
   ========================================================= */

function getNextOrderId(type) {

    const key =
        type === "electrical"
            ? "mvsElectricalOrderNo"
            : "mvsPlumbingOrderNo";

    let number =
        Number(
            localStorage.getItem(key) || "1000"
        );

    number++;

    localStorage.setItem(
        key,
        String(number)
    );

    const prefix =
        type === "electrical"
            ? "MVS-E"
            : "MVS-P";

    return prefix + number;
}


/* =========================================================
   SAVE ORDER - LOCAL STORAGE
   ========================================================= */

function saveOrder(type) {

    const customer =
        getCustomerDetails(type);

    const selected =
        getSelectedItems(type);


    /* ==============================================
       QTY CHECK
       ============================================== */

    if (
        !Array.isArray(selected) ||
        selected.length === 0
    ) {

        alert(
            "தயவுசெய்து குறைந்தது ஒரு பொருளுக்காவது Qty உள்ளிடவும்."
        );

        return;
    }


    /* ==============================================
       CREATE ORDER
       ============================================== */

    const order = {

        orderId:
            getNextOrderId(type),

        type:
            type,

        customer:
            customer,

        items:
            selected,

        createdAt:
            new Date().toISOString()

    };


    /* ==============================================
       GET OLD ORDERS
       ============================================== */

    let oldOrders = [];

    try {

        oldOrders =
            JSON.parse(
                localStorage.getItem(
                    "mvsOrders"
                ) || "[]"
            );

        if (
            !Array.isArray(oldOrders)
        ) {
            oldOrders = [];
        }

    } catch (error) {

        console.error(
            "mvsOrders corrupted:",
            error
        );

        oldOrders = [];
    }


    /* ==============================================
       ADD NEW ORDER
       ============================================== */

    oldOrders.push(order);


    /* ==============================================
       SAVE
       ============================================== */

    try {

        localStorage.setItem(
            "mvsOrders",
            JSON.stringify(oldOrders)
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


            if (item.color) {

                message +=
                    " - " +
                    item.color;
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

    rows.forEach(function (row) {

        const text =
            row.textContent.toLowerCase();

        const inputs =
            row.querySelectorAll(".qty-input");

        let hasQty = false;

        inputs.forEach(function (input) {

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

    inputs.forEach(function (input) {
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
        .forEach(function (row) {

            row.style.display = "";

            row.classList.remove(
                "selected-row"
            );

        });

    calculateTotal(type);
}
function showHistory() {
    let orders = [];

    try {
        orders = JSON.parse(
            localStorage.getItem("mvsOrders") || "[]"
        );
    } catch (error) {
        orders = [];
    }

    let message = "📁 SAVED ORDERS\n\n";

    if (orders.length === 0) {
        message += "No saved orders.";
    } else {
        orders.slice().reverse().forEach(function (order, i) {

            const customer =
                order.customer?.name || "Customer";

            const date =
                order.customer?.date || "-";

            const type =
                order.type === "electrical"
                    ? "⚡ Electrical"
                    : "🚰 Plumbing";

            message +=
                `${i + 1}. ${type}\n` +
                `Customer: ${customer}\n` +
                `Date: ${date}\n\n`;
        });
    }

    alert(message);
}

document.addEventListener("DOMContentLoaded", () => {

    if (
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform()
    ) {
        document.body.classList.add("android-app");
    } else {
        document.body.classList.add("web-app");
    }

});