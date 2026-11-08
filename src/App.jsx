import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import FabricNav from './components/FabricNav';
import AwningOptions from './components/AwningOptions';
import Footer from './components/Footer';
import DocrilCalculator from './components/DocrilCalculator';
import OutlookCalculator from './components/OutlookCalculator';
import ComingSoon from './components/ComingSoon';

function App() {
  const [selectedFabric, setSelectedFabric] = useState('Docril');
  // Lifted to App because the checkboxes (AwningOptions) and the calculators are siblings.
  const [isMultiStopOrRollup, setIsMultiStopOrRollup] = useState(false);
  const [isZipscreen, setIsZipscreen] = useState(false);

  // Which checkboxes appear under the fabric buttons depends on the selected fabric.
  const optionsByFabric = {
    Docril: [{ label: 'MultiStop / Rollup', checked: isMultiStopOrRollup, onChange: setIsMultiStopOrRollup }],
    Outlook: [{ label: 'Zipscreen', checked: isZipscreen, onChange: setIsZipscreen }]
  };

  return (
    <div className="app-layout">
      <div className="app-top">
        <Header />
        <FabricNav selectedFabric={selectedFabric} onSelectFabric={setSelectedFabric} />
        <AwningOptions options={optionsByFabric[selectedFabric] ?? []} />
      </div>
      <main className="app-main">
        {selectedFabric === 'Docril' && <DocrilCalculator isMultiStopOrRollup={isMultiStopOrRollup} />}
        {selectedFabric === 'Outlook' && <OutlookCalculator isZipscreen={isZipscreen} />}
        {selectedFabric === 'Vistaweave' && <ComingSoon fabric={selectedFabric} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
