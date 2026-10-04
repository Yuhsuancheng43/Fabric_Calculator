export function calculateRow({ width, drop, hasFlap, quantity, panelMaxWidths, flapAddition, noFlapAddition }) {
    try {
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

        // Total panels needed for the quantity
        const totalPanels = panelsPerUnit * quantity;

        // Extra length added to the drop, then the drop after that addition
        const addition = hasFlap ? flapAddition : noFlapAddition;
        const dropRaw = drop + addition;

        // Round dropRaw to the nearest 100
        const dropRounded = Math.ceil(dropRaw / 100) * 100;

        // Total fabric needed
        const rowTotal = totalPanels * dropRounded;

        return {
            success: true,
            data: {
                panelsPerUnit,
                totalPanels,
                addition,
                dropRaw,
                dropRounded,
                rowTotal,
                rowTotalMetres: rowTotal / 1000
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
