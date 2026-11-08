import FabricCalculator from './FabricCalculator';
import { calculateOutlookRow } from '../calculations';

/**
 * Outlook specifications confirmed so far.
 * maxWidth: widest skin width (mm) supported for now (one panel per unit); wider widths aren't decided yet.
 * flapAddition: extra length (mm) added to the drop when the row has a flap.
 * zipscreenAddition: extra length (mm) added to the drop for Zipscreen orders, whatever the flap is.
 * totalAddition: extra length (mm) added once to the whole order's total, never per row.
 */
const outlookSettings = {
    maxWidth: 3200,
    flapAddition: 500,
    zipscreenAddition: 200,
    totalAddition: 200
};

/**
 * Builds the 2-line breakdown text for a single Outlook row.
 * @param {{drop: number}} input - the parsed row inputs
 * @param {object} result - the success result returned by calculateOutlookRow
 * @param {boolean} isZipscreen - whether the order is Zipscreen (otherwise a successful row always has a flap)
 * @returns {string} two lines joined by \n: drop addition, panel total
 */
function describeOutlookRow({ drop }, result, isZipscreen) {
    const { addition, dropRaw, dropRounded, totalPanels, rowTotalMetres } = result.data;
    const label = isZipscreen ? ' (zipscreen)' : ' (flap)';

    // e.g. "2100 + 500 (flap) = 2600"
    const line1 = `• ${drop} + ${addition}${label} = ${dropRaw}`;
    // e.g. "2 Panels @ 2.6m = 5.2m"
    const line2 = `• ${totalPanels} Panels @ ${dropRounded / 1000}m = ${rowTotalMetres}m`;

    return `${line1}\n${line2}`;
}

/**
 * Outlook calculator: plugs the Outlook rules into the shared FabricCalculator page.
 * @param {boolean} isZipscreen - when true, every row's drop gets the zipscreen addition instead of the flap one
 */
function OutlookCalculator({ isZipscreen }) {
    function calculateRow(input) {
        return calculateOutlookRow({ ...input, isZipscreen, ...outlookSettings });
    }

    function describeRow(input, result) {
        return describeOutlookRow(input, result, isZipscreen);
    }

    return (
        <FabricCalculator
            calculateRow={calculateRow}
            describeRow={describeRow}
            totalAddition={outlookSettings.totalAddition}
        />
    );
}

export default OutlookCalculator;
