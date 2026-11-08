import { describe, it, expect } from "vitest";
import { calculateDocrilRow, calculateOutlookRow } from "./calculations";

const docrilSettings = {
    panelMaxWidths: [1150, 2325, 3500, 4675, 5850, 7025],
    flapAddition: 500,
    noFlapAddition: 300
};

describe('calculateDocrilRow', () => {
    it('calculate correctly for a standard case with flap', () => {
        const result = calculateDocrilRow({
            width: 2900,
            drop: 1650,
            hasFlap: true,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.success).toBe(true);
        expect(result.data.panelsPerUnit).toBe(3);
        expect(result.data.addition).toBe(500);
        expect(result.data.dropRaw).toBe(2150); // 1650 + 500
        expect(result.data.dropRounded).toBe(2200); // rounded up to nearest 100
        expect(result.data.rowTotal).toBe(6600); // 3 * 2200
    });

    it('calculate correctly for a standard case without flap', () => {
        const result = calculateDocrilRow({
            width: 2900,
            drop: 1650,
            hasFlap: false,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.success).toBe(true);
        expect(result.data.panelsPerUnit).toBe(3);
        expect(result.data.addition).toBe(300);
        expect(result.data.dropRaw).toBe(1950); // 1650 + 300
        expect(result.data.dropRounded).toBe(2000); // rounded up to nearest 100
        expect(result.data.rowTotal).toBe(6000); // 3 * 2000
    });

    it('uses whatever no-flap addition it is given (400 for MultiStop / Rollup)', () => {
        const result = calculateDocrilRow({
            width: 2800,
            drop: 1800,
            hasFlap: false,
            quantity: 1,
            ...docrilSettings,
            noFlapAddition: 400
        });

        expect(result.data.addition).toBe(400);
        expect(result.data.dropRaw).toBe(2200); // 1800 + 400
        expect(result.data.rowTotal).toBe(6600); // 3 * 2200
    });

    it('does not use the no-flap addition when the row has a flap', () => {
        const result = calculateDocrilRow({
            width: 2800,
            drop: 1800,
            hasFlap: true,
            quantity: 1,
            ...docrilSettings,
            noFlapAddition: 400
        });

        expect(result.data.addition).toBe(500);
    });

    it('multiplies panels correctly when quantity is greater than 1', () => {
        const result = calculateDocrilRow({
            width: 2900,
            drop: 1650,
            hasFlap: true,
            quantity: 2,
            ...docrilSettings
        });

        expect(result.success).toBe(true);
        expect(result.data.panelsPerUnit).toBe(3);
        expect(result.data.totalPanels).toBe(6); // 3 panels per unit * 2 units
        expect(result.data.rowTotal).toBe(13200); // 6 * 2200
    });

    it('does not round up when dropRaw is already a multiple of 100', () => {
        const result = calculateDocrilRow({
            width: 2800,
            drop: 1800,
            hasFlap: false,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.data.dropRaw).toBe(2100); // 1800 + 300
        expect(result.data.dropRounded).toBe(2100); // should not round up
    });

    it('matches the worked example: two rows, no flap, drop 1800', () => {
        const rowA = calculateDocrilRow({ width: 2800, drop: 1800, hasFlap: false, quantity: 1, ...docrilSettings });
        const rowB = calculateDocrilRow({ width: 3450, drop: 1800, hasFlap: false, quantity: 1, ...docrilSettings });

        expect(rowA.data.totalPanels + rowB.data.totalPanels).toBe(6);
        expect(rowA.data.dropRounded).toBe(2100);
        expect(rowA.data.rowTotal + rowB.data.rowTotal).toBe(12600); // 6 * 2100
    });

    it.each([
        [1150, 1],
        [1151, 2],
        [2325, 2],
        [2326, 3],
        [3500, 3],
        [3501, 4],
        [4675, 4],
        [4676, 5],
        [5850, 5],
        [5851, 6],
        [7025, 6]
    ])('width %i needs %i panel(s)', (width, expectedPanels) => {
        const result = calculateDocrilRow({ width, drop: 1800, hasFlap: false, quantity: 1, ...docrilSettings });

        expect(result.success).toBe(true);
        expect(result.data.panelsPerUnit).toBe(expectedPanels);
    });

    it('returns a failure result when width is wider than the largest panel range', () => {
        const result = calculateDocrilRow({
            width: 7026,
            drop: 1800,
            hasFlap: false,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Width exceeds the maximum supported width (7025mm).');
    });

    it('returns a failure result when width is invalid', () => {
        const result = calculateDocrilRow({
            width: -1000,
            drop: 1650,
            hasFlap: true,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid width value.');
    });

    it('returns a failure result when width is NaN', () => {
        const result = calculateDocrilRow({
            width: NaN,
            drop: 1650,
            hasFlap: true,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.success).toBe(false);
    });
});

const outlookSettings = {
    maxWidth: 3200,
    flapAddition: 500,
    zipscreenAddition: 200
};

describe('calculateOutlookRow', () => {
    it('matches the worked example: 2 x width 2110, drop 2100, flap', () => {
        const result = calculateOutlookRow({
            width: 2110,
            drop: 2100,
            hasFlap: true,
            quantity: 2,
            isZipscreen: false,
            ...outlookSettings
        });

        expect(result.success).toBe(true);
        expect(result.data.totalPanels).toBe(2); // one panel per unit
        expect(result.data.addition).toBe(500);
        expect(result.data.dropRounded).toBe(2600); // 2100 + 500
        expect(result.data.rowTotal).toBe(5200); // 2 * 2600
    });

    it('matches the worked example: two rows with different drops', () => {
        const rowA = calculateOutlookRow({ width: 2160, drop: 1800, hasFlap: true, quantity: 1, isZipscreen: false, ...outlookSettings });
        const rowB = calculateOutlookRow({ width: 1800, drop: 900, hasFlap: true, quantity: 1, isZipscreen: false, ...outlookSettings });

        expect(rowA.data.rowTotal).toBe(2300); // 1800 + 500
        expect(rowB.data.rowTotal).toBe(1400); // 900 + 500
    });

    it('rounds the drop up to the nearest 100', () => {
        const result = calculateOutlookRow({
            width: 2000,
            drop: 1975,
            hasFlap: true,
            quantity: 1,
            isZipscreen: false,
            ...outlookSettings
        });

        expect(result.data.dropRaw).toBe(2475); // 1975 + 500
        expect(result.data.dropRounded).toBe(2500);
    });

    it('allows a width of exactly 3200 (one panel)', () => {
        const result = calculateOutlookRow({
            width: 3200,
            drop: 1800,
            hasFlap: true,
            quantity: 1,
            isZipscreen: false,
            ...outlookSettings
        });

        expect(result.success).toBe(true);
        expect(result.data.panelsPerUnit).toBe(1);
    });

    it.each([
        [true],
        [false]
    ])('zipscreen adds 200 to the drop whatever the flap is (flap: %s)', (hasFlap) => {
        const result = calculateOutlookRow({
            width: 2000,
            drop: 1800,
            hasFlap,
            quantity: 1,
            isZipscreen: true,
            ...outlookSettings
        });

        expect(result.success).toBe(true);
        expect(result.data.addition).toBe(200);
        expect(result.data.rowTotal).toBe(2000); // 1800 + 200
    });

    it('returns a failure result when width is over 3200 (rule not decided yet)', () => {
        const result = calculateOutlookRow({
            width: 3201,
            drop: 1800,
            hasFlap: true,
            quantity: 1,
            isZipscreen: false,
            ...outlookSettings
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe("Outlook widths over 3200mm aren't supported yet.");
    });

    it('returns a failure result for no flap and no zipscreen (rule not decided yet)', () => {
        const result = calculateOutlookRow({
            width: 2000,
            drop: 1800,
            hasFlap: false,
            quantity: 1,
            isZipscreen: false,
            ...outlookSettings
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe("Outlook rows without a flap aren't supported yet (unless Zipscreen is ticked).");
    });

    it('returns a failure result when width is invalid', () => {
        const result = calculateOutlookRow({
            width: -1,
            drop: 1800,
            hasFlap: true,
            quantity: 1,
            isZipscreen: false,
            ...outlookSettings
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid width value.');
    });
});
