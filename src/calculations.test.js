import { describe, it, expect } from "vitest";
import { calculateRow } from "./calculations";

const docrilSettings = {
    panelMaxWidths: [1150, 2325, 3500, 4675, 5850, 7025],
    flapAddition: 500,
    noFlapAddition: 300
};

describe('calculateRow', () => {
    it('calculate correctly for a standard case with flap', () => {
        const result = calculateRow({
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
        const result = calculateRow({
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
        const result = calculateRow({
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
        const result = calculateRow({
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
        const result = calculateRow({
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
        const result = calculateRow({
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
        const rowA = calculateRow({ width: 2800, drop: 1800, hasFlap: false, quantity: 1, ...docrilSettings });
        const rowB = calculateRow({ width: 3450, drop: 1800, hasFlap: false, quantity: 1, ...docrilSettings });

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
        const result = calculateRow({ width, drop: 1800, hasFlap: false, quantity: 1, ...docrilSettings });

        expect(result.success).toBe(true);
        expect(result.data.panelsPerUnit).toBe(expectedPanels);
    });

    it('returns a failure result when width is wider than the largest panel range', () => {
        const result = calculateRow({
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
        const result = calculateRow({
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
        const result = calculateRow({
            width: NaN,
            drop: 1650,
            hasFlap: true,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.success).toBe(false);
    });
});
