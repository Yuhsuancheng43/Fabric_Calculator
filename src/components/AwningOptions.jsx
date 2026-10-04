import './AwningOptions.css';

/**
 * Order-level option shown under the fabric buttons.
 * Controlled by App so the selected value can also reach the calculator.
 */
function AwningOptions({ isMultiStopOrRollup, onMultiStopOrRollupChange }) {
    return (
        <div className="awning-options">
            <label className="awning-option">
                <input
                    type="checkbox"
                    checked={isMultiStopOrRollup}
                    onChange={(e) => onMultiStopOrRollupChange(e.target.checked)}
                />
                MultiStop / Rollup
            </label>
        </div>
    );
}

export default AwningOptions;
