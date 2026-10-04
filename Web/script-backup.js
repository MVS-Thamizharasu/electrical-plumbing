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
let commonUnits = [];
let currentForm = null;

const SHARED_BASE =
    window.location.pathname.includes("/Web/")
        ? "../shared/"
        : "shared/";



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

    const today =
        new Date().toISOString().split("T")[0];


    const electricalDate =
        document.getElementById("electricalDate");

    const plumbingDate =
        document.getElementById("plumbingDate");

    const homeDate =
        document.getElementById("homeDate");


    /* =========================================
       ELECTRICAL
    ========================================= */

    if (
        electricalDate &&
        !electricalDate.value
    ) {
        electricalDate.value = today;
    }


    /* =========================================
       PLUMBING
    ========================================= */

    if (
        plumbingDate &&
        !plumbingDate.value
    ) {
        plumbingDate.value = today;
    }


    /* =========================================
       HOME PLANNING
    ========================================= */

    if (
        homeDate &&
        !homeDate.value
    ) {
        homeDate.value = today;
    }
}

/* =========================================================
   LOAD JSON FILES
   ========================================================= */

async function loadItems() {

    try {

        // =================================================
        // ELECTRICAL
        // =================================================

        const electricalResponse = await
            fetch(
                `${SHARED_BASE}data/electrical.json`,
                {
                    cache: "no-store"
                }
            );

        if (!electricalResponse.ok) {
            throw new Error(
                "Electrical JSON load failed: " +
                electricalResponse.status
            );
        }

        const electricalJson =
            await electricalResponse.json();

        electricalData =
            electricalJson.items || [];

        commonColors =
            electricalJson.commonColors || [];

        commonUnits =
            electricalJson.commonUnits || [];


        populateFinalElectricalItems();
        setupFinalElectricalOptions();
        setupFinalAddItem();


        // =================================================
        // PLUMBING
        // =================================================

        const plumbingResponse = await
            fetch(
                `${SHARED_BASE}data/plumbing.json`,
                {
                    cache: "no-store"
                }
            );

        if (!plumbingResponse.ok) {
            throw new Error(
                "Plumbing JSON load failed: " +
                plumbingResponse.status
            );
        }

        plumbingData =
            await plumbingResponse.json();


        // =================================================
        // DEBUG
        // =================================================

        console.log(
            "Electrical items:",
            electricalData.length
        );

        console.log(
            "Plumbing items:",
            plumbingData.length
        );


        // =================================================
        // TABLES
        // =================================================

        createTable(
            "electrical",
            electricalData
        );

        createTable(
            "plumbing",
            plumbingData
        );


    } catch (error) {

        console.error(
            "Shared data load error:",
            error
        );

        showLoadError(
            "electricalItems",
            "Electrical items load ஆகவில்லை. shared/data/electrical.json check பண்ணவும்."
        );

        showLoadError(
            "plumbingItems",
            "Plumbing items load ஆகவில்லை. shared/data/plumbing.json check பண்ணவும்."
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


    /*S.No.*/

    const sno =
        document.createElement("td");

    sno.className = "sno";

    sno.textContent = index + 1;


    /*PARTICULARS*/

    const particulars =
        document.createElement("td");

    particulars.className =
        "particulars-cell";


    /*QTY*/

    const qty =
        document.createElement("td");

    qty.className = "qty-cell";


    /*UNIT*/

    const unit =
        document.createElement("td");

    unit.className = "unit-cell";


    /* =====================================================
       ITEM NAME
       ===================================================== */

    const nameDiv =
        document.createElement("div");

    nameDiv.className =
        "item-main-name";

    /* =====================================================
    CUSTOM ITEM
    ===================================================== */

    if (
        String(item.name || "").trim() === "" &&
        item.customSize === true
    ) {
        tr.dataset.customItem = "true";

        /* =====================================================
        CUSTOM ITEM CONTAINERS
        ===================================================== */

        const customItemsContainer =
            document.createElement("div");

        customItemsContainer.className =
            "custom-items-container";


        const customQtyContainer =
            document.createElement("div");

        customQtyContainer.className =
            "custom-item-qty-container";


        const customUnitContainer =
            document.createElement("div");

        customUnitContainer.className =
            "custom-item-unit-container";


        /* =====================================================
        UNIT OPTIONS
        ===================================================== */

        const customUnits =
            commonUnits || [];


        /* =====================================================
        CREATE CUSTOM ITEM
        ===================================================== */

        let customItemIndex = 0;


        function createCustomItem(customIndex) {

            /* =================================================
            CUSTOM ITEM BLOCK
            ================================================= */

            const customBlock =
                document.createElement("div");

            customBlock.className =
                "custom-item-block";

            customBlock.dataset.customIndex =
                String(customIndex);


            /* =================================================
            ITEM NAME
            ================================================= */

            const customNameLabel =
                document.createElement("label");

            customNameLabel.textContent =
                "Item Name";

            customNameLabel.className =
                "custom-item-label";


            const customNameInput =
                document.createElement("input");

            customNameInput.type = "text";

            customNameInput.className =
                "custom-item-name-input";

            customNameInput.placeholder =
                "Type Custom Item Name...";


            customBlock.appendChild(
                customNameLabel
            );

            customBlock.appendChild(
                customNameInput
            );


            /* =================================================
            AMP / SIZE
            ================================================= */

            const customSizeLabel =
                document.createElement("label");

            customSizeLabel.textContent =
                type === "electrical"
                    ? "Amp / Size"
                    : "Size";

            customSizeLabel.className =
                "custom-item-label";


            const customSizeInput =
                document.createElement("input");

            customSizeInput.type = "text";

            customSizeInput.className =
                "custom-item-size-input";

            customSizeInput.placeholder =
                "Type Custom Size / Rating...";


            customBlock.appendChild(
                customSizeLabel
            );

            customBlock.appendChild(
                customSizeInput
            );


            /* =================================================
            COLOR
            ================================================= */

            const customColorLabel =
                document.createElement("label");

            customColorLabel.textContent =
                "Color";

            customColorLabel.className =
                "custom-item-label";


            const customColorSelect =
                document.createElement("select");

            customColorSelect.className =
                "color-dropdown";


            const customColorDefault =
                document.createElement("option");

            customColorDefault.value = "";

            customColorDefault.textContent =
                "Select Color";


            customColorSelect.appendChild(
                customColorDefault
            );


            /* COMMON COLORS */

            if (
                item.useColors === true &&
                Array.isArray(commonColors) &&
                commonColors.length > 0
            ) {

                commonColors.forEach(function (color) {

                    const option =
                        document.createElement("option");

                    option.value = color;

                    option.textContent = color;

                    customColorSelect.appendChild(
                        option
                    );

                });
            }


            /* ADD CUSTOM BLOCK */

            customItemsContainer.appendChild(
                customBlock
            );


            /* =================================================
            QTY
            ================================================= */

            const customQty =
                createQtyInput(
                    type,
                    index,
                    "custom-item-" + customIndex
                );

            customQty.value = "";

            customQty.dataset.customIndex =
                String(customIndex);


            customQtyContainer.appendChild(
                customQty
            );


            /* =================================================
            UNIT
            ================================================= */

            const customUnit =
                document.createElement("select");

            customUnit.className =
                "unit-dropdown";

            customUnit.dataset.customIndex =
                String(customIndex);


            /* DEFAULT OPTION */

            const customDefaultUnit =
                document.createElement("option");

            customDefaultUnit.value = "";

            customDefaultUnit.textContent =
                "Select Unit";

            customDefaultUnit.selected = true;


            customUnit.appendChild(
                customDefaultUnit
            );


            /* UNIT OPTIONS */

            customUnits.forEach(function (unitName) {

                const option =
                    document.createElement("option");

                option.value = unitName;

                option.textContent = unitName;

                customUnit.appendChild(
                    option
                );

            });


            customUnitContainer.appendChild(
                customUnit
            );

            /* =================================================
            DELETE CUSTOM ITEM
            ================================================= */

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.textContent = "✕";

            deleteButton.className =
                "delete-custom-item-btn";

            deleteButton.title =
                "Delete this item";


            deleteButton.addEventListener(
                "click",
                function () {

                    /* Delete Item Name + Amp/Size + Color */
                    customBlock.remove();

                    /* Delete matching Qty */
                    customQty.remove();

                    /* Delete matching Unit */
                    customUnit.remove();

                    /* Recalculate total */
                    calculateTotal(type);

                }
            );


            /* =================================================
            COLOR + DELETE ROW
            ================================================= */

            const colorDeleteRow =
                document.createElement("div");

            colorDeleteRow.className =
                "custom-item-color-delete-row";

            colorDeleteRow.appendChild(
                customColorLabel
            );

            colorDeleteRow.appendChild(
                customColorSelect
            );

            colorDeleteRow.appendChild(
                deleteButton
            );

            customBlock.appendChild(
                colorDeleteRow
            );

        }


        /* =====================================================
        FIRST CUSTOM ITEM
        ===================================================== */

        createCustomItem(0);


        /* =====================================================
        ADD ANOTHER ITEM
        ===================================================== */

        const addAnotherItemButton =
            document.createElement("button");

        addAnotherItemButton.type =
            "button";

        addAnotherItemButton.textContent =
            "＋ Add Another Item";

        addAnotherItemButton.className =
            "add-size-btn";


        addAnotherItemButton.addEventListener(
            "click",
            function () {

                customItemIndex++;

                createCustomItem(
                    customItemIndex
                );

            }
        );


        /* =====================================================
        ADD CUSTOM ITEM CONTAINERS
        ===================================================== */

        particulars.appendChild(
            customItemsContainer
        );


        qty.appendChild(
            customQtyContainer
        );


        unit.appendChild(
            customUnitContainer
        );


        particulars.appendChild(
            addAnotherItemButton
        );


        /* =====================================================
        FINAL ROW
        ===================================================== */

        tr.appendChild(sno);

        tr.appendChild(particulars);

        tr.appendChild(qty);

        tr.appendChild(unit);

        return tr;
    }


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
            `${SHARED_BASE}images/electrical/${fileName}.png`,
            `${SHARED_BASE}images/electrical/${fileName}.jpg`,
            `${SHARED_BASE}images/electrical/${fileName}.jpeg`
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

            /* COLOR DROPDOWN + ADD COLOR FOR NO-SIZE ITEMS */

            if (
                item.useColors === true &&
                commonColors.length > 0
            ) {

                const colorContainer =
                    document.createElement("div");

                colorContainer.className =
                    "color-options-container";


                function addColorRow() {

                    const colorEntry =
                        document.createElement("div");

                    colorEntry.className =
                        "color-entry";


                    /* COLOR */

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

                        colorSelect.appendChild(
                            option
                        );

                    });


                    /* REMOVE */

                    const removeButton =
                        document.createElement("button");

                    removeButton.type = "button";

                    removeButton.textContent = "×";

                    removeButton.className =
                        "remove-size-btn";


                    removeButton.addEventListener(
                        "click",
                        function () {

                            colorEntry.remove();
                            colorQty.remove();
                            calculateTotal(type);

                        }
                    );


                    colorEntry.appendChild(
                        colorSelect
                    );

                    colorEntry.appendChild(
                        removeButton
                    );

                    const colorQty =
                        createQtyInput(
                            type,
                            index,
                            null
                        );

                    qty.appendChild(
                        colorQty
                    );

                    colorContainer.appendChild(
                        colorEntry
                    );

                }


                /* FIRST COLOR ROW */

                addColorRow();


                /* ADD COLOR */

                const addColorButton =
                    document.createElement("button");

                addColorButton.type = "button";

                addColorButton.textContent =
                    "+ Add Color";

                addColorButton.className =
                    "add-size-btn";


                addColorButton.addEventListener(
                    "click",
                    function () {

                        addColorRow();

                    }
                );


                particulars.appendChild(
                    colorContainer
                );

                particulars.appendChild(
                    addColorButton
                );

            } else {
                /* ==========================================
                    NORMAL ITEM WITHOUT SIZE
                    QTY + UNIT
                ========================================== */

                const qtyInput =
                    createQtyInput(
                        type,
                        index,
                        null
                    );

                qty.appendChild(
                    qtyInput
                );

                /* UNIT DROPDOWN */

                const unitSelect =
                    document.createElement("select");

                unitSelect.className =
                    "unit-dropdown";

                const defaultOption =
                    document.createElement("option");

                defaultOption.value = "";

                defaultOption.textContent = "Select Unit";

                defaultOption.selected = true;

                unitSelect.appendChild(
                    defaultOption
                );

                /* UNIT OPTIONS */

                commonUnits.forEach(function (unitName) {

                    const option =
                        document.createElement("option");

                    option.value = unitName;
                    option.textContent = unitName;

                    unitSelect.appendChild(
                        option
                    );
                });

                unit.appendChild(
                    unitSelect
                );
            }

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

        /* UNIT DROPDOWN */

        const unitSelect =
            document.createElement("select");

        unitSelect.className =
            "unit-dropdown";

        const unitOptions =
            commonUnits || [];


        /* DEFAULT OPTION */

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Select Unit";
        defaultOption.selected = true;

        unitSelect.appendChild(
            defaultOption
        );


        /* UNIT OPTIONS */

        unitOptions.forEach(function (unit) {

            const option =
                document.createElement("option");

            option.value = unit;
            option.textContent = unit;

            const defaultUnit =
                String(item?.unit || "").trim();

            if (
                defaultUnit &&
                defaultUnit.toLowerCase() ===
                unit.toLowerCase()
            ) {
                option.selected = true;
            }
            unitSelect.appendChild(option);
        });


        unit.appendChild(
            unitSelect
        );


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
    tr.appendChild(unit);


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
   CUSTOM ROW STATE 
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

    localStorage.setItem(
        "mvsCurrentPage",
        type
    );


    /* SCROLL TOP */

    window.scrollTo(
        0,
        0
    );
}

/* =========================================================
   ELECTRICAL ITEM IMAGE
   ========================================================= */

function getElectricalImage(itemName) {

    const fileName = itemName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    return `${SHARED_BASE}images/electrical/${fileName}`;
}

/* =========================================================
   OPEN ITEM IMAGE - MULTI IMAGE CAROUSEL
   ========================================================= */

function openItemImage(imageSrc) {

    let modal =
        document.getElementById("item-image-modal");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "item-image-modal";

        modal.innerHTML = `
            <div class="item-image-overlay">

                <button
                    type="button"
                    class="item-image-close">
                    ×
                </button>

                <button
                    type="button"
                    class="item-image-prev">
                    ‹
                </button>

                <img
                    class="item-large-image"
                    alt="Item Image">

                <button
                    type="button"
                    class="item-image-next">
                    ›
                </button>

                <div class="item-image-dots"></div>

            </div>
        `;

        document.body.appendChild(modal);

        /* =========================================
           CLOSE
        ========================================= */

        modal
            .querySelector(".item-image-close")
            .addEventListener("click", function () {

                modal.style.display = "none";

            });

        /* =========================================
           BACKGROUND CLICK CLOSE
        ========================================= */

        modal
            .querySelector(".item-image-overlay")
            .addEventListener("click", function (event) {

                if (event.target === this) {

                    modal.style.display = "none";

                }

            });

        /* =========================================
           PREVIOUS
        ========================================= */

        modal
            .querySelector(".item-image-prev")
            .addEventListener("click", function (event) {

                event.stopPropagation();

                const images =
                    modal._itemImages || [];

                if (images.length === 0) return;

                modal._currentImage--;

                if (modal._currentImage < 0) {

                    modal._currentImage =
                        images.length - 1;

                }

                showCarouselImage(modal);

            });

        /* =========================================
           NEXT
        ========================================= */

        modal
            .querySelector(".item-image-next")
            .addEventListener("click", function (event) {

                event.stopPropagation();

                const images =
                    modal._itemImages || [];

                if (images.length === 0) return;

                modal._currentImage++;

                if (
                    modal._currentImage >=
                    images.length
                ) {

                    modal._currentImage = 0;

                }

                showCarouselImage(modal);

            });
    }

    /* =========================================
       FIND IMAGE BASE NAME
    ========================================= */

    let cleanPath =
        imageSrc.split("?")[0];

    const extensionMatch =
        cleanPath.match(/\.[^./]+$/);

    if (!extensionMatch) {

        modal._itemImages = [imageSrc];
        modal._currentImage = 0;

        showCarouselImage(modal);

        modal.style.display = "flex";

        return;
    }

    const extension =
        extensionMatch[0];

    const pathWithoutExtension =
        cleanPath.slice(
            0,
            -extension.length
        );

    /*
       If clicked image is:

       20a-geyser-switch-1.png
       20a-geyser-switch-2.png

       Remove the final -number
    */

    const basePath =
        pathWithoutExtension.replace(
            /-\d+$/,
            ""
        );

    /* =========================================
    FIND ALL IMAGES
    ========================================= */

    const imageList = [];

    let imageNumber = 1;


    /* =========================================
    FIRST IMAGE
    Example:
    1-way-switch.png
    ========================================= */

    const baseImage =
        basePath + extension;

    const firstImage =
        new Image();

    firstImage.onload = function () {

        imageList.push(baseImage);

        imageNumber = 1;

        checkNextImage();
    };

    firstImage.onerror = function () {

        imageNumber = 1;

        checkNextImage();
    };

    firstImage.src =
        baseImage;


    /* =========================================
    FIND NUMBERED IMAGES
    Example:
    1-way-switch-1.png
    1-way-switch-2.png
    1-way-switch-3.png
    ========================================= */

    function checkNextImage() {

        if (imageNumber > 100) {

            finishCarousel();

            return;
        }

        const testImage =
            new Image();

        const currentPath =
            basePath +
            "-" +
            imageNumber +
            extension;

        testImage.onload = function () {

            imageList.push(
                currentPath
            );

            imageNumber++;

            checkNextImage();
        };

        testImage.onerror = function () {

            // Image இல்லை என்றாலும்
            // search நிறுத்தக்கூடாது.
            // அடுத்த number-ஐ தொடர்ந்து check செய்ய வேண்டும்.

            imageNumber++;

            checkNextImage();
        };

        testImage.src =
            currentPath;
    }


    /* =========================================
    FINISH CAROUSEL
    ========================================= */

    function finishCarousel() {

        /*
        If no image exists,
        show clicked image
        */

        if (imageList.length === 0) {

            imageList.push(
                imageSrc
            );
        }

        modal._itemImages =
            imageList;


        /* =========================================
        FIND CLICKED IMAGE
        ========================================= */

        const clickedIndex =
            imageList.indexOf(
                cleanPath
            );

        if (clickedIndex >= 0) {

            modal._currentImage =
                clickedIndex;

        } else {

            modal._currentImage = 0;
        }


        showCarouselImage(modal);

        modal.style.display =
            "flex";
    }


    checkNextImage();


    /* =========================================
       CAROUSEL IMAGE DISPLAY
    ========================================= */

    function showCarouselImage(modal) {

        const images =
            modal._itemImages || [];

        if (images.length === 0) return;

        const current =
            modal._currentImage || 0;

        const largeImage =
            modal.querySelector(
                ".item-large-image"
            );

        largeImage.src =
            images[current];


        /* =========================================
        DOTS
        ========================================= */

        const dots =
            modal.querySelector(
                ".item-image-dots"
            );

        dots.innerHTML = "";

        images.forEach(function (image, index) {

            const dot =
                document.createElement("span");

            dot.textContent =
                index === current
                    ? "●"
                    : "○";

            dot.style.cssText = `
                font-size: 16px;
                cursor: pointer;
                margin: 0 3px;
            `;

            dot.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    modal._currentImage =
                        index;

                    showCarouselImage(modal);
                }
            );

            dots.appendChild(dot);

        });


        /* =========================================
        ARROWS
        ========================================= */

        const previousButton =
            modal.querySelector(
                ".item-image-prev"
            );

        const nextButton =
            modal.querySelector(
                ".item-image-next"
            );


        if (images.length <= 1) {

            previousButton.style.display =
                "none";

            nextButton.style.display =
                "none";

            dots.style.display =
                "none";

        } else {

            previousButton.style.display =
                "flex";

            nextButton.style.display =
                "flex";

            dots.style.display =
                "flex";
        }
    }


    /* =========================================
       MODAL STYLE
    ========================================= */

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.75);
        z-index: 99999;
        padding: 30px;
    `;

    const overlay =
        modal.querySelector(
            ".item-image-overlay"
        );

    overlay.style.cssText = `
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 90vw;
        height: 90vh;
    `;

    const largeImage =
        modal.querySelector(
            ".item-large-image"
        );

    largeImage.style.cssText = `
        display: block;
        max-width: 75vw;
        max-height: 80vh;
        width: auto;
        height: auto;
        object-fit: contain;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.45);
    `;

    /* =========================================
       CLOSE BUTTON
    ========================================= */

    const closeButton =
        modal.querySelector(
            ".item-image-close"
        );

    closeButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: #ef4444;
        color: #ffffff;
        font-size: 28px;
        line-height: 40px;
        cursor: pointer;
        z-index: 100002;
    `;

    /* =========================================
       PREVIOUS BUTTON
    ========================================= */

    const previousButton =
        modal.querySelector(
            ".item-image-prev"
        );

    previousButton.style.cssText = `
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 60px;
        border: none;
        border-radius: 8px;
        background: rgba(0,0,0,0.55);
        color: #ffffff;
        font-size: 45px;
        line-height: 50px;
        cursor: pointer;
        z-index: 100001;
    `;

    /* =========================================
       NEXT BUTTON
    ========================================= */

    const nextButton =
        modal.querySelector(
            ".item-image-next"
        );

    nextButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 50px;
        height: 60px;
        border: none;
        border-radius: 8px;
        background: rgba(0,0,0,0.55);
        color: #ffffff;
        font-size: 45px;
        line-height: 50px;
        cursor: pointer;
        z-index: 100001;
    `;

    /* =========================================
       IMAGE COUNTER
    ========================================= */

    counter.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px 14px;
        border-radius: 20px;
        background: rgba(0,0,0,0.65);
        color: #ffffff;
        font-size: 14px;
        font-weight: 600;
        z-index: 100001;
    `;
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


    const homePlanning =
        document.getElementById(
            "homePlanning"
        );

    if (homePlanning) {

        homePlanning.style.display =
            "none";

    }


    currentForm = null;

    localStorage.setItem(
        "mvsCurrentPage",
        "homePage"
    );

    window.scrollTo(
        0,
        0
    );
}

/* =========================================================
   OPEN HOME PLANNING
   ========================================================= */

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

    /* INITIAL FLOORS */

    const floorList =
        document.getElementById("floorList");

    if (floorList) {

        const existingFloors =
            floorList.querySelectorAll(
                ".home-floor"
            );

        /* FIRST OPEN */

        if (existingFloors.length === 0) {

            createFloorCard(
                "Ground Floor",
                floorList
            );

            createFloorCard(
                "Terrace",
                floorList
            );
        }
    }


    window.scrollTo(
        0,
        0
    );
}

/* =========================================================
   HOME PLANNING - ADD FLOOR
   ========================================================= */

function addFloor() {

    const floorList =
        document.getElementById("floorList");

    if (!floorList) return;


    const floorNames = [
        "Ground Floor",
        "First Floor",
        "Second Floor",
        "Third Floor",
        "Fourth Floor",
        "Fifth Floor",
        "Sixth Floor",
        "Seventh Floor",
        "Eighth Floor",
        "Ninth Floor",
        "Tenth Floor"
    ];


    const normalFloors =
        [...floorList.querySelectorAll(".home-floor")]
            .filter(
                floor =>
                    floor.dataset.floorName !== "Terrace"
            );


    const terrace =
        floorList.querySelector(
            '[data-floor-name="Terrace"]'
        );


    // Next floor
    const nextNumber =
        normalFloors.length + 1;


    const nextFloorName =
        getOrdinalFloorName(nextNumber);


    // Terrace temporarily remove
    if (terrace) {
        terrace.remove();
    }


    // Add new floor
    createFloorCard(
        nextFloorName,
        floorList
    );


    // Terrace always last
    if (terrace) {
        floorList.appendChild(terrace);
    } else {
        createFloorCard(
            "Terrace",
            floorList
        );
    }
}

/* =========================================================
   HOME PLANNING - FLOOR STATS
   ========================================================= */

function updateFloorStats(floor) {

    if (!floor) return;

    const roomCount =
        floor.querySelectorAll(".room-box").length;

    const stats =
        floor.querySelector(".floor-stats");

    if (!stats) return;

    stats.textContent =
        `${roomCount} Room${roomCount !== 1 ? "s" : ""} • 0 Items`;
}

/* =========================================================
   HOME PLANNING - DELETE FLOOR
   ========================================================= */

function deleteFloor(button) {

    const floorList =
        document.getElementById("floorList");

    const floor =
        button.closest(".home-floor");

    if (!floorList || !floor) return;


    // Delete selected floor
    floor.remove();


    // Get normal floors only
    const normalFloors =
        [...floorList.querySelectorAll(".home-floor")]
            .filter(
                floor =>
                    floor.dataset.floorName !== "Terrace"
            );


    // Rename normal floors in correct order
    normalFloors.forEach(
        (floor, index) => {

            const floorName =
                getOrdinalFloorName(index + 1);


            floor.dataset.floorName =
                floorName;


            const nameElement =
                floor.querySelector(
                    ".floor-text strong"
                );


            if (nameElement) {
                nameElement.textContent =
                    floorName;
            }
        }
    );


    // Keep Terrace last
    const terrace =
        floorList.querySelector(
            '[data-floor-name="Terrace"]'
        );


    if (terrace) {

        terrace.dataset.floorName =
            "Terrace";


        const terraceName =
            terrace.querySelector(
                ".floor-text strong"
            );


        if (terraceName) {
            terraceName.textContent =
                "Terrace";
        }


        floorList.appendChild(
            terrace
        );
    }
}

/* =========================================================
   HOME PLANNING - FLOOR NAME
   ========================================================= */

function getOrdinalFloorName(number) {

    const names = [
        "Ground Floor",
        "First Floor",
        "Second Floor",
        "Third Floor",
        "Fourth Floor",
        "Fifth Floor",
        "Sixth Floor",
        "Seventh Floor",
        "Eighth Floor",
        "Ninth Floor",
        "Tenth Floor"
    ];

    return names[number - 1] || `Floor ${number}`;
}

/* =========================================================
   HOME PLANNING - CREATE FLOOR CARD
   ========================================================= */

function createFloorCard(floorName, floorList) {

    const floor = document.createElement("div");

    floor.className = "home-floor";

    floor.dataset.floorName = floorName;

    floor.innerHTML = `

        <div class="floor-header">

            <div class="floor-main-info">

                <div class="floor-icon">
                    🏠
                </div>

                <div class="floor-text">

                    <strong>
                        ${floorName}
                    </strong>

                    <span class="floor-stats">
                        0 Rooms&nbsp;&nbsp;•&nbsp;&nbsp;0 Items
                    </span>

                </div>

            </div>


            <div class="floor-actions">

                <button
                    type="button"
                    class="floor-edit-btn"
                    onclick="editFloor(this)">
                    ✎
                </button>

                <button
                    type="button"
                    class="floor-delete-btn"
                    onclick="deleteFloor(this)">
                    🗑
                </button>

            </div>

        </div>


        <div class="room-list"></div>


        <button
            type="button"
            class="floor-add-room-btn"
            onclick="addRoom(this)">
            ＋ Add Room
        </button>

    `;

    floorList.appendChild(floor);
}

/* =========================================================
   HOME PLANNING - ROOM NAMES
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - ADD ROOM
   ========================================================= */

function addRoom(button) {

    const floor =
        button.closest(".home-floor");

    if (!floor) return;


    const roomList =
        floor.querySelector(".room-list");

    if (!roomList) return;


    /*
     * ஏற்கனவே empty room selector இருந்தால்
     * புதியது உருவாக்க வேண்டாம்.
     */
    const existingEmptyRoom =
        roomList.querySelector(
            ".room-box .room-dropdown"
        );


    if (existingEmptyRoom) {

        existingEmptyRoom.focus();

        return;
    }


    /*
     * புதிய room box
     */
    const roomBox =
        document.createElement("div");

    roomBox.className =
        "room-box";


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

    `;


    roomList.appendChild(roomBox);


    /*
     * புதிய input-க்கு focus
     */
    const input =
        roomBox.querySelector(
            ".room-dropdown"
        );

    if (input) {
        input.focus();
    }
}

/* =========================================================
   HOME PLANNING - ROOM SEARCH
   ========================================================= */

function showRoomNames(input) {
    searchRoomNames(input, false);
}

function searchRoomNames(input, showAll = true) {

    const wrap =
        input.closest(".room-search-wrap");

    if (!wrap) return;


    const suggestions =
        wrap.querySelector(".room-suggestions");

    if (!suggestions) return;


    /* மற்ற room suggestions அனைத்தையும் close செய்யும் */
    document
        .querySelectorAll(".room-suggestions")
        .forEach(box => {

            if (box !== suggestions) {
                box.innerHTML = "";
                box.style.display = "none";
            }

        });


    const text =
        input.value.trim().toLowerCase();


    const filtered =
        text
            ? roomNames.filter(name =>
                name.toLowerCase().includes(text)
            )
            : roomNames;


    suggestions.innerHTML = "";


    filtered.forEach(name => {

        const item =
            document.createElement("div");

        item.className =
            "room-suggestion-item";

        item.textContent =
            name;


        item.onclick = function () {

            input.value =
                name;

            suggestions.innerHTML = "";

            suggestions.style.display =
                "none";


            createSelectedRoom(input);

        };


        suggestions.appendChild(item);

    });


    suggestions.style.display =
        filtered.length
            ? "block"
            : "none";
}

/* =========================================================
   HOME PLANNING - SELECT ROOM
   ========================================================= */

function createSelectedRoom(select) {

    const roomBox =
        select.closest(".room-box");

    if (!roomBox) return;


    const roomName =
        select.value.trim();

    if (!roomName) return;


    let finalName =
        roomName;


    /* =========================================
       REPEATED ROOM TYPES
    ========================================= */

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


    /* =========================================
       AUTO NUMBERING
    ========================================= */

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


    /* =========================================
       SAVE ROOM DATA
    ========================================= */

    roomBox.dataset.roomType =
        roomName;

    roomBox.dataset.roomName =
        finalName;


    /* =========================================
       CREATE CLEAN ROOM ROW
    ========================================= */

    roomBox.innerHTML = `

        <div class="room-select-row">

            <div class="room-name-info">

                <strong class="selected-room-name">
                    ${finalName}
                </strong>

                <span class="room-item-count">
                    0 Items
                </span>

            </div>


            <button
                type="button"
                class="open-room-btn"
                onclick="openRoomPoints(this)">
                Open Room
            </button>


            <button
                type="button"
                class="delete-room-btn"
                onclick="deleteRoom(this)"
                title="Remove Room">
                🗑
            </button>

        </div>


        <div class="room-points"></div>

    `;


    /* =========================================
       UPDATE FLOOR STATS
    ========================================= */

    const floor =
        roomBox.closest(".home-floor");

    if (floor) {
        updateFloorStats(floor);
    }
}

/* =========================================================
   HOME PLANNING - DELETE ROOM
   ========================================================= */

function deleteRoom(button) {

    const roomBox =
        button.closest(".room-box");

    if (!roomBox) return;

    const floor =
        roomBox.closest(".home-floor");

    roomBox.remove();

    if (floor) {
        updateFloorStats(floor);
    }
}

/* =========================================================
   HOME PLANNING - OPEN ROOM
   ========================================================= */

function openRoomPoints(button) {

    const roomBox = button.closest(".room-box");

    if (!roomBox) return;


    const roomPoints =
        roomBox.querySelector(".room-points");

    if (!roomPoints) return;


    const roomName =
        roomBox.dataset.roomName || "Room";


    /* Already open என்றால் எதுவும் செய்ய வேண்டாம் */

    if (document.querySelector(".room-modal-overlay")) {
        return;
    }


    /* =========================================
       CREATE OVERLAY
    ========================================= */

    const overlay =
        document.createElement("div");

    overlay.className =
        "room-modal-overlay";


    /* =========================================
       CREATE MODAL
    ========================================= */

    const modal =
        document.createElement("div");

    modal.className =
        "room-modal";


    modal.innerHTML = `

        <div class="room-modal-header">

            <div class="room-modal-title">

                <div class="room-modal-icon">
                    🏠
                </div>

                <div>

                    <strong>
                        ${roomName}
                    </strong>

                    <span>
                        Add electrical items for this room
                    </span>

                </div>

            </div>


            <button
                type="button"
                class="room-modal-close"
                onclick="closeRoomModal()">

                ✕

            </button>

        </div>


        <div class="room-modal-body"></div>


        <div class="room-modal-footer">

            <button
                type="button"
                class="room-close-btn"
                onclick="closeRoomModal()">

                ✕ Close

            </button>


            <button
                type="button"
                class="room-done-btn"
                onclick="closeRoomModal()">

                ✓ Done

            </button>

        </div>

    `;


    const body =
        modal.querySelector(".room-modal-body");


    /* =========================================
    SAVE ORIGINAL ROOM BOX
    ========================================= */

    roomPoints._originalRoomBox = roomBox;
    roomPoints._roomBox = roomBox;


    /* =========================================
    MOVE ROOM CONTENT INTO MODAL
    ========================================= */

    body.appendChild(roomPoints);


    /* =========================================
       FIRST TIME CONTENT
    ========================================= */

    if (roomPoints.innerHTML.trim() === "") {

        roomPoints.innerHTML = `

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
                        class="room-fan-qty">

                </div>

                <div class="room-extra-fans"></div>

                <div class="basic-item-add-row">

                    <button
                        type="button"
                        class="add-fan-btn"
                        onclick="addRoomFan(this)">
                        + Add Fan
                    </button>

                </div>


                <div class="room-extra-fans"></div>


                <div class="basic-item-row">

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
                        class="room-light-qty">

                </div>

                <div class="room-extra-lights"></div>

                <div class="basic-item-add-row">

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
                        class="room-round-sheet-qty">

                </div>

                <div class="room-extra-round-sheets"></div>

                <div class="basic-item-add-row">

                    <button
                        type="button"
                        class="add-round-sheet-btn"
                        onclick="addRoomRoundSheet(this)">
                        + Add Round Sheet
                    </button>

                </div>


                <div class="room-extra-round-sheets"></div>


                <div class="basic-item-row">

                    <label>Ceiling Rose</label>

                    <select class="room-ceiling-rose-select">

                        <option value="">
                            Select Ceiling Rose
                        </option>

                    </select>

                    <input
                        type="number"
                        min="0"
                        value="0"
                        class="room-ceiling-rose-qty">

                </div>

                <div class="room-extra-ceiling-roses"></div>

                <div class="basic-item-add-row">

                    <button
                        type="button"
                        class="add-ceiling-rose-btn"
                        onclick="addRoomCeilingRose(this)">
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

    }


    /* =========================================
       SHOW MODAL
    ========================================= */

    overlay.appendChild(modal);

    document.body.appendChild(overlay);


    overlay.style.display = "flex";

    modal.style.display = "flex";


    document.body.classList.add(
        "room-modal-open"
    );
}

/* =========================================================
   HOME PLANNING - CLOSE ROOM MODAL
   ========================================================= */

function closeRoomModal() {

    const overlay =
        document.querySelector(".room-modal-overlay");

    if (!overlay) return;

    const modal =
        overlay.querySelector(".room-modal");

    if (!modal) {
        overlay.remove();
        document.body.classList.remove("room-modal-open");
        return;
    }

    const roomPoints =
        modal.querySelector(".room-points");

    if (roomPoints) {

        const roomBox =
            roomPoints._originalRoomBox ||
            roomPoints._roomBox;

        if (roomBox && roomBox.isConnected) {
            roomBox.appendChild(roomPoints);
        }
    }

    overlay.remove();

    document.body.classList.remove(
        "room-modal-open"
    );
}

/* =========================================================
   HOME PLANNING - ROOM BASIC ITEMS
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - ADD FAN
   ========================================================= */

function addRoomFan(button) {

    const roomPoints = button.closest(".room-points");
    if (!roomPoints) return;

    const container =
        roomPoints.querySelector(".room-extra-fans");

    if (!container) return;

    const row = document.createElement("div");

    row.className =
        "basic-item-row extra-fan-row";

    row.innerHTML = `
        <label>Fan</label>

        <select class="room-extra-fan-select">
            <option value="">Select Fan</option>
        </select>

        <select class="room-extra-fan-size-select">
            <option value="">Select Size</option>
        </select>

        <input
            type="number"
            min="0"
            value="0"
            class="room-extra-fan-qty"
        >

        <button
            type="button"
            class="remove-fan-btn"
            onclick="
                this.closest('.extra-fan-row').remove();
                updateHomeFinalTotal();
            ">
            ×
        </button>
    `;

    container.appendChild(row);

    const fanSelect =
        row.querySelector(".room-extra-fan-select");

    const fanSizeSelect =
        row.querySelector(".room-extra-fan-size-select");

    const fanQty =
        row.querySelector(".room-extra-fan-qty");


    /* ==========================================
       FAN OPTIONS
       ========================================== */

    if (typeof electricalData !== "undefined") {

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

        });
    }


    /* ==========================================
       FAN CHANGE → SIZE
       ========================================== */

    fanSelect.addEventListener("change", function () {

        fanSizeSelect.innerHTML = `
            <option value="">Select Size</option>
        `;

        const index =
            Number(this.value);

        if (
            !isNaN(index) &&
            electricalData[index]
        ) {

            const sizes =
                electricalData[index].sizes || [];

            sizes.forEach(function (size) {

                const option =
                    document.createElement("option");

                option.value = size;
                option.textContent = size;

                fanSizeSelect.appendChild(option);
            });
        }

        updateHomeFinalTotal();
    });


    /* ==========================================
       QTY CHANGE
       ========================================== */

    fanQty.addEventListener("input", function () {

        updateHomeFinalTotal();

    });

}

/* =========================================================
   HOME PLANNING - ADD LIGHT
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - ADD ROUND SHEET
   ========================================================= */


/* =========================================================
   HOME PLANNING - ADD CEILING ROSE
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - ADD PLATE
   ========================================================= */

function addHomePlanningPlate(button) {

    const roomPoints =
        button.closest(".room-points");

    if (!roomPoints) return;


    const platesContainer =
        roomPoints.querySelector(".plates-container");

    if (!platesContainer) return;

    const plateNumber =
        platesContainer.querySelectorAll(".home-plate-box").length + 1;

    const plateBox =
        document.createElement("div");

    plateBox.className =
        "home-plate-box";

    const roomBox =
        roomPoints._originalRoomBox ||
        roomPoints._roomBox ||
        roomPoints.closest(".room-box");

    const roomName =
        roomBox?.dataset.roomName || "Room";

    const floorBox =
        roomBox?.closest(".home-floor");

    const floorName =
        floorBox?.dataset.floorName || "Ground Floor";

    const plateTitle =
        String(plateNumber).padStart(2, "0");

    plateBox.innerHTML = `

    <!-- =========================================
         PLATE HEADER
    ========================================== -->

    <div class="plate-header">

        <div class="plate-header-info">

            <div class="plate-header-icon">
                🏠
            </div>

            <div class="plate-header-text">

                <strong>
                    Plate ${plateTitle}
                </strong>

                <span>
                    ${roomName} • ${floorName}
                </span>

            </div>

        </div>


        <div class="plate-header-actions">

            <select
                class="home-plate-select"
                title="Select Module Plate">

                <option value="">
                    Select Plate
                </option>

            </select>


            ${plateNumber > 1
            ? `
                        <button
                            type="button"
                            class="plate-delete-btn"
                            onclick="
                                event.stopPropagation();
                                removeHomePlanningPlate(this);
                            "
                            title="Delete Plate">

                            ×

                        </button>
                    `
            : ""
        }

        </div>

    </div>


    <!-- =========================================
         ELECTRICAL ITEM
    ========================================== -->

    <div class="home-item-selector">

        <!-- TITLE -->

        <div class="home-item-title">

            <span class="home-item-title-icon">
                +
            </span>

            <strong>
                ADD ELECTRICAL ITEM
            </strong>

        </div>


        <!-- FIELDS -->

        <div class="home-item-fields">

            <!-- ELECTRICAL ITEM -->

            <div class="home-field">

                <label>
                    Electrical Item
                </label>

                <select class="home-item-select">

                    <option value="">
                        Select Item
                    </option>

                </select>

            </div>


            <!-- AMP / SIZE -->

            <div class="home-field">

                <label>
                    Amp / Size
                </label>

                <select class="home-size-select">

                    <option value="">
                        Select
                    </option>

                </select>

            </div>


            <!-- COLOR -->

            <div class="home-field">

                <label class="home-color-label">
                    Color
                </label>

                <select class="home-color-select">

                    <option value="">
                        Select Color
                    </option>

                </select>

            </div>


            <!-- QTY -->

            <div class="home-field home-qty-field">

                <label>
                    Qty
                </label>

                <div class="home-qty-control">

                    <button
                        type="button"
                        class="home-qty-minus">
                        −
                    </button>

                    <input
                        type="number"
                        min="1"
                        value="1"
                        class="home-item-qty"
                    >

                    <button
                        type="button"
                        class="home-qty-plus">
                        +
                    </button>

                </div>

            </div>

        </div>


        <!-- ADD BUTTON -->

        <button
            type="button"
            class="add-btn"
            onclick="addHomePlanningItem(this)">

            ＋ Add Item

        </button>

    </div>


    <!-- =========================================
         SELECTED ITEMS
    ========================================== -->

    <div class="home-selected-items">

        <div class="selected-items-header">

            <div class="selected-items-title-group">

                <span class="selected-items-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </span>

                <strong>
                    SELECTED ITEMS
                </strong>

            </div>

            <span class="selected-item-count">
                0 Items
            </span>

        </div>


        <div class="selected-items-table-wrapper">

            <table class="selected-items-table">

                <thead>

                    <tr>
                        <th class="col-sno">#</th>
                        <th class="col-item">Item</th>
                        <th class="col-size">Amp / Size</th>
                        <th class="col-qty">Qty</th>
                        <th class="col-module">Module</th>
                        <th class="col-action">Action</th>
                    </tr>

                </thead>

                <tbody class="selected-item-list"></tbody>

            </table>

        </div>

    </div>


    <!-- =========================================
         MODULE CALCULATION
    ========================================== -->

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


    /* =========================================
   ADD PLATE TO CONTAINER
    ========================================= */

    platesContainer.appendChild(plateBox);

    /* =========================================
       SELECTED ITEMS OBSERVER (S.NO & COUNT)
    ========================================= */

    const selectedList =
        plateBox.querySelector(".selected-item-list");

    const countBadge =
        plateBox.querySelector(".selected-item-count");

    if (selectedList && countBadge) {

        const updateSelectedStats = function () {

            const rows =
                selectedList.querySelectorAll(
                    ".home-selected-row"
                );

            const count =
                rows.length;

            countBadge.textContent =
                `${count} Item${count !== 1 ? "s" : ""}`;

            rows.forEach(function (row, idx) {

                const snoCell =
                    row.querySelector(
                        ".selected-item-sno"
                    );

                if (snoCell) {
                    snoCell.textContent = idx + 1;
                }

            });

        };

        const observer =
            new MutationObserver(updateSelectedStats);

        observer.observe(
            selectedList,
            { childList: true }
        );

    }

    /* =========================================
    QTY + / - CONTROL
    ========================================= */

    const qtyInput =
        plateBox.querySelector(".home-item-qty");

    const qtyMinus =
        plateBox.querySelector(".home-qty-minus");

    const qtyPlus =
        plateBox.querySelector(".home-qty-plus");


    if (qtyInput && qtyMinus && qtyPlus) {

        qtyMinus.addEventListener(
            "click",
            function () {

                let qty =
                    Number(qtyInput.value) || 1;

                qtyInput.value =
                    Math.max(1, qty - 1);

            }
        );


        qtyPlus.addEventListener(
            "click",
            function () {

                let qty =
                    Number(qtyInput.value) || 1;

                qtyInput.value =
                    qty + 1;

            }
        );

    }


    /* =========================================
       PLATE SELECT
    ========================================= */

    const plateSelect =
        plateBox.querySelector(".home-plate-select");


    /* =========================================
       MODULE PLATE OPTIONS
    ========================================= */

    const modularPlate =
        electricalData.find(function (item) {

            return String(item.name || "")
                .trim()
                .toLowerCase() === "modular plate";

        });


    if (
        modularPlate &&
        Array.isArray(modularPlate.sizes)
    ) {

        modularPlate.sizes.forEach(function (size) {

            const option =
                document.createElement("option");

            option.value =
                parseInt(size);

            option.textContent =
                size;

            plateSelect.appendChild(option);

        });

    }

    const newPlateSections = [
        plateBox.querySelector(".home-item-selector"),
        plateBox.querySelector(".home-selected-items"),
        plateBox.querySelector(".module-calculation")
    ];


    /* =========================================
    NEW PLATE DEFAULT STATE
    Plate 1 = Open
    Plate 2+ = Closed
    ========================================= */

    newPlateSections.forEach(function (section) {

        if (section) {
            section.style.display = "";
        }

    });


    /* =========================================
    PLATE HEADER CLICK
    ONLY ONE PLATE OPEN
    ========================================= */

    const newPlateHeader =
        plateBox.querySelector(".plate-header");

    if (newPlateHeader) {

        newPlateHeader.style.cursor = "pointer";

        newPlateHeader.addEventListener(
            "click",
            function (event) {

                /* Delete button click என்றால்
                header open ஆகக்கூடாது */

                if (
                    event.target.closest(
                        ".plate-delete-btn"
                    )
                ) {
                    return;
                }


                /* ================================
                HIDE ALL PLATES
                ================================= */

                const allPlates =
                    roomPoints.querySelectorAll(
                        ".home-plate-box"
                    );

                allPlates.forEach(function (plate) {

                    const sections = [
                        plate.querySelector(
                            ".home-item-selector"
                        ),
                        plate.querySelector(
                            ".home-selected-items"
                        ),
                        plate.querySelector(
                            ".module-calculation"
                        )
                    ];

                    sections.forEach(function (section) {

                        if (section) {
                            section.style.display = "none";
                        }

                    });

                });


                /* ================================
                OPEN CLICKED PLATE
                ================================= */

                const currentSections = [
                    plateBox.querySelector(
                        ".home-item-selector"
                    ),
                    plateBox.querySelector(
                        ".home-selected-items"
                    ),
                    plateBox.querySelector(
                        ".module-calculation"
                    )
                ];

                currentSections.forEach(function (section) {

                    if (section) {
                        section.style.display = "";
                    }

                });

            }
        );
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

/* =========================================
   PLATE HEADER
   ONLY ONE PLATE OPEN AT A TIME
========================================= */

function setupPlateHeader(plate) {

    const roomPoints =
        plate.closest(".room-points");

    if (!roomPoints) return;

    const header =
        plate.querySelector(".plate-header");

    if (!header) return;

    header.style.cursor = "pointer";

    header.onclick = function (event) {

        /* Delete button click என்றால்
           header action வேண்டாம் */
        if (
            event.target.closest(".plate-delete-btn")
        ) {
            return;
        }


        /* =====================================
           CURRENT PLATE SECTIONS
        ===================================== */

        const currentSections = [
            plate.querySelector(".home-item-selector"),
            plate.querySelector(".home-selected-items"),
            plate.querySelector(".module-calculation")
        ];


        /* =====================================
           HIDE ALL OTHER PLATES
        ===================================== */

        const allPlates =
            roomPoints.querySelectorAll(
                ".home-plate-box"
            );

        allPlates.forEach(function (otherPlate) {

            if (otherPlate === plate) return;

            const sections = [
                otherPlate.querySelector(".home-item-selector"),
                otherPlate.querySelector(".home-selected-items"),
                otherPlate.querySelector(".module-calculation")
            ];

            sections.forEach(function (section) {

                if (section) {
                    section.style.display = "none";
                }

            });

        });


        /* =====================================
           OPEN CURRENT PLATE
        ===================================== */

        currentSections.forEach(function (section) {

            if (section) {
                section.style.display = "";
            }

        });

    };
}

/* =========================================
   DELETE HOME PLATE
========================================= */

function removeHomePlanningPlate(button) {

    const plateBox =
        button.closest(".home-plate-box");

    if (!plateBox) return;

    const platesContainer =
        plateBox.closest(".plates-container");

    plateBox.remove();

    /* UPDATE PLATE NUMBERS */

    if (platesContainer) {

        const plates =
            platesContainer.querySelectorAll(
                ".home-plate-box"
            );

        plates.forEach(function (plate, index) {

            const title =
                plate.querySelector(
                    ".plate-header strong"
                );

            if (title) {
                title.textContent =
                    "Plate " + (index + 1);
            }

        });
    }

    updateHomeFinalTotal();
}

/* =========================================================
   HOME PLANNING - UPDATE FINAL TOTAL
   ========================================================= */

function updateHomeFinalTotal() {

    const finalBox =
        document.getElementById("final-total-list");

    if (!finalBox) return;

    const totals = {};

    /* =========================================================
       HELPER
       ========================================================= */

    function addTotal(item, qty) {

        if (!item || qty <= 0) return;

        const key = item.name;

        totals[key] =
            (totals[key] || 0) + qty;
    }


    /* =========================================================
       1. MODULE PLATES
       ========================================================= */

    document
        .querySelectorAll(".home-plate-box")
        .forEach(function (plateBox) {

            const plateSelect =
                plateBox.querySelector(
                    ".home-plate-select"
                );

            if (
                !plateSelect ||
                !plateSelect.value
            ) {
                return;
            }

            const plateName =
                plateSelect
                    .options[
                    plateSelect.selectedIndex
                ]
                    ?.textContent
                    .trim();

            if (!plateName) return;

            const key =
                plateName + " Modular Plate";

            totals[key] =
                (totals[key] || 0) + 1;
        });


    /* =========================================================
       2. ROOM BASIC ITEMS
       Fan / Light / Round Sheet / Ceiling Rose
       ========================================================= */

    document
        .querySelectorAll(".room-points")
        .forEach(function (roomPoints) {

            const itemControls = [

                {
                    select: ".room-fan-select",
                    qty: ".room-fan-qty"
                },

                {
                    select: ".room-light-select",
                    qty: ".room-light-qty"
                },

                {
                    select: ".room-round-sheet-select",
                    qty: ".room-round-sheet-qty"
                },

                {
                    select: ".room-ceiling-rose-select",
                    qty: ".room-ceiling-rose-qty"
                }

            ];


            itemControls.forEach(
                function (control) {

                    const select =
                        roomPoints.querySelector(
                            control.select
                        );

                    const qtyInput =
                        roomPoints.querySelector(
                            control.qty
                        );

                    if (
                        !select ||
                        !select.value
                    ) {
                        return;
                    }

                    const index =
                        Number(select.value);

                    const item =
                        electricalData[index];

                    const qty =
                        Number(
                            qtyInput?.value
                        ) || 0;

                    addTotal(
                        item,
                        qty
                    );
                }
            );


            /* =================================================
               EXTRA LIGHT ROWS
               ================================================= */

            roomPoints
                .querySelectorAll(
                    ".extra-light-row"
                )
                .forEach(function (row) {

                    const select =
                        row.querySelector(
                            ".room-light-select"
                        );

                    const qtyInput =
                        row.querySelector(
                            ".room-light-qty"
                        );

                    if (
                        !select ||
                        !select.value
                    ) {
                        return;
                    }

                    const item =
                        electricalData[
                        Number(select.value)
                        ];

                    const qty =
                        Number(
                            qtyInput?.value
                        ) || 0;

                    addTotal(
                        item,
                        qty
                    );
                });


            /* =================================================
               EXTRA CEILING ROSE ROWS
               ================================================= */

            roomPoints
                .querySelectorAll(
                    ".extra-ceiling-rose-row"
                )
                .forEach(function (row) {

                    const select =
                        row.querySelector(
                            ".room-extra-ceiling-rose-select"
                        );

                    const qtyInput =
                        row.querySelector(
                            ".room-extra-ceiling-rose-qty"
                        );

                    if (
                        !select ||
                        !select.value
                    ) {
                        return;
                    }

                    const item =
                        electricalData[
                        Number(select.value)
                        ];

                    const qty =
                        Number(
                            qtyInput?.value
                        ) || 0;

                    addTotal(
                        item,
                        qty
                    );
                });

        });


    /* =========================================================
       3. MODULAR PLATE ITEMS
       ========================================================= */

    document
        .querySelectorAll(
            ".home-selected-row"
        )
        .forEach(function (row) {

            const spans =
                row.querySelectorAll("span");

            const text =
                spans[0]
                    ?.textContent
                    .trim();

            if (!text) return;

            const qtyText =
                spans[1]
                    ?.textContent || "";

            const match =
                qtyText.match(
                    /Qty\s+(\d+)/i
                );

            const qty =
                match
                    ? Number(match[1])
                    : 0;

            if (qty <= 0) return;

            const itemName =
                text
                    .split("•")[0]
                    .trim();

            totals[itemName] =
                (totals[itemName] || 0) + qty;
        });


    /* =========================================================
       4. MANUAL FINAL ITEMS
       ========================================================= */

    if (
        typeof manualFinalItems !==
        "undefined"
    ) {

        manualFinalItems.forEach(
            function (item) {

                if (
                    !item ||
                    !item.name
                ) {
                    return;
                }

                const qty =
                    Number(item.qty) || 0;

                if (qty <= 0) return;

                totals[item.name] =
                    (totals[item.name] || 0) +
                    qty;
            }
        );
    }


    /* =========================================================
       5. EMPTY
       ========================================================= */

    if (
        Object.keys(totals).length === 0
    ) {

        finalBox.innerHTML = `
            <div class="final-empty">
                No items added
            </div>
        `;

        return;
    }


    /* =========================================================
       6. CATEGORIES
       ========================================================= */

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
            "Tube",
            "LED"
        ],

        "Holders": [
            "Holder",
            "Ceiling Rose"
        ],

        "Fans": [
            "Fan"
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

    const categorizedItems =
        new Set();


    /* =========================================================
       7. RENDER CATEGORIES
       ========================================================= */

    Object.keys(categories)
        .forEach(function (category) {

            const items =
                Object.keys(totals)
                    .filter(function (name) {

                        const lower =
                            name.toLowerCase();

                        const matched =
                            categories[category]
                                .some(
                                    function (keyword) {

                                        return lower.includes(
                                            keyword.toLowerCase()
                                        );
                                    }
                                );

                        if (matched) {
                            categorizedItems.add(name);
                        }

                        return matched;
                    });


            if (
                items.length === 0
            ) {
                return;
            }


            html += `
                <div class="final-category">

                    <h3>
                        ${escapeHTML(category)}
                    </h3>
            `;


            items.forEach(
                function (name) {

                    html += `
                        <div class="final-total-row">

                            <span>
                                ${escapeHTML(name)}
                            </span>

                            <strong>
                                Total: ${totals[name]}
                            </strong>

                        </div>
                    `;
                }
            );


            html += `
                </div>
            `;
        });


    /* =========================================================
       8. OTHER ITEMS
       ========================================================= */

    const otherItems =
        Object.keys(totals)
            .filter(function (name) {

                return !categorizedItems.has(
                    name
                );
            });


    if (
        otherItems.length > 0
    ) {

        html += `
            <div class="final-category">

                <h3>
                    Other
                </h3>
        `;


        otherItems.forEach(
            function (name) {

                html += `
                    <div class="final-total-row">

                        <span>
                            ${escapeHTML(name)}
                        </span>

                        <strong>
                            Total: ${totals[name]}
                        </strong>

                    </div>
                `;
            }
        );


        html += `
            </div>
        `;
    }


    /* =========================================================
       9. DISPLAY
       ========================================================= */

    finalBox.innerHTML = html;
}

/* =========================================================
   HOME PLANNING - SAVE
   ========================================================= */

/* =========================================================
HOME PLANNING - REMOVE EXTRA LIGHT
========================================================= */

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

/* =========================================================
   HOME PLANNING - SETUP LIGHT ROW EXTRAS
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - POPULATE LIGHT SELECT
   ========================================================= */

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

/* =========================================================
   FINAL ELECTRICAL ITEMS - POPULATE
   ========================================================= */

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

/* =========================================================
   FINAL ELECTRICAL ITEMS - ADD ITEM SETUP
   ========================================================= */

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

/* =========================================================
   FINAL ELECTRICAL ITEMS - OPTIONS SETUP
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - UPDATE ITEM OPTIONS
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - ADD ITEM
   ========================================================= */

function addHomePlanningItem(button) {

    // இந்த Add Item எந்த Plate-க்குள் இருக்கிறதோ அந்த Plate-ஐ மட்டும் எடுத்துக்கொள்ளும்
    const plateBox =
        button.closest(".home-plate-box");

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


    /* ================================
       VALIDATION
    ================================= */

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


    /* ================================
       VALUES
    ================================= */

    const size =
        sizeSelect.value;

    const color =
        colorSelect.value;

    const module =
        Number(item.module) || 0;

    const selectedList =
        plateBox.querySelector(".selected-item-list");

    if (!selectedList) return;


    /* ================================
       CREATE ROW
    ================================= */

    const currentSno =
        selectedList.querySelectorAll(
            ".home-selected-row"
        ).length + 1;

    const row =
        document.createElement("tr");

    row.className =
        "home-selected-row";

    row.dataset.module =
        String(module * qty);

    row.innerHTML = `
        <td class="selected-item-sno">${currentSno}</td>
        <td class="selected-item-name"><span style="display:none;">${item.name}</span><span style="display:none;">Qty ${qty}</span>${item.name}</td>
        <td class="selected-item-size">${size || color || "-"}</td>
        <td class="selected-item-qty">${qty}</td>
        <td class="selected-item-module"><strong>${module > 0 ? (module * qty) + "M" : "-"
        }</strong></td>
        <td class="selected-item-action">
            <button
                type="button"
                class="selected-item-delete-btn"
                onclick="removeHomePlanningItem(this)"
                title="Remove Item">
                🗑
            </button>
        </td>
    `;

    selectedList.appendChild(row);

    const countBadge =
        plateBox.querySelector(".selected-item-count");

    if (countBadge) {
        const count =
            selectedList.querySelectorAll(
                ".home-selected-row"
            ).length;

        countBadge.textContent =
            `${count} Item${count !== 1 ? "s" : ""}`;
    }


    /* ================================
       UPDATE CALCULATION
    ================================= */

    calculateHomeModules(plateBox);

    updateHomeFinalTotal();


    /* ================================
       RESET
    ================================= */

    itemSelect.value = "";

    sizeSelect.innerHTML =
        `<option value="">Select</option>`;

    colorSelect.innerHTML =
        `<option value="">Select Color</option>`;

    colorSelect.style.display =
        "none";

    qtyInput.value = 1;
}

/* =========================================================
   HOME PLANNING - TOGGLE PLATE
   ========================================================= */


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

/* =========================================================
   HOME PLANNING - CALCULATE MODULES
   ========================================================= */

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

/* =========================================================
   HOME PLANNING - REMOVE ITEM
   ========================================================= */



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

        /* UNIT */

        const unitSelect =
            row.querySelector(
                ".unit-cell .unit-dropdown"
            );

        const selectedUnit =
            unitSelect
                ? unitSelect.value
                : "";

        const qtyInputs =
            row.querySelectorAll(".qty-input");

        /* ==============================================
        CUSTOM ITEM
        ============================================== */

        if (
            row.dataset.customItem === "true"
        ) {

            const customBlocks =
                row.querySelectorAll(
                    ".custom-item-block"
                );

            customBlocks.forEach(
                function (block, customIndex) {

                    const customNameInput =
                        block.querySelector(
                            ".custom-item-name-input"
                        );

                    const customSizeInput =
                        block.querySelector(
                            ".custom-item-size-input"
                        );

                    const customColorSelect =
                        block.querySelector(
                            ".color-dropdown"
                        );

                    const customQtyInput =
                        row.querySelector(
                            '.qty-input[data-custom-index="' +
                            customIndex +
                            '"]'
                        );

                    const customUnitSelect =
                        row.querySelector(
                            '.unit-dropdown[data-custom-index="' +
                            customIndex +
                            '"]'
                        );

                    const customName =
                        customNameInput
                            ? customNameInput.value.trim()
                            : "";

                    const customSize =
                        customSizeInput
                            ? customSizeInput.value.trim()
                            : "";

                    const customColor =
                        customColorSelect
                            ? customColorSelect.value
                            : "";

                    const customQty =
                        customQtyInput
                            ? parseInt(
                                customQtyInput.value,
                                10
                            )
                            : 0;

                    const customUnit =
                        customUnitSelect
                            ? customUnitSelect.value
                            : "";

                    if (
                        !isNaN(customQty) &&
                        customQty > 0
                    ) {

                        selected.push({

                            name:
                                customName ||
                                "Custom Item",

                            size:
                                customSize,

                            color:
                                customColor,

                            qty:
                                customQty,

                            unit:
                                customUnit

                        });

                    }

                }
            );

            return;
        }

        /* ==============================================
        NO SIZE ITEM
        ============================================== */

        if (
            !Array.isArray(item.sizes) ||
            item.sizes.length === 0
        ) {

            /* MULTIPLE COLOR ITEM */

            if (
                item.useColors === true &&
                row.querySelector(
                    ".color-options-container"
                )
            ) {

                const colorEntries =
                    row.querySelectorAll(
                        ".color-entry"
                    );


                colorEntries.forEach(
                    function (colorEntry, colorIndex) {

                        const colorSelect =
                            colorEntry.querySelector(
                                ".color-dropdown"
                            );

                        const qtyInput =
                            qtyInputs[colorIndex];


                        if (
                            !colorSelect ||
                            !qtyInput
                        ) {
                            return;
                        }


                        const qty =
                            parseInt(
                                qtyInput.value,
                                10
                            );


                        const color =
                            colorSelect.value;


                        if (
                            !isNaN(qty) &&
                            qty > 0 &&
                            color !== ""
                        ) {

                            selected.push({

                                name: item.name,

                                size: "",

                                color: color,

                                qty: qty,

                                unit: selectedUnit

                            });

                        }

                    }
                );


                return;
            }


            /* NORMAL NO-SIZE ITEM */

            qtyInputs.forEach(function (input) {

                const qty =
                    parseInt(
                        input.value,
                        10
                    );


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

                        qty: qty,

                        unit: selectedUnit

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


            const entryId =
                input.dataset.entryId;

            const sizeEntry =
                Array.from(
                    row.querySelectorAll(".size-entry")
                ).find(function (entry) {

                    return entry.dataset.entryId === entryId;

                });

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
                    size: customSize,
                    color: color,
                    unit: selectedUnit,
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
                unit: selectedUnit,
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
   PDF BILL ONLY
   ========================================================= */

function preparePDFBill(type) {

    const form = document.getElementById(type + "Form");

    if (!form) return;

    const table = form.querySelector(".order-table");

    if (!table) return;


    /* =====================================================
       PDF ONLY - HIDE PHONE
       ===================================================== */

    const phoneRow = form.querySelector(
        "#" + type + "Ph"
    );

    if (phoneRow) {

        const phoneDetailRow =
            phoneRow.closest(".detail-row");

        if (phoneDetailRow) {
            phoneDetailRow.style.display = "none";
        }

    }


    /* =====================================================
       PDF TABLE HEADER
       WEBSITE:
       S.No | PARTICULARS | QTY

       PDF:
       S.No | PARTICULARS | AMP/SIZE | QTY
       ===================================================== */

    const headerRow =
        table.querySelector("thead tr");

    if (headerRow) {

        const oldQtyHeader =
            headerRow.querySelector(".qty");

        if (
            oldQtyHeader &&
            !headerRow.querySelector(".pdf-amp-size-header")
        ) {

            const ampHeader =
                document.createElement("th");

            ampHeader.className =
                "amp-size pdf-amp-size-header";

            ampHeader.textContent =
                "AMP/SIZE";

            headerRow.insertBefore(
                ampHeader,
                oldQtyHeader
            );

        }

    }


    /* =====================================================
       PDF BODY ROWS
       ===================================================== */

    const rows =
        table.querySelectorAll(
            "tbody tr.item-row"
        );


    rows.forEach(function (row) {

        if (row.style.display === "none") {
            return;
        }


        /* -----------------------------------------------
           QTY CELL
           ----------------------------------------------- */

        const qtyCell =
            row.querySelector(".qty-cell");

        if (!qtyCell) {
            return;
        }


        /* -----------------------------------------------
           GET AMP / SIZE
           ----------------------------------------------- */

        let ampSize = "—";


        const sizeSelect =
            row.querySelector(".size-dropdown");


        if (sizeSelect) {

            if (
                sizeSelect.value &&
                sizeSelect.value !== "__CUSTOM__"
            ) {

                ampSize =
                    sizeSelect.value;

            }

        }


        /* -----------------------------------------------
           CUSTOM SIZE / RATING
           ----------------------------------------------- */

        const customInput =
            row.querySelector(
                ".custom-size-input"
            );


        if (
            customInput &&
            customInput.value.trim() !== ""
        ) {

            ampSize =
                customInput.value.trim();

        }


        /* -----------------------------------------------
           CREATE PDF AMP/SIZE CELL
           ----------------------------------------------- */

        const ampSizeCell =
            document.createElement("td");

        ampSizeCell.className =
            "amp-size pdf-amp-size";

        ampSizeCell.textContent =
            ampSize;


        /* -----------------------------------------------
           IMPORTANT:
           INSERT BEFORE QTY
           ----------------------------------------------- */

        row.insertBefore(
            ampSizeCell,
            qtyCell
        );


        /* -----------------------------------------------
           REMOVE WEBSITE CONTROLS
           FROM PARTICULARS FOR PDF
           ----------------------------------------------- */

        row.querySelectorAll(
            ".item-thumb, " +
            ".size-dropdown, " +
            ".custom-size-input, " +
            ".color-dropdown, " +
            ".add-size-btn, " +
            ".remove-size-btn, " +
            "button"
        ).forEach(function (el) {

            el.style.display = "none";

        });


        /* -----------------------------------------------
           REMOVE EMPTY UI SPACING
           ----------------------------------------------- */

        row.querySelectorAll(
            ".size-entry"
        ).forEach(function (entry) {

            entry.style.display = "none";

        });

    });


    /* =====================================================
       TOTAL
       ===================================================== */

    const totalLabel =
        table.querySelector(".total-label");

    if (totalLabel) {

        totalLabel.setAttribute(
            "colspan",
            "3"
        );

    }

}


/* =========================================================
   DOWNLOAD PDF
   PDF ONLY BILL
   WEBSITE TABLE REMAINS UNCHANGED
   ========================================================= */

async function downloadPDF(type) {

    const selected = getSelectedItems(type);

    if (!Array.isArray(selected) || selected.length === 0) {

        alert("முதலில் Qty enter செய்யவும்.");

        return;
    }


    const form =
        document.getElementById(type + "Form");

    if (!form) return;


    /* =====================================================
       PREPARE
       ===================================================== */

    preparePDF(type);


    /* =====================================================
       CUSTOMER DETAILS
       ===================================================== */

    const customer =
        getCustomerDetails(type);

    const customerName =
        customer.name || "Customer";

    const date =
        customer.date ||
        new Date().toISOString().split("T")[0];


    /* =====================================================
       ORDER NUMBER
       ===================================================== */

    const orderElement =
        document.getElementById(
            type + "OrderNo"
        );

    const orderNo =
        orderElement
            ? orderElement.textContent.trim()
            : "";


    /* =====================================================
       FILE NAME
       ===================================================== */

    const fileName =
        "MVS-" +
        type +
        "-" +
        safeFileName(customerName) +
        "-" +
        date +
        ".pdf";


    /* =====================================================
    CREATE CLEAN PDF BILL
    ===================================================== */

    const pdfBill =
        document.createElement("div");

    pdfBill.id =
        "mvs-pdf-bill";

    pdfBill.style.width =
        "730px";

    pdfBill.style.overflow =
        "visible";

    pdfBill.style.padding =
        "35px";

    pdfBill.style.boxSizing =
        "border-box";

    pdfBill.style.background =
        "#ffffff";

    pdfBill.style.color =
        "#000000";

    pdfBill.style.fontFamily =
        "Arial, sans-serif";

    pdfBill.style.position =
        "fixed";

    pdfBill.style.left =
        "0";

    pdfBill.style.top =
        "0";

    pdfBill.style.zIndex =
        "999999";

    /* =====================================================
       BILL HEADER
       ===================================================== */

    pdfBill.innerHTML = `

        <div style="
            border:1.5px solid #111;
            border-radius:10px;
            padding:18px 20px 14px;
            margin-bottom:14px;
        ">

            <div style="
                text-align:center;
                font-size:25px;
                font-weight:700;
                color:#102a56;
                margin-bottom:3px;
            ">
                MVS ELECTRICAL
            </div>


            <div style="
                text-align:center;
                font-size:13px;
                font-weight:600;
                color:#333;
                margin-bottom:4px;
            ">
                Electrical &amp; Plumbing Solutions
            </div>


            <div style="
                text-align:center;
                font-size:12px;
                color:#222;
                padding-bottom:10px;
                border-bottom:1px solid #ddd;
            ">
                Thamizharasu &nbsp;•&nbsp; +91 6383754237
            </div>


            <div style="
                display:flex;
                justify-content:space-between;
                margin-top:12px;
                font-size:12px;
            ">

                <div>
                    <strong>Order No:</strong>
                    ${escapeHTML(orderNo)}
                </div>

                <div>
                    <strong>Date:</strong>
                    ${escapeHTML(date)}
                </div>

            </div>


            <div style="
                margin-top:10px;
                font-size:12px;
            ">

                <strong>Customer:</strong>
                ${escapeHTML(customerName)}

            </div>

        </div>


        <!-- TABLE -->

        <table
            id="mvs-pdf-table"
            style="
                width:100%;
                border-collapse:collapse;
                table-layout:fixed;
                font-size:12px;
            "
        >

            <thead>

                <tr>

                    <th style="
                        width:55px;
                        border:1px solid #111;
                        padding:8px;
                        background:#f2f2f2;
                        text-align:center;
                    ">
                        S.No.
                    </th>


                    <th style="
                        width:auto;
                        border:1px solid #111;
                        padding:8px;
                        background:#f2f2f2;
                        text-align:left;
                    ">
                        PARTICULARS
                    </th>


                    <th style="
                        width:110px;
                        border:1px solid #111;
                        padding:8px;
                        background:#f2f2f2;
                        text-align:center;
                    ">
                        AMP/SIZE
                    </th>


                    <th style="
                        width:65px;
                        border:1px solid #111;
                        padding:8px;
                        background:#f2f2f2;
                        text-align:center;
                    ">
                        QTY
                    </th>

                </tr>

            </thead>


            <tbody id="mvs-pdf-items"></tbody>


            <tfoot>

                <tr>

                    <td
                        colspan="3"
                        style="
                            border:1px solid #111;
                            padding:9px;
                            text-align:right;
                            font-weight:700;
                        "
                    >
                        TOTAL
                    </td>

                    <td
                        id="mvs-pdf-total"
                        style="
                            border:1px solid #111;
                            padding:9px;
                            text-align:center;
                            font-weight:700;
                        "
                    >
                        0
                    </td>

                </tr>

            </tfoot>

        </table>


        <!-- FOOTER -->

        <div style="
            margin-top:35px;
            padding-top:18px;
            border-top:1px solid #ddd;
            text-align:center;
            font-size:13px;
            color:#333;
        ">

            <div style="
                font-weight:700;
                margin-bottom:4px;
            ">
                Thank You
            </div>

        </div>

    `;


    document.body.appendChild(pdfBill);


    /* =====================================================
       ADD SELECTED ITEMS
       ===================================================== */

    const tbody =
        pdfBill.querySelector(
            "#mvs-pdf-items"
        );


    let total = 0;


    selected.forEach(function (item, index) {

        const qty =
            Number(item.qty) || 0;


        if (qty <= 0) return;


        let ampSize =
            item.size || "—";


        /*
        Custom size currently returned by
        getSelectedItems() as "customSize".
        */

        if (ampSize === "customSize") {

            ampSize = "Custom";

        }


        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td style="
                border:1px solid #111;
                padding:8px;
                text-align:center;
            ">
                ${index + 1}
            </td>


            <td style="
                border:1px solid #111;
                padding:8px;
                text-align:left;
                font-weight:600;
            ">
                ${escapeHTML(item.name || "")}
                ${item.color
                ? ` <span style="font-weight:500;">(${escapeHTML(item.color)})</span>`
                : ""
            }
            </td>


            <td style="
                border:1px solid #111;
                padding:8px;
                text-align:center;
            ">
                ${escapeHTML(String(ampSize))}
            </td>


            <td style="
                border:1px solid #111;
                padding:8px;
                text-align:center;
                font-weight:600;
            ">
                ${qty} ${escapeHTML(String(item.unit || ""))}
            </td>

        `;


        tbody.appendChild(tr);


        total += qty;

    });




    /* =====================================================
       TOTAL
       ===================================================== */

    const totalElement =
        pdfBill.querySelector(
            "#mvs-pdf-total"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }

    /* =====================================================
    AUTOMATIC A4 PAGINATION
    ===================================================== */

    const originalTable =
        pdfBill.querySelector("#mvs-pdf-table");

    const originalRows =
        originalTable
            ? Array.from(
                originalTable.querySelectorAll(
                    "tbody tr"
                )
            )
            : [];

    const billHeader =
        originalTable
            ? originalTable.previousElementSibling
            : null;

    const billFooter =
        originalTable
            ? originalTable.nextElementSibling
            : null;


    if (
        originalTable &&
        originalRows.length > 0
    ) {

        const PAGE_WIDTH = 730;
        const PAGE_HEIGHT = 1038;
        const PAGE_PADDING = 35;


        /*
        * First allow the original bill to render.
        * This is important for getting real row heights.
        */

        await new Promise(function (resolve) {

            requestAnimationFrame(function () {

                requestAnimationFrame(resolve);

            });

        });


        /*
        * Measure every original row.
        */

        const rowHeights =
            originalRows.map(
                function (row) {

                    return row.getBoundingClientRect()
                        .height;

                }
            );


        /*
        * Create page container.
        */

        const pagesContainer =
            document.createElement("div");

        pagesContainer.style.width =
            PAGE_WIDTH + "px";

        pagesContainer.style.background =
            "#ffffff";


        let currentPageRows = [];

        let currentHeight = 0;

        const pages = [];


        /*
        * Calculate first page header height.
        */

        let firstPageHeaderHeight = 0;

        if (billHeader) {

            firstPageHeaderHeight =
                billHeader.getBoundingClientRect()
                    .height;

        }


        /*
        * Table header height.
        */

        const tableHeader =
            originalTable.querySelector("thead");

        const tableHeaderHeight =
            tableHeader
                ? tableHeader.getBoundingClientRect()
                    .height
                : 0;


        /*
        * Available row space.
        */

        const firstPageAvailable =
            PAGE_HEIGHT -
            (PAGE_PADDING * 2) -
            firstPageHeaderHeight -
            tableHeaderHeight;


        const otherPageAvailable =
            PAGE_HEIGHT -
            (PAGE_PADDING * 2) -
            tableHeaderHeight;


        /*
        * Put rows into pages.
        */

        originalRows.forEach(
            function (row, index) {

                const rowHeight =
                    rowHeights[index];


                const available =
                    pages.length === 0
                        ? firstPageAvailable
                        : otherPageAvailable;


                if (
                    currentPageRows.length > 0 &&
                    currentHeight + rowHeight >
                    available
                ) {

                    pages.push(
                        currentPageRows
                    );

                    currentPageRows = [];

                    currentHeight = 0;

                }


                currentPageRows.push(row);

                currentHeight += rowHeight;

            }
        );


        /*
        * Last rows.
        */

        if (
            currentPageRows.length > 0
        ) {

            pages.push(
                currentPageRows
            );

        }


        /*
        * Create actual pages.
        */

        pages.forEach(
            function (rows, pageIndex) {

                const page =
                    document.createElement("div");

                page.style.width =
                    PAGE_WIDTH + "px";

                page.style.minHeight =
                    PAGE_HEIGHT + "px";

                page.style.boxSizing =
                    "border-box";

                page.style.padding =
                    PAGE_PADDING + "px";

                page.style.background =
                    "#ffffff";

                page.style.pageBreakAfter =
                    pageIndex <
                        pages.length - 1
                        ? "always"
                        : "auto";

                page.style.breakAfter =
                    pageIndex <
                        pages.length - 1
                        ? "page"
                        : "auto";


                /*
                * PAGE 1 HEADER
                */

                if (
                    pageIndex === 0 &&
                    billHeader
                ) {

                    page.appendChild(
                        billHeader.cloneNode(true)
                    );

                }


                /*
                * TABLE
                */

                const table =
                    document.createElement("table");

                table.style.width =
                    "100%";

                table.style.borderCollapse =
                    "collapse";

                table.style.tableLayout =
                    "fixed";

                table.style.fontSize =
                    "12px";


                /*
                * TABLE HEADER
                */

                table.appendChild(
                    originalTable
                        .querySelector("thead")
                        .cloneNode(true)
                );


                /*
                * ROWS
                */

                const tbody =
                    document.createElement("tbody");


                rows.forEach(
                    function (row) {

                        tbody.appendChild(
                            row.cloneNode(true)
                        );

                    }
                );


                table.appendChild(
                    tbody
                );

                page.appendChild(
                    table
                );


                /*
                * TOTAL + FOOTER
                * LAST PAGE ONLY
                */

                if (
                    pageIndex ===
                    pages.length - 1
                ) {

                    const totalBox =
                        document.createElement("div");

                    totalBox.style.marginTop =
                        "12px";

                    totalBox.innerHTML = `
                        <table
                            style="
                                width:100%;
                                border-collapse:collapse;
                                font-size:12px;
                            "
                        >
                            <tr>

                                <td
                                    style="
                                        border:1px solid #111;
                                        padding:9px;
                                        text-align:right;
                                        font-weight:700;
                                    "
                                >
                                    TOTAL
                                </td>

                                <td
                                    style="
                                        width:65px;
                                        border:1px solid #111;
                                        padding:9px;
                                        text-align:center;
                                        font-weight:700;
                                    "
                                >
                                    ${total}
                                </td>

                            </tr>
                        </table>
                    `;

                    page.appendChild(
                        totalBox
                    );


                    if (billFooter) {

                        page.appendChild(
                            billFooter.cloneNode(true)
                        );

                    }

                }


                pagesContainer.appendChild(
                    page
                );

            }
        );


        /*
        * Replace original bill
        */

        pdfBill.innerHTML = "";

        pdfBill.style.padding =
            "0";

        pdfBill.appendChild(
            pagesContainer
        );

    }


    /* =====================================================
       WAIT FOR DOM RENDER
       ===================================================== */

    await new Promise(function (resolve) {

        requestAnimationFrame(function () {

            requestAnimationFrame(resolve);

        });

    });


    /* =====================================================
       PDF OPTIONS
       ===================================================== */

    const options = {

        margin: 8,

        filename: fileName,

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {

            scale: 2,

            useCORS: true,

            backgroundColor:
                "#ffffff",

            scrollX: 0,

            scrollY: 0

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


    /* =====================================================
    GENERATE PDF PREVIEW
    ===================================================== */

    try {

        if (
            typeof html2pdf ===
            "undefined"
        ) {

            alert(
                "PDF library load ஆகவில்லை."
            );

            return;
        }


        /* -----------------------------------------------
        SAVE PDF DATA FOR DOWNLOAD
        ----------------------------------------------- */

        window.currentPDFOptions =
            options;

        window.currentPDFFileName =
            fileName;


        /* -----------------------------------------------
        SHOW PDF BILL PREVIEW
        ----------------------------------------------- */

        const previewContent =
            document.getElementById(
                "pdfPreviewContent"
            );


        if (!previewContent) {

            alert(
                "PDF Preview content கிடைக்கவில்லை."
            );

            return;
        }


        previewContent.innerHTML = "";


        const previewBill =
            pdfBill.cloneNode(true);


        previewBill.style.position =
            "relative";

        previewBill.style.left =
            "auto";

        previewBill.style.top =
            "auto";

        previewBill.style.zIndex =
            "auto";

        previewBill.style.margin =
            "0 auto";


        previewContent.appendChild(
            previewBill
        );


        /* -----------------------------------------------
        SAVE ACTUAL PREVIEW FOR DOWNLOAD
        ----------------------------------------------- */

        window.currentPDFElement =
            previewBill;

        /* -----------------------------------------------
        OPEN PREVIEW
        ----------------------------------------------- */

        document.getElementById(
            "pdfPreviewModal"
        ).style.display = "flex";


    }
    catch (error) {

        console.error(
            "PDF PREVIEW ERROR:",
            error
        );

        alert(
            "PDF Preview உருவாக்க முடியவில்லை."
        );

    }
    finally {

        if (pdfBill) {
            pdfBill.remove();
        }

        restoreEmptyRows(type);
        restoreOriginalSno(type);

    }

}

/* =====================================================
   PDF PREVIEW - DOWNLOAD
   ===================================================== */

async function downloadPreviewPDF() {

    const previewBill =
        document.querySelector(
            "#pdfPreviewContent #mvs-pdf-bill"
        );


    if (!previewBill) {

        alert(
            "PDF கிடைக்கவில்லை."
        );

        return;
    }


    if (!window.currentPDFOptions) {

        alert(
            "PDF options கிடைக்கவில்லை."
        );

        return;
    }


    try {

        await html2pdf()
            .set(
                window.currentPDFOptions
            )
            .from(
                previewBill
            )
            .save();

    }
    catch (error) {

        console.error(
            "PDF DOWNLOAD ERROR:",
            error
        );

        alert(
            "PDF download செய்ய முடியவில்லை."
        );

    }

}

/* =====================================================
   PDF PREVIEW - CLOSE
   ===================================================== */

function closePDFPreview() {

    const modal =
        document.getElementById(
            "pdfPreviewModal"
        );


    if (modal) {

        modal.style.display = "none";

    }


    const previewContent =
        document.getElementById(
            "pdfPreviewContent"
        );


    if (previewContent) {

        previewContent.innerHTML = "";

    }


    window.currentPDFElement =
        null;

    window.currentPDFOptions =
        null;

    window.currentPDFFileName =
        null;

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


/* =========================================
   SAVE ORDER
   Backend + Local Storage
========================================= */

async function saveOrder(type) {

    const targetType = type || currentSection || "electrical";

    const electricalCustomer =
        document.getElementById("electricalSri")?.value.trim() || "";

    const plumbingCustomer =
        document.getElementById("plumbingSri")?.value.trim() || "";

    const customerName =
        targetType === "plumbing"
            ? plumbingCustomer
            : electricalCustomer;

    if (!customerName) {
        alert("Customer Name enter பண்ணவும்.");
        return;
    }

    const phone =
        targetType === "plumbing"
            ? document.getElementById("plumbingPh")?.value.trim() || ""
            : document.getElementById("electricalPh")?.value.trim() || "";

    const date =
        targetType === "plumbing"
            ? document.getElementById("plumbingDate")?.value || ""
            : document.getElementById("electricalDate")?.value || "";

    const selectedItems = getSelectedItems(targetType);

    if (selectedItems.length === 0) {
        alert("குறைந்தது ஒரு item-க்கு Qty enter பண்ணவும்.");
        return;
    }

    let totalQuantity = 0;

    selectedItems.forEach(item => {

        if (Array.isArray(item.sizes)) {

            item.sizes.forEach(detail => {
                totalQuantity += Number(detail.qty) || 0;
            });

        } else {

            totalQuantity += Number(item.qty) || 0;

        }
    });


    /* =========================================
       ORDER NUMBER
    ========================================= */

    let orderNo = "";

    if (targetType === "electrical") {

        orderNo =
            document.getElementById("electricalOrderNo")?.textContent.trim()
            || `MVS-E${Date.now()}`;

    } else {

        orderNo = `MVS-P${Date.now()}`;

    }


    /* =========================================
       BACKEND DATA
    ========================================= */

    const backendOrder = {

        order_no: orderNo,

        order_type: targetType,

        customer_name: customerName,

        phone: phone,

        order_date: date,

        items: JSON.stringify(selectedItems),

        total_quantity: totalQuantity

    };


    /* =========================================
       SAVE TO BACKEND
    ========================================= */

    try {

        const savedOrder = await createOrder(backendOrder);

        console.log(
            "Order saved to backend:",
            savedOrder
        );


        /* =========================================
           KEEP LOCAL STORAGE
           For existing History system
        ========================================= */

        const localOrder = {

            orderNo: orderNo,

            orderType: targetType,

            customerName: customerName,

            phone: phone,

            cell:
                document.getElementById("electricalCell")?.value.trim()
                || document.getElementById("plumbingCell")?.value.trim()
                || "",

            date: date,

            electrical:
                targetType === "electrical"
                    ? selectedItems
                    : [],

            plumbing:
                targetType === "plumbing"
                    ? selectedItems
                    : [],

            savedAt: new Date().toISOString(),

            backendId: savedOrder.id

        };


        let orders = [];

        try {

            orders = JSON.parse(
                localStorage.getItem("mvsOrders") || "[]"
            );

        } catch (error) {

            orders = [];

        }


        orders.push(localOrder);

        localStorage.setItem(
            "mvsOrders",
            JSON.stringify(orders)
        );


        alert(
            `Order Saved Successfully ✅\n\nOrder No: ${orderNo}`
        );


    } catch (error) {

        console.error(
            "Backend order save failed:",
            error
        );

        alert(
            "BACKEND ERROR:\n\n" +
            error.message
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

        let line =
            sno +
            ". " +
            item.name;


        /* SIZE */

        if (item.size) {

            line +=
                " — " +
                item.size;
        }


        /* COLOR */

        if (item.color) {

            line +=
                " — " +
                item.color;
        }


        /* QTY */

        line +=
            " — Qty " +
            item.qty;


        /* UNIT */

        if (item.unit) {

            line +=
                " " +
                item.unit;
        }


        message +=
            line +
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

/* =========================================================
   FILTER ITEMS
   ========================================================= */

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

/* =========================================================
   RESET SECTION
   ========================================================= */

function resetSection(type) {

    const tbody =
        document.getElementById(
            type + "Items"
        );

    if (!tbody) return;


    /* =============================================
       RESET ALL ITEM ROWS
       ============================================= */

    tbody
        .querySelectorAll(".item-row")
        .forEach(function (row) {


            /* =============================================
            REMOVE EXTRA CUSTOM ITEMS
            KEEP FIRST CUSTOM ITEM ONLY
            ============================================= */

            const customBlocks =
                row.querySelectorAll(".custom-item-block");

            customBlocks.forEach(function (block, index) {

                if (index > 0) {
                    block.remove();
                }

            });

            /* =====================================
               REMOVE EXTRA SIZE ENTRIES
               KEEP FIRST SIZE ONLY
               ===================================== */

            const sizeEntries =
                row.querySelectorAll(
                    ".size-entry"
                );

            sizeEntries.forEach(
                function (entry, index) {

                    if (index > 0) {
                        entry.remove();
                    }

                }
            );


            /* =====================================
               RESET FIRST SIZE DROPDOWN
               ===================================== */

            const firstSelect =
                row.querySelector(
                    ".size-dropdown"
                );

            if (firstSelect) {

                firstSelect.selectedIndex = 0;

            }


            /* =====================================
            RESET COLOR ROWS
            KEEP FIRST COLOR ONLY
            ===================================== */

            const colorEntries =
                row.querySelectorAll(
                    ".color-entry"
                );

            colorEntries.forEach(
                function (entry, index) {

                    if (index === 0) {

                        const colorSelect =
                            entry.querySelector(
                                ".color-dropdown"
                            );

                        if (colorSelect) {
                            colorSelect.selectedIndex = 0;
                        }

                    } else {

                        entry.remove();

                    }

                }
            );


            /* =====================================
               RESET CUSTOM SIZE INPUT
               ===================================== */

            const customInput =
                row.querySelector(
                    ".custom-size-input"
                );

            if (customInput) {

                customInput.value = "";

                customInput.style.display =
                    "none";

            }

            /* =====================================
            RESET EXTRA CUSTOM ITEMS
            KEEP FIRST ITEM ONLY
            ===================================== */

            if (row.dataset.customItem === "true") {

                const customBlocks =
                    row.querySelectorAll(".custom-item-block");

                const customQtyItems =
                    row.querySelectorAll(
                        ".custom-item-qty-container > *"
                    );

                const customUnitItems =
                    row.querySelectorAll(
                        ".custom-item-unit-container > *"
                    );

                customBlocks.forEach(function (block, index) {

                    if (index > 0) {
                        block.remove();
                    }

                });

                customQtyItems.forEach(function (item, index) {

                    if (index > 0) {
                        item.remove();
                    }

                });

                customUnitItems.forEach(function (item, index) {

                    if (index > 0) {
                        item.remove();
                    }

                });

            }

            /* =====================================
            RESET CUSTOM ITEM
            ===================================== */

            if (
                row.dataset.customItem === "true"
            ) {

                /* ITEM NAME */

                const customNameInput =
                    row.querySelector(
                        ".custom-item-name-input"
                    );

                if (customNameInput) {
                    customNameInput.value = "";
                }


                /* AMP / SIZE */

                const customSizeInput =
                    row.querySelector(
                        ".custom-item-size-input"
                    );

                if (customSizeInput) {
                    customSizeInput.value = "";
                }


                /* COLOR */

                const customColorSelect =
                    row.querySelector(
                        ".color-dropdown"
                    );

                if (customColorSelect) {
                    customColorSelect.selectedIndex = 0;
                }


                /* QTY */

                const customQtyInput =
                    row.querySelector(
                        '.qty-input[data-size-index="custom-item"]'
                    );

                if (customQtyInput) {
                    customQtyInput.value = "";
                }


                /* UNIT */

                const customUnitSelect =
                    row.querySelector(
                        ".unit-cell .unit-dropdown"
                    );

                if (customUnitSelect) {

                    const itemIndex =
                        Number(row.dataset.itemIndex);

                    const data =
                        type === "electrical"
                            ? electricalData
                            : plumbingData;

                    const item =
                        data[itemIndex];

                    const defaultUnit =
                        String(item?.unit || "").trim();

                    const unitOption =
                        Array.from(
                            customUnitSelect.options
                        ).find(function (option) {

                            return (
                                option.value ===
                                defaultUnit
                            );

                        });

                    if (unitOption) {

                        customUnitSelect.value =
                            defaultUnit;

                    } else {

                        customUnitSelect.selectedIndex = 0;

                    }
                }

            }

            /* =====================================
            NORMAL ITEM UNIT
            RESTORE JSON DEFAULT
            ===================================== */

            if (row.dataset.customItem !== "true") {

                const unitSelect =
                    row.querySelector(
                        ".unit-cell .unit-dropdown"
                    );

                if (unitSelect) {

                    const itemIndex =
                        Number(row.dataset.itemIndex);

                    const data =
                        type === "electrical"
                            ? electricalData
                            : plumbingData;

                    const item =
                        data[itemIndex];

                    const defaultUnit =
                        String(item?.unit || "").trim();


                    const unitOption =
                        Array.from(
                            unitSelect.options
                        ).find(function (option) {

                            return (
                                option.value
                                    .trim()
                                    .toLowerCase() ===
                                defaultUnit.toLowerCase()
                            );

                        });


                    if (unitOption) {

                        unitSelect.value =
                            unitOption.value;

                    } else {

                        unitSelect.value = "";

                    }

                }

            }


            /* =====================================
               QTY CELL
               KEEP ONLY FIRST QTY INPUT
               ===================================== */

            const qtyCell =
                row.querySelector(
                    ".qty-cell"
                );

            if (qtyCell) {

                const qtyInputs =
                    qtyCell.querySelectorAll(
                        ".qty-input"
                    );


                qtyInputs.forEach(
                    function (
                        input,
                        index
                    ) {

                        if (index === 0) {

                            /* FIRST QTY */

                            input.value = "";

                            input.dataset.selectedSize =
                                "";

                        } else {

                            /* EXTRA QTY */

                            input.remove();

                        }

                    }
                );

            }


            /* =====================================
               FALLBACK
               IF qty-cell NOT FOUND
               ===================================== */

            else {

                const qtyInputs =
                    row.querySelectorAll(
                        ".qty-input"
                    );


                qtyInputs.forEach(
                    function (
                        input,
                        index
                    ) {

                        if (index === 0) {

                            input.value = "";

                            input.dataset.selectedSize =
                                "";

                        } else {

                            input.remove();

                        }

                    }
                );

            }


            /* =====================================
               RESET ROW DISPLAY
               ===================================== */

            row.style.display = "";

            row.classList.remove(
                "selected-row"
            );

        });


    /* =============================================
       RESET SEARCH
       ============================================= */

    const search =
        document.getElementById(
            type + "Search"
        );

    if (search) {

        search.value = "";

    }


    /* =============================================
       RESET SELECTED ONLY
       ============================================= */

    const selected =
        document.getElementById(
            type + "SelectedOnly"
        );

    if (selected) {

        selected.checked = false;

    }


    /* =============================================
       RECALCULATE TOTAL
       ============================================= */

    calculateTotal(type);

}

/* =========================================================
   SAVED ORDERS - HISTORY UI
========================================================= */

async function showHistory() {

    try {

        const orders = await getOrders();

        const oldModal =
            document.getElementById("ordersHistoryModal");

        if (oldModal) {
            oldModal.remove();
        }


        const modal =
            document.createElement("div");

        modal.id = "ordersHistoryModal";
        modal.className = "orders-history-modal";


        modal.innerHTML = `

            <div class="orders-history-box">

                <div class="orders-history-header">

                    <div>
                        <h2>📁 Saved Orders</h2>
                        <p>Orders saved in database</p>
                    </div>

                    <button
                        class="orders-history-close"
                        onclick="closeOrdersHistory()">
                        ✕
                    </button>

                </div>


                <div class="orders-history-tools">

                    <input
                        type="text"
                        id="orderHistorySearch"
                        placeholder="🔍 Search Order / Customer..."
                        oninput="filterOrderHistory()"
                    >

                    <select
                        id="orderHistoryType"
                        onchange="filterOrderHistory()">

                        <option value="all">
                            All Orders
                        </option>

                        <option value="electrical">
                            ⚡ Electrical
                        </option>

                        <option value="plumbing">
                            🚰 Plumbing
                        </option>

                    </select>

                </div>


                <div
                    id="ordersHistoryList"
                    class="orders-history-list">
                </div>

            </div>

        `;


        document.body.appendChild(modal);


        window.mvsHistoryOrders =
            orders || [];


        renderOrderHistory(
            window.mvsHistoryOrders
        );


    } catch (error) {

        console.error(
            "History load failed:",
            error
        );

        alert(
            "History load failed:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderOrderHistory(orders) {

    const list =
        document.getElementById(
            "ordersHistoryList"
        );

    if (!list) return;


    if (!orders || orders.length === 0) {

        list.innerHTML = `

            <div class="orders-history-empty">

                <div>📂</div>

                <h3>No Orders Found</h3>

                <p>
                    Saved orders will appear here.
                </p>

            </div>

        `;

        return;
    }


    list.innerHTML = "";


    orders
        .slice()
        .reverse()
        .forEach(function (order) {

            const isElectrical =
                order.order_type === "electrical";


            const icon =
                isElectrical
                    ? "⚡"
                    : "🚰";


            const typeName =
                isElectrical
                    ? "Electrical"
                    : "Plumbing";


            const card =
                document.createElement("div");

            card.className =
                "order-history-card";


            card.innerHTML = `

                <div class="order-history-main">

                    <div class="order-history-icon">
                        ${icon}
                    </div>


                    <div class="order-history-info">

                        <div class="order-history-title">

                            <strong>
                                ${escapeHTML(
                                    order.order_no || "-"
                                )}
                            </strong>

                            <span class="
                                order-history-type
                                ${isElectrical
                                    ? "electrical"
                                    : "plumbing"}
                            ">
                                ${typeName}
                            </span>

                        </div>


                        <div class="order-history-customer">

                            👤
                            ${escapeHTML(
                                order.customer_name || "-"
                            )}

                        </div>


                        <div class="order-history-meta">

                            📅
                            ${escapeHTML(
                                order.order_date || "-"
                            )}

                            &nbsp;&nbsp;

                            📦
                            Qty:
                            ${order.total_quantity || 0}

                        </div>

                    </div>

                </div>


                <div class="order-history-actions">

                    <button
                        class="history-view-btn"
                        onclick="viewOrderDetails(${order.id})">

                        👁️ View

                    </button>


                    <button
                        class="history-delete-btn"
                        onclick="deleteOrderFromHistory(${order.id})">

                        🗑️ Delete

                    </button>

                </div>

            `;


            list.appendChild(card);

        });
}


/* =========================================================
   SEARCH + FILTER
========================================================= */

function filterOrderHistory() {

    const search =
        (
            document.getElementById(
                "orderHistorySearch"
            )?.value || ""
        )
        .toLowerCase()
        .trim();


    const type =
        document.getElementById(
            "orderHistoryType"
        )?.value || "all";


    const filtered =
        (window.mvsHistoryOrders || [])
        .filter(function (order) {

            const orderNo =
                (
                    order.order_no || ""
                ).toLowerCase();


            const customer =
                (
                    order.customer_name || ""
                ).toLowerCase();


            const orderType =
                (
                    order.order_type || ""
                ).toLowerCase();


            const matchesSearch =
                orderNo.includes(search) ||
                customer.includes(search);


            const matchesType =
                type === "all" ||
                orderType === type;


            return (
                matchesSearch &&
                matchesType
            );

        });


    renderOrderHistory(filtered);
}


/* =========================================================
   VIEW ORDER
========================================================= */

async function viewOrderDetails(orderId) {

    try {

        const order = await getOrder(orderId);

        let items = [];

        if (Array.isArray(order.items)) {

            items = order.items;

        } else if (typeof order.items === "string") {

            try {

                items = JSON.parse(order.items || "[]");

            } catch (error) {

                items = [];

            }
        }


        let itemText = "No item details available.";


        if (
            Array.isArray(items) &&
            items.length > 0
        ) {

            itemText = items
                .map(function (item, index) {

                    const name =
                        item.name ||
                        item.item_name ||
                        "Item";

                    const qty =
                        item.qty ??
                        item.quantity ??
                        0;

                    return (
                        `${index + 1}. ` +
                        `${name} — Qty: ${qty}`
                    );

                })
                .join("\n");
        }


        const typeName =
            order.order_type === "electrical"
                ? "⚡ ELECTRICAL"
                : order.order_type === "plumbing"
                    ? "🚰 PLUMBING"
                    : "🧱 CIVIL";


        alert(

            `${typeName} ORDER\n\n` +

            `Order No: ${
                order.order_no || "-"
            }\n` +

            `Customer: ${
                order.customer_name || "-"
            }\n` +

            `Phone: ${
                order.phone || "-"
            }\n` +

            `Date: ${
                order.order_date || "-"
            }\n\n` +

            `ITEMS\n` +

            `-------------------------\n` +

            `${itemText}\n\n` +

            `Total Qty: ${
                order.total_quantity ?? 0
            }`

        );


    } catch (error) {

        console.error(
            "Unable to load order:",
            error
        );

        alert(
            "Unable to load order:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   DELETE ORDER
========================================================= */

async function deleteOrderFromHistory(orderId) {

    const confirmDelete =
        confirm(
            "இந்த Order-ஐ delete செய்யவா?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await deleteOrder(orderId);


        window.mvsHistoryOrders =
            (window.mvsHistoryOrders || [])
            .filter(function (order) {

                return order.id !== orderId;

            });


        filterOrderHistory();


        alert(
            "Order deleted successfully ✅"
        );


    } catch (error) {

        alert(
            "Delete failed:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   CLOSE HISTORY
========================================================= */

function closeOrdersHistory() {

    const modal =
        document.getElementById(
            "ordersHistoryModal"
        );


    if (modal) {
        modal.remove();
    }
}

/* =========================================================
   PAGE LOAD / DOM INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       APP TYPE
       ========================================= */

    if (
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform()
    ) {
        document.body.classList.add("android-app");
    } else {
        document.body.classList.add("web-app");
    }


    /* =========================================
       RESTORE LAST OPEN PAGE AFTER F5
       ========================================= */

    const savedPage =
        localStorage.getItem(
            "mvsCurrentPage"
        );


    /* =========================================
       NO SAVED PAGE → HOME
       ========================================= */

    if (!savedPage) {

        goHome();

        return;
    }


    /* =========================================
       ELECTRICAL / PLUMBING
       ========================================= */

    if (
        savedPage === "electrical" ||
        savedPage === "plumbing"
    ) {

        openForm(savedPage);

        return;
    }


    /* =========================================
       HOME PLANNING
       ========================================= */

    if (
        savedPage === "homePlanning"
    ) {

        openHomePlanning();

        return;
    }


    /* =========================================
       OTHER PAGE
       ========================================= */

    const page =
        document.getElementById(
            savedPage
        );

    if (page) {

        document
            .querySelectorAll(".form-page")
            .forEach(function (item) {

                item.classList.remove("active");

                item.style.display = "none";

            });


        page.classList.add("active");

        page.style.display = "block";


        window.scrollTo(
            0,
            0
        );

        return;
    }


    /* =========================================
       INVALID SAVED PAGE → HOME
       ========================================= */

    localStorage.removeItem(
        "mvsCurrentPage"
    );

    goHome();

});