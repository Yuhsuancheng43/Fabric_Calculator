import { describe, it, expect } from "vitest";
import { calculateRow } from "./calculations";

const docrilSettings = {
    rollWidth: 1200,
    rollerAddition: 200,
    flapAddition: 400
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
        expect(result.data.rowTotal).toBe(6900);
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
        expect(result.data.dropRaw).toBe(1850); // 1650 + 200
        expect(result.data.dropRounded).toBe(1900); // rounded to nearest 100
        expect(result.data.rowTotal).toBe(5700); // 3 * 1900
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
        expect(result.data.rowTotal).toBe(13800); // 6 * 2300
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

    it('does not round up when dropRaw is already a multiple of 100', () => {
        const result = calculateRow({
            width: 1000,
            drop: 1400,
            hasFlap: false,
            quantity: 1,
            ...docrilSettings
        });

        expect(result.data.dropRaw).toBe(1600); // 1400 + 200
        expect(result.data.dropRounded).toBe(1600); // should not round up
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
