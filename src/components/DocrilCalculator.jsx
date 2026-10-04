import './DocrilCalculator.css';
import { useState, Fragment } from "react";
import { calculateRow } from '../calculations';

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
 * Creates a blank row with default values.
 * @param {number} id - unique id used as the React key and for updating/removing this row.
 * @returns {{id: number, width: string, drop: string, hasFlap: boolean, quantity: number}}
 */
function createEmptyRow(id) {
    return { id, width: '', drop: '', hasFlap: false, quantity: 1 };
}

/**
 * Builds the 3-line breakdown text for a single row's calculation result.
 * @param {number} width - original width input (mm)
 * @param {number} drop - original drop input (mm)
 * @param {boolean} hasFlap - whether the flap addition applies
 * @param {object} result - the success result returned by calculateRow
 * @returns {string} three lines joined by \n: panel count, drop addition, panel total
 */
function buildOutputText(width, drop, hasFlap, result) {
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
 * Combines every row's output text into the full textarea content, followed
 * by the order total (all rows added together, plus the fixed addition once).
 * @param {Array} rows - the current rows state (raw string inputs)
 * @param {Array} results - calculateRow results, one per row, same order as rows
 * @returns {string} the full text to show in the output textarea
 */
function buildAllOutputText(rows, results) {
    const blocks = rows.map((row, index) => {
        const label = rows.length > 1 ? `Row ${index + 1}:\n` : '';
        return label + buildOutputText(parseInt(row.width), parseInt(row.drop), row.hasFlap, results[index]);
    });

    // Totals stay in whole millimetres until the very end to avoid floating-point noise.
    const rowTotals = results.map(r => r.data.rowTotal);
    const subtotal = rowTotals.reduce((sum, t) => sum + t, 0);
    const total = subtotal + docrilSettings.totalAddition;
    // Only meaningful to show "N Panels @ Xm" when every row rounds to the
    // same drop length - otherwise the panels are different lengths and can't
    // be combined into one "@ length" figure.
    const allSameDrop = results.every(r => r.data.dropRounded === results[0].data.dropRounded);

    let summaryLines;
    if (rows.length > 1 && allSameDrop) {
        const totalPanelsSum = results.reduce((sum, r) => sum + r.data.totalPanels, 0);
        summaryLines = [
            `${totalPanelsSum} Panels @ ${results[0].data.dropRounded / 1000}m = ${subtotal / 1000}m`,
            `Total: ${subtotal} + ${docrilSettings.totalAddition} = ${total / 1000}m`
        ];
    } else {
        summaryLines = [`Total: ${rowTotals.join(' + ')} + ${docrilSettings.totalAddition} = ${total / 1000}m`];
    }

    const rowSeparator = '-'.repeat(30);
    const totalSeparator = '='.repeat(30);
    return `${blocks.join(`\n${rowSeparator}\n`)}\n${totalSeparator}\n${summaryLines.join('\n')}`;
}

/**
 * Docril fabric calculator page: a list of rows (width/drop/flap/quantity),
 * each row can be added or removed, and Calculate produces an editable
 * text summary of how much fabric to order.
 * @param {boolean} isMultiStopOrRollup - when true, rows without a flap use the larger no-flap addition
 */
function Docril({ isMultiStopOrRollup }) {
    // Each row holds its own raw input values; inputs are still strings here
    // and get converted to numbers only when calculating (see handleCalculate).
    const [rows, setRows] = useState([createEmptyRow(1)]);
    const [outputText, setOutputText] = useState('');
    const [result, setResult] = useState(null);

    /** Immutably updates a single field of the row matching id. */
    function updateRow(id, field, value) {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    }

    /** Appends a new blank row at the end of the list. */
    function addRow() {
        setRows([...rows, createEmptyRow(Date.now())]);
    }

    /** Removes the row matching id. The first row's remove button is hidden in the UI below, so it's never called for it. */
    function removeRow(id) {
        setRows(rows.filter(row => row.id !== id));
    }

    /**
     * Runs calculateRow for every row. If any row is invalid, shows that
     * row's error and clears the output. If all rows are valid, builds the
     * combined output text.
     */
    function handleCalculate() {
        const results = rows.map(row => calculateRow({
            width: parseInt(row.width),
            drop: parseInt(row.drop),
            hasFlap: row.hasFlap,
            quantity: parseInt(row.quantity),
            ...docrilSettings,
            noFlapAddition: isMultiStopOrRollup
                ? docrilSettings.noFlapAdditionMultiStopRollup
                : docrilSettings.noFlapAddition
        }));

        const firstError = results.find(r => !r.success);

        if (firstError) {
            setResult(firstError);
            setOutputText('');
            return;
        }

        setResult({ success: true });
        setOutputText(buildAllOutputText(rows, results));
    }

    /** Resets the form back to a single blank row and clears any output/error. */
    function handleClear() {
        setRows([createEmptyRow(1)]);
        setResult(null);
        setOutputText('');
    }

    return (
        <div className="docril-page">
            <div className="docril-card">
                <div className="fields-grid-scroll">
                <div className="fields-grid">
                    <label className="field-label">Quantity</label>
                    <label className="field-label">Width (mm)</label>
                    <label className="field-label">Drop (mm)</label>
                    <label className="field-label">Flap</label>
                    <span className="field-label"></span>

                    {rows.map((row, index) => (
                        <Fragment key={row.id}>
                            <input
                                className="field-input"
                                type="number"
                                value={row.quantity}
                                onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                            />
                            <input
                                className="field-input"
                                type="number"
                                value={row.width}
                                onChange={(e) => updateRow(row.id, 'width', e.target.value)}
                            />
                            <input
                                className="field-input"
                                type="number"
                                value={row.drop}
                                onChange={(e) => updateRow(row.id, 'drop', e.target.value)}
                            />
                            <input
                                className="field-checkbox"
                                type="checkbox"
                                checked={row.hasFlap}
                                onChange={(e) => updateRow(row.id, 'hasFlap', e.target.checked)}
                            />
                            <span className="row-actions">
                                <button type="button" className="row-action-button" onClick={addRow}>+</button>
                                {/* Remove button only renders for rows after the first, so row 0 can never be deleted. */}
                                {index > 0 && (
                                    <button type="button" className="row-action-button" onClick={() => removeRow(row.id)}>-</button>
                                )}
                            </span>
                        </Fragment>
                    ))}
                </div>
                </div>

                <div className="button-row">
                    <button className="clear-button" onClick={handleClear}>Clear</button>
                    <button className="calculate-button" onClick={handleCalculate}>Calculate</button>
                </div>

                {result && !result.success && (
                    <p className="error-message">{result.error}</p>
                )}

                {/* Editable but not saved anywhere - purely for the user to copy/tweak the generated text. */}
                <textarea
                    className="output-textarea"
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                    rows={Math.max(5, outputText.split('\n').length)}
                    wrap="off"
                />
            </div>
        </div>
    );
}

export default Docril;
