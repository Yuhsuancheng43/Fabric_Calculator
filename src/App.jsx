import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import FabricNav from './components/FabricNav';
import AwningOptions from './components/AwningOptions';
import Footer from './components/Footer';
import DocrilCalculator from './components/DocrilCalculator';
import ComingSoon from './components/ComingSoon';

function App() {
  const [selectedFabric, setSelectedFabric] = useState('Docril');
  // Lifted to App because the checkbox (AwningOptions) and the calculator are siblings.
  const [isMultiStopOrRollup, setIsMultiStopOrRollup] = useState(false);

  return (
    <div className="app-layout">
      <div className="app-top">
        <Header />
        <FabricNav selectedFabric={selectedFabric} onSelectFabric={setSelectedFabric} />
        <AwningOptions
          isMultiStopOrRollup={isMultiStopOrRollup}
          onMultiStopOrRollupChange={setIsMultiStopOrRollup}
        />
      </div>
      <main className="app-main">
        {selectedFabric === 'Docril' && <DocrilCalculator isMultiStopOrRollup={isMultiStopOrRollup} />}
        {selectedFabric === 'Outlook' && <ComingSoon fabric={selectedFabric} />}
        {selectedFabric === 'Vistaweave' && <ComingSoon fabric={selectedFabric} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
