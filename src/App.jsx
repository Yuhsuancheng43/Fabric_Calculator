import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import FabricNav from './components/FabricNav';
import Footer from './components/Footer';
import DocrilCalculator from './components/DocrilCalculator';
import ComingSoon from './components/ComingSoon';

function App() {
  const [selectedFabric, setSelectedFabric] = useState('Docril');

  return (
    <div className="app-layout">
      <Header />
      <FabricNav selectedFabric={selectedFabric} onSelectFabric={setSelectedFabric} />
      <main className="app-main">
        {selectedFabric === 'Docril' && <DocrilCalculator />}
        {selectedFabric === 'Outlook' && <ComingSoon fabric={selectedFabric} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;