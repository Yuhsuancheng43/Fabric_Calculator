import './DocrilCalculator.css';
import { useState, Fragment } from "react";
import { calculateRow } from '../calculations';

/**
 * Fixed fabric specifications for Docril.
 * rollWidth: width of one fabric roll (mm), used to work out how many panels are needed.
 * rollerAddition: extra length always added to the drop, regardless of flap.
 * flapAddition: extra length added to the drop only when the row has a flap.
 */
const docrilSettings = {
    rollWidth: 1200,
    rollerAddition: 200,
    flapAddition: 400
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
 * @returns {string} three lines joined by \n: panel division, drop addition, panel total
 */
function buildOutputText(width, drop, hasFlap, result) {
    const { panelsPerUnit, dropRaw, dropRounded, totalPanels, rowTotalMetres } = result.data;
    const flapPart = hasFlap ? ` + ${docrilSettings.flapAddition} (flap)` : '';

    // e.g. "2900 / 1200 = 2.4 => 3"
    const line0 = `• ${width} / ${docrilSettings.rollWidth} = ${(width / docrilSettings.rollWidth).toFixed(1)} => ${panelsPerUnit}`;
    // e.g. "1650 + 200 (roller) + 400 (flap) = 2250"
    const line1 = `• ${drop} + ${docrilSettings.rollerAddition} (roller)${flapPart} = ${dropRaw}`;
    // e.g. "3 Panels @ 2.3m = 6.9m Total"
    const line2 = `• ${totalPanels} Panels @ ${dropRounded / 1000}m = ${rowTotalMetres}m Total`;

    return `${line0}\n${line1}\n${line2}`;
}

/**
 * Combines every row's output text into the full textarea content, plus a
 * grand total line summing all rows.
 * @param {Array} rows - the current rows state (raw string inputs)
 * @param {Array} results - calculateRow results, one per row, same order as rows
 * @returns {string} the full text to show in the output textarea
 */
function buildAllOutputText(rows, results) {
    const blocks = rows.map((row, index) => {
        const label = rows.length > 1 ? `Row ${index + 1}:\n` : '';
        return label + buildOutputText(parseInt(row.width), parseInt(row.drop), row.hasFlap, results[index]);
    });

    if (rows.length === 1) {
        return blocks[0];
    }

    const grandTotal = results.reduce((sum, r) => sum + r.data.rowTotalMetres, 0);
    // Only meaningful to show "N Panels @ Xm" for the grand total when every
    // row rounds to the same drop length - otherwise the panels are different
    // lengths and can't be combined into one "@ length" figure.
    const allSameDrop = results.every(r => r.data.dropRounded === results[0].data.dropRounded);

    let totalLine;
    if (allSameDrop) {
        const totalPanelsSum = results.reduce((sum, r) => sum + r.data.totalPanels, 0);
        const dropRoundedMetres = results[0].data.dropRounded / 1000;
        totalLine = `Grand Total: ${totalPanelsSum} Panels @ ${dropRoundedMetres}m = ${grandTotal.toFixed(1)}m Total`;
    } else {
        totalLine = `Grand Total: ${grandTotal.toFixed(1)}m`;
    }

    return `${blocks.join('\n\n')}\n\n${totalLine}`;
}

/**
 * Docril fabric calculator page: a list of rows (width/drop/flap/quantity),
 * each row can be added or removed, and Calculate produces an editable
 * text summary of how much fabric to order.
 */
function Docril() {
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
            ...docrilSettings
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
                    rows={5}
                    wrap="off"
                />
            </div>
        </div>
    );
}

export default Docril;
