import FabricCalculator from './FabricCalculator';
import { calculateDocrilRow } from '../calculations';

/**
 * Fixed fabric specifications for Docril (confirmed with the factory).
 * panelMaxWidths: largest skin width (mm) that fits in 1, 2, 3... panels (the roll is 1200mm wide).
 * flapAddition / noFlapAddition: extra length (mm) added to the drop, depending on whether the row has a flap.
 * noFlapAdditionMultiStopRollup: replaces noFlapAddition when the order is MultiStop or Rollup.
 * totalAddition: extra length (mm) added once to the whole order's total, never per row.
 */
const docrilSettings = {
    panelMaxWidths: [1150, 2325, 3500, 4675, 5850, 7025],
    flapAddition: 500,
    noFlapAddition: 300,
    noFlapAdditionMultiStopRollup: 400,
    totalAddition: 200
};

/**
 * Builds the 3-line breakdown text for a single Docril row.
 * @param {{width: number, drop: number, hasFlap: boolean}} input - the parsed row inputs
 * @param {object} result - the success result returned by calculateDocrilRow
 * @returns {string} three lines joined by \n: panel count, drop addition, panel total
 */
function describeDocrilRow({ width, drop, hasFlap }, result) {
    const { panelsPerUnit, addition, dropRaw, dropRounded, totalPanels, rowTotalMetres } = result.data;
    const flapLabel = hasFlap ? ' (flap)' : '';

    // e.g. "2800 => 3 Panels"
    const line0 = `• ${width} => ${panelsPerUnit} Panels`;
    // e.g. "1650 + 500 (flap) = 2150" or "1800 + 300 = 2100"
    const line1 = `• ${drop} + ${addition}${flapLabel} = ${dropRaw}`;
    // e.g. "3 Panels @ 2.2m = 6.6m"
    const line2 = `• ${totalPanels} Panels @ ${dropRounded / 1000}m = ${rowTotalMetres}m`;

    return `${line0}\n${line1}\n${line2}`;
}

/**
 * Docril calculator: plugs the Docril rules into the shared FabricCalculator page.
 * @param {boolean} isMultiStopOrRollup - when true, rows without a flap use the larger no-flap addition
 */
function DocrilCalculator({ isMultiStopOrRollup }) {
    function calculateRow(input) {
        return calculateDocrilRow({
            ...input,
            ...docrilSettings,
            noFlapAddition: isMultiStopOrRollup
                ? docrilSettings.noFlapAdditionMultiStopRollup
                : docrilSettings.noFlapAddition
        });
    }

    return (
        <FabricCalculator
            calculateRow={calculateRow}
            describeRow={describeDocrilRow}
            totalAddition={docrilSettings.totalAddition}
        />
    );
}

export default DocrilCalculator;
