import './AwningOptions.css';

/**
 * Order-level checkboxes shown under the fabric buttons.
 * Controlled by App so the chosen values can also reach the calculator.
 * @param {Array<{label: string, checked: boolean, onChange: Function}>} options - one checkbox per entry
 */
function AwningOptions({ options }) {
    if (options.length === 0) {
        return null;
    }

    return (
        <div className="awning-options">
            {options.map(option => (
                <label key={option.label} className="awning-option">
                    <input
                        type="checkbox"
                        checked={option.checked}
                        onChange={(e) => option.onChange(e.target.checked)}
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
}

export default AwningOptions;
