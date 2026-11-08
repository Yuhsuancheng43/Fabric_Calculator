/**
 * Throws if any of the inputs every fabric needs is invalid.
 */
function validateRowInput({ width, drop, hasFlap, quantity }) {
    // Width validation
    if (typeof width !== 'number' || Number.isNaN(width) || width <= 0) {
        throw new Error('Invalid width value.');
    }

    // Drop validation
    if (typeof drop !== 'number' || Number.isNaN(drop) || drop <= 0) {
        throw new Error('Invalid drop value.');
    }

    // hasFlap validation
    if (typeof hasFlap !== 'boolean') {
        throw new Error('Invalid hasFlap value.');
    }

    // Quantity validation
    if (!Number.isInteger(quantity) || Number.isNaN(quantity) || quantity <=0) {
        throw new Error('Invalid quantity value.');
    }
}

/**
 * Turns "panels per unit + the drop addition" into the numbers shown for one row.
 * This part is the same for every fabric: only how panels and addition are decided differs.
 */
function buildRowData({ panelsPerUnit, quantity, drop, addition }) {
    // Total panels needed for the quantity
    const totalPanels = panelsPerUnit * quantity;

    // The drop after the addition
    const dropRaw = drop + addition;

    // Round dropRaw up to the nearest 100
    const dropRounded = Math.ceil(dropRaw / 100) * 100;

    // Total fabric needed
    const rowTotal = totalPanels * dropRounded;

    return {
        panelsPerUnit,
        totalPanels,
        addition,
        dropRaw,
        dropRounded,
        rowTotal,
        rowTotalMetres: rowTotal / 1000
    };
}

export function calculateDocrilRow({ width, drop, hasFlap, quantity, panelMaxWidths, flapAddition, noFlapAddition }) {
    try {
        validateRowInput({ width, drop, hasFlap, quantity });

        // Panel width table validation
        if (!Array.isArray(panelMaxWidths) || panelMaxWidths.length === 0) {
            throw new Error('Invalid panelMaxWidths value.');
        }

        // Panels needed for ONE unit of this width: the first table entry that fits the width.
        // panelMaxWidths[0] is the max width for 1 panel, [1] for 2 panels, and so on.
        const panelsPerUnit = panelMaxWidths.findIndex(maxWidth => width <= maxWidth) + 1;
        if (panelsPerUnit === 0) {
            throw new Error(`Width exceeds the maximum supported width (${panelMaxWidths[panelMaxWidths.length - 1]}mm).`);
        }

        // Extra length added to the drop
        const addition = hasFlap ? flapAddition : noFlapAddition;

        return {
            success: true,
            data: buildRowData({ panelsPerUnit, quantity, drop, addition })
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Outlook rows. Only the rules confirmed so far are supported: widths up to
 * maxWidth (one panel per unit), and a drop addition of either the zipscreen
 * amount (ignores the flap) or the flap amount. Anything else returns an error
 * instead of guessing a number.
 */
export function calculateOutlookRow({ width, drop, hasFlap, quantity, isZipscreen, maxWidth, flapAddition, zipscreenAddition }) {
    try {
        validateRowInput({ width, drop, hasFlap, quantity });

        // isZipscreen validation
        if (typeof isZipscreen !== 'boolean') {
            throw new Error('Invalid isZipscreen value.');
        }

        if (width > maxWidth) {
            throw new Error(`Outlook widths over ${maxWidth}mm aren't supported yet.`);
        }

        // Zipscreen replaces the flap rule; with neither, the no-flap addition isn't decided yet.
        let addition;
        if (isZipscreen) {
            addition = zipscreenAddition;
        } else if (hasFlap) {
            addition = flapAddition;
        } else {
            throw new Error("Outlook rows without a flap aren't supported yet (unless Zipscreen is ticked).");
        }

        return {
            success: true,
            data: buildRowData({ panelsPerUnit: 1, quantity, drop, addition })
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
