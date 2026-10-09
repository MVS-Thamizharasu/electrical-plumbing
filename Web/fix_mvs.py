#!/usr/bin/env python3
"""
MVS CONSTRUCTION - auto fix script

Usage (project folder-la, script.js / index.html / style.css irukkura edathula):
    python fix_mvs.py
    python fix_mvs.py path/to/script.js path/to/index.html path/to/style.css

- Original files -> *.bak ah backup aagum
- Ovvoru patch-um [OK] / [SKIP] nu report pannum (match aagala na file-a touch pannaadhu)
"""
import re
import shutil
import sys
from pathlib import Path

JS = Path(sys.argv[1] if len(sys.argv) > 1 else "script.js")
HTML = Path(sys.argv[2] if len(sys.argv) > 2 else "index.html")
CSS = Path(sys.argv[3] if len(sys.argv) > 3 else "style.css")

report = []


def log(ok, msg):
    report.append(("[OK]   " if ok else "[SKIP] ") + msg)


def sub(text, name, pattern, repl, flags=re.S, count=1):
    r = (lambda m: repl) if isinstance(repl, str) else repl
    new, n = re.subn(pattern, r, text, count=count, flags=flags)
    log(n > 0, name)
    return new


def remove_function(text, name):
    m = re.search(r"^(?:async\s+)?function\s+" + name + r"\s*\(", text, re.M)
    if not m:
        log(False, f"delete unused function {name}()")
        return text
    i = text.index("{", m.end())
    depth, j = 0, i
    while j < len(text):
        if text[j] == "{":
            depth += 1
        elif text[j] == "}":
            depth -= 1
            if depth == 0:
                break
        j += 1
    end = j + 1
    start = m.start()
    prefix = text[:start]
    k = prefix.rfind("/*")
    if k != -1:
        tail = prefix[k:]
        if tail.strip().endswith("*/") and tail.count("*/") == 1:
            start = k
    log(True, f"delete unused function {name}()")
    return text[:start].rstrip() + "\n\n" + text[end:].lstrip()


# ---------------------------------------------------------------
# NEW JS (missing functions)
# ---------------------------------------------------------------
NEW_JS = r'''

/* =========================================================
   HOME PLANNING - ADD ROUND SHEET
   ========================================================= */

function addRoomRoundSheet(button) {

    const roomPoints = button.closest(".room-points");
    if (!roomPoints) return;

    const container =
        roomPoints.querySelector(".room-extra-round-sheets");
    if (!container) return;

    const row = document.createElement("div");
    row.className = "basic-item-row extra-round-sheet-row";

    row.innerHTML = `
        <label>Round Sheet</label>

        <select class="room-extra-round-sheet-select">
            <option value="">Select Round Sheet</option>
        </select>

        <input
            type="number"
            min="0"
            value="0"
            class="room-extra-round-sheet-qty"
        >

        <button
            type="button"
            class="remove-extra-btn"
            onclick="this.closest('.extra-round-sheet-row').remove(); updateHomeFinalTotal();">
            ×
        </button>
    `;

    container.appendChild(row);

    const select =
        row.querySelector(".room-extra-round-sheet-select");

    electricalData.forEach(function (item, index) {

        if (
            String(item.name || "").trim().toLowerCase() ===
            "round sheet"
        ) {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = item.name;
            select.appendChild(option);
        }

    });

    select.addEventListener("change", updateHomeFinalTotal);

    row.querySelector(".room-extra-round-sheet-qty")
        .addEventListener("input", updateHomeFinalTotal);

    updateHomeFinalTotal();
}


/* =========================================================
   HOME PLANNING - SAVE HOME
   ========================================================= */

function saveHomePlanning() {

    updateHomeFinalTotal();

    const customer = getValue("homeCustomer");

    if (!customer) {
        alert("Customer Name enter பண்ணவும்.");
        return;
    }

    const floors =
        Array.from(
            document.querySelectorAll("#floorList .home-floor")
        ).map(function (floor) {

            return {
                name: floor.dataset.floorName || "",
                rooms: Array.from(
                    floor.querySelectorAll(".room-box")
                )
                    .map(function (room) {
                        return room.dataset.roomName || "";
                    })
                    .filter(Boolean)
            };

        });

    const items =
        Array.from(
            document.querySelectorAll(
                "#final-total-list .final-total-row"
            )
        )
            .map(function (row) {

                const name =
                    row.querySelector(".final-item-name")
                        ?.textContent.trim() || "";

                const size =
                    row.querySelector(".final-item-size")
                        ?.textContent.trim() || "";

                const match =
                    (row.querySelector("strong")
                        ?.textContent || "").match(/[\d.]+/);

                return {
                    name: name,
                    size: size === "-" ? "" : size,
                    qty: match ? Number(match[0]) : 0
                };

            })
            .filter(function (item) {
                return item.name && item.qty > 0;
            });

    if (items.length === 0) {
        alert("FINAL TOTAL LIST-ல் items இல்லை.");
        return;
    }

    const plan = {

        billNo:
            document.getElementById("homeBillNo")
                ?.textContent.trim() || "",

        customer: customer,

        mobile: getValue("homeMobileNumber"),

        homeName: getValue("homeName"),

        date: getValue("homeDate"),

        floors: floors,

        items: items,

        savedAt: new Date().toISOString()

    };

    let plans = [];

    try {
        plans = JSON.parse(
            localStorage.getItem("mvsHomePlans") || "[]"
        );
    } catch (error) {
        plans = [];
    }

    plans.push(plan);

    try {
        localStorage.setItem(
            "mvsHomePlans",
            JSON.stringify(plans)
        );
    } catch (error) {
        alert("Save failed. Browser storage full ஆகி இருக்கலாம்.");
        return;
    }

    alert("Home plan saved ✅");
}
'''

# ===============================================================
# script.js
# ===============================================================
if JS.exists():
    shutil.copy(JS, str(JS) + ".bak")
    js = JS.read_text(encoding="utf-8")

    # 1. counter bug (undefined variable)
    js = sub(
        js,
        "openItemImage: undefined `counter` block delete",
        r"\n[ \t]*/\* =+\s*IMAGE COUNTER\s*=+ \*/\s*counter\.style\.cssText = `.*?`;\n",
        "\n",
    )

    # 2. currentSection -> currentForm
    js = sub(
        js,
        "saveOrder: currentSection -> currentForm",
        r"type \|\| currentSection \|\| \"electrical\"",
        'type || currentForm || "electrical"',
    )

    # 3. order number (duplicate numbers / plumbing ignoring displayed number)
    js = sub(
        js,
        "saveOrder: order number uses form's number",
        r'let orderNo = "";\s*if \(targetType === "electrical"\) \{.*?\} else \{\s*orderNo = `MVS-P\$\{Date\.now\(\)\}`;\s*\}',
        '''const orderNoElement =
        document.getElementById(
            targetType === "electrical"
                ? "electricalOrderNo"
                : "plumbingOrderNo"
        );

    const orderPrefix =
        targetType === "electrical" ? "MVS-E" : "MVS-P";

    const orderNo =
        orderNoElement?.textContent.trim() ||
        `${orderPrefix}${Date.now()}`;''',
    )

    js = sub(
        js,
        "saveOrder: update order counter after save",
        r"orders\.push\(localOrder\);",
        '''orders.push(localOrder);

        /* NEXT ORDER NUMBER */

        const savedNumber =
            Number(orderNo.replace(/\\D/g, ""));

        if (
            orderNoElement &&
            savedNumber > 0 &&
            savedNumber < 100000000
        ) {

            localStorage.setItem(
                targetType === "electrical"
                    ? "mvsElectricalOrderNo"
                    : "mvsPlumbingOrderNo",
                String(savedNumber)
            );

            orderNoElement.textContent =
                orderPrefix + (savedNumber + 1);
        }''',
    )

    # 4. duplicate DOMContentLoaded -> merge
    js = sub(
        js,
        "remove first DOMContentLoaded (setToday/loadItems)",
        r'document\.addEventListener\("DOMContentLoaded", function \(\) \{\s*setToday\(\);\s*loadItems\(\);\s*\}\);\n?',
        "",
    )
    js = sub(
        js,
        "merge setToday/loadItems into main DOMContentLoaded",
        r'document\.addEventListener\("DOMContentLoaded", \(\) => \{',
        'document.addEventListener("DOMContentLoaded", () => {\n\n    setToday();\n\n    loadItems();\n',
    )

    # 5. useless top-level call before data loads
    js = sub(
        js,
        "delete early populateFinalElectricalItems() call",
        r"/\*[^*]*?FINAL ELECTRICAL ITEMS - INITIAL LOAD[^*]*?\*/\s*populateFinalElectricalItems\(\);\n?",
        "",
    )

    # 6. Home customer details (wrong ids)
    js = sub(
        js,
        "getCustomerDetails: support home planning ids",
        r"function getCustomerDetails\(type\) \{",
        '''function getCustomerDetails(type) {

    if (type === "home") {

        return {
            name: getValue("homeCustomer"),
            ph: getValue("homeMobileNumber"),
            date: getValue("homeDate")
        };

    }
''',
    )

    js = sub(
        js,
        'Home PDF: "homeOrderNo" -> "homeBillNo"',
        r'getElementById\(\s*"homeOrderNo"\s*\)',
        'getElementById("homeBillNo")',
    )

    # 7. Floor edit button (no function, names are auto) -> delete
    js = sub(
        js,
        "delete floor edit button (editFloor not defined)",
        r'\s*<button\s+type="button"\s+class="floor-edit-btn"\s+onclick="editFloor\(this\)">\s*✎\s*</button>',
        "",
    )

    # 8. duplicate .room-extra-* containers in room template (keep first)
    for cls in ("fans", "lights", "round-sheets", "ceiling-roses"):
        tag = f'<div class="room-extra-{cls}"></div>'
        first = js.find(tag)
        second = js.find(tag, first + 1) if first != -1 else -1
        if second != -1:
            js = (
                js[:second].rstrip(" \t\r\n")
                + "\n\n                "
                + js[second + len(tag):].lstrip(" \t\r\n")
            )
            log(True, f"remove duplicate room-extra-{cls} container")
        else:
            log(False, f"remove duplicate room-extra-{cls} container")

    # 9. extra light rows -> update total
    js = sub(
        js,
        "extra light row: update final total on change",
        r"populateLightSelect\(lightSelect\);",
        '''populateLightSelect(lightSelect);

    lightSelect.addEventListener("change", updateHomeFinalTotal);

    row.querySelector(".room-light-qty")
        .addEventListener("input", updateHomeFinalTotal);''',
    )

    # 10. final total: count extra fan + extra round sheet rows
    js = sub(
        js,
        "final total: include extra fan / round sheet rows",
        r"/\*\s*=+\s*3\. MODULAR PLATE ITEMS",
        '''/* =========================================================
       2B. EXTRA FAN / EXTRA ROUND SHEET ROWS
       ========================================================= */

    document
        .querySelectorAll(
            ".extra-fan-row, .extra-round-sheet-row"
        )
        .forEach(function (row) {

            const select =
                row.querySelector("select");

            const qtyInput =
                row.querySelector("input[type='number']");

            if (!select || !select.value) return;

            addTotal(
                electricalData[Number(select.value)],
                Number(qtyInput?.value) || 0
            );

        });


    /* =========================================================
       3. MODULAR PLATE ITEMS''',
    )

    # 11. dead code
    for fn in (
        "preparePDFBill",
        "updateCustomRowState",
        "getElectricalImage",
        "setupPlateHeader",
        "toggleHomePlate",
    ):
        js = remove_function(js, fn)

    # 12. missing functions
    if "function saveHomePlanning" not in js:
        js = js.rstrip() + "\n" + NEW_JS
        log(True, "add addRoomRoundSheet() + saveHomePlanning()")
    else:
        log(False, "add addRoomRoundSheet() + saveHomePlanning() (already present)")

    JS.write_text(js, encoding="utf-8")
else:
    log(False, f"{JS} not found")

# ===============================================================
# index.html
# ===============================================================
if HTML.exists():
    shutil.copy(HTML, str(HTML) + ".bak")
    html = HTML.read_text(encoding="utf-8")

    html = sub(
        html,
        "delete nav button: openElectricalEstimation (no function, duplicate of Electrical)",
        r'\s*<button type="button" class="nav-item" onclick="openElectricalEstimation\(\)">\s*⚡ Estimation\s*</button>',
        "",
    )
    html = sub(
        html,
        "delete unused datalists",
        r'\s*<datalist id="electricalSuggestions">\s*</datalist>\s*<datalist id="plumbingSuggestions">\s*</datalist>',
        "",
    )
    html = sub(
        html,
        "delete SMART SUGGESTIONS comment",
        r"<!--[^>]*?SMART SUGGESTIONS[^>]*?-->\s*",
        "",
    )
    html = sub(
        html,
        "delete never-shown final-size-label",
        r'\s*<label id="final-size-label" style="display:none;">\s*Amp / Size\s*</label>',
        "",
    )
    html = sub(
        html,
        "delete never-shown final-color-label",
        r'\s*<label id="final-color-label" style="display:none;">\s*Color\s*</label>',
        "",
    )

    HTML.write_text(html, encoding="utf-8")
else:
    log(False, f"{HTML} not found")

# ===============================================================
# style.css
# ===============================================================
if CSS.exists():
    shutil.copy(CSS, str(CSS) + ".bak")
    css = CSS.read_text(encoding="utf-8")

    css = sub(
        css,
        "mobile bottom nav: remove !important (mobile-la show aaga)",
        r"(\.mobile-bottom-nav\s*\{\s*display:\s*none)\s*!important;",
        lambda m: m.group(1) + ";",
    )

    CSS.write_text(css, encoding="utf-8")
else:
    log(False, f"{CSS} not found")

print("\n".join(report))
print("\nMudinjudhu. [SKIP] vandha line-a enakku anuppunga, naan paathu sari pannuren.")
