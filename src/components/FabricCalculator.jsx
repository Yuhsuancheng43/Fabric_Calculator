import './FabricCalculator.css';
import { useState, Fragment } from "react";

/**
 * Creates a blank row with default values.
 * @param {number} id - unique id used as the React key and for updating/removing this row.
 * @returns {{id: number, width: string, drop: string, hasFlap: boolean, quantity: number}}
 */
function createEmptyRow(id) {
    return { id, width: '', drop: '', hasFlap: false, quantity: 1 };
}

/**
 * Combines every row's output text into the full textarea content, followed
 * by the order total (all rows added together, plus the fixed addition once).
 * @param {Array} inputs - the parsed row inputs ({ width, drop, hasFlap, quantity }), one per row
 * @param {Array} results - the calculation results, one per row, same order as inputs
 * @param {Function} describeRow - (input, result) => the text lines for one row
 * @param {number} totalAddition - extra length (mm) added once to the whole order's total
 * @returns {string} the full text to show in the output textarea
 */
function buildAllOutputText(inputs, results, describeRow, totalAddition) {
    const blocks = inputs.map((input, index) => {
        const label = inputs.length > 1 ? `Row ${index + 1}:\n` : '';
        return label + describeRow(input, results[index]);
    });

    // Totals stay in whole millimetres until the very end to avoid floating-point noise.
    const rowTotals = results.map(r => r.data.rowTotal);
    const subtotal = rowTotals.reduce((sum, t) => sum + t, 0);
    const total = subtotal + totalAddition;
    // Only meaningful to show "N Panels @ Xm" when every row rounds to the
    // same drop length - otherwise the panels are different lengths and can't
    // be combined into one "@ length" figure.
    const allSameDrop = results.every(r => r.data.dropRounded === results[0].data.dropRounded);

    let summaryLines;
    if (inputs.length > 1 && allSameDrop) {
        const totalPanelsSum = results.reduce((sum, r) => sum + r.data.totalPanels, 0);
        summaryLines = [
            `${totalPanelsSum} Panels @ ${results[0].data.dropRounded / 1000}m = ${subtotal / 1000}m`,
            `Total: ${subtotal} + ${totalAddition} = ${total / 1000}m`
        ];
    } else {
        summaryLines = [`Total: ${rowTotals.join(' + ')} + ${totalAddition} = ${total / 1000}m`];
    }

    const rowSeparator = '-'.repeat(30);
    const totalSeparator = '='.repeat(30);
    return `${blocks.join(`\n${rowSeparator}\n`)}\n${totalSeparator}\n${summaryLines.join('\n')}`;
}

/**
 * Calculator page shared by every fabric: a list of rows (width/drop/flap/quantity),
 * each row can be added or removed, and Calculate produces an editable
 * text summary of how much fabric to order. The fabric-specific rules are
 * passed in, so every fabric gets the same table and the same kind of output.
 * @param {Function} calculateRow - (input) => { success, data } or { success: false, error }, for one parsed row
 * @param {Function} describeRow - (input, result) => the text lines shown for one row
 * @param {number} totalAddition - extra length (mm) added once to the whole order's total
 */
function FabricCalculator({ calculateRow, describeRow, totalAddition }) {
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
        const inputs = rows.map(row => ({
            width: parseInt(row.width),
            drop: parseInt(row.drop),
            hasFlap: row.hasFlap,
            quantity: parseInt(row.quantity)
        }));
        const results = inputs.map(input => calculateRow(input));

        const firstError = results.find(r => !r.success);

        if (firstError) {
            setResult(firstError);
            setOutputText('');
            return;
        }

        setResult({ success: true });
        setOutputText(buildAllOutputText(inputs, results, describeRow, totalAddition));
    }

    /** Resets the form back to a single blank row and clears any output/error. */
    function handleClear() {
        setRows([createEmptyRow(1)]);
        setResult(null);
        setOutputText('');
    }

    return (
        <div className="calculator-page">
            <div className="calculator-card">
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

export default FabricCalculator;
