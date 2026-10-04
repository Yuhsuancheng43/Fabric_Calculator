import './FabricNav.css';

const fabrics = ['Docril', 'Outlook', 'Vistaweave'];

function FabricNav({ selectedFabric, onSelectFabric }) {
    return (
        <nav className="fabric-nav">
            {fabrics.map(fabric => (
                <button
                    key={fabric}
                    className={`fabric-nav-button ${selectedFabric === fabric ? 'active' : ''}`}
                    onClick={() => onSelectFabric(fabric)}
                >
                    {fabric}
                </button>
            ))}
        </nav>
    );
}

export default FabricNav;
