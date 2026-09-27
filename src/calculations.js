export function calculateRow({ width, drop, hasFlap, quantity, rollWidth, rollerAddition, flapAddition}) {
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

        // Roll Width validation
        if (typeof rollWidth !== 'number' || Number.isNaN(rollWidth) || rollWidth <= 0) {
            throw new Error('Invalid rollWidth value.');
        }

        // Panels needed for ONE unit of this width
        const panelsPerUnit = Math.ceil(width / rollWidth);

        // Total panels needed for the quantity
        const totalPanels = panelsPerUnit * quantity;

        // dropRaw calculation
        const dropRaw = drop + rollerAddition + (hasFlap ? flapAddition : 0);

        // Round dropRaw to the nearest 100
        const dropRounded = Math.ceil(dropRaw / 100) * 100;

        // Total fabric needed
        const rowTotal = totalPanels * dropRounded;

        return {
            success: true,
            data: {
                panelsPerUnit,
                totalPanels,
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