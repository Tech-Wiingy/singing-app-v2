import React, { useState } from 'react';
import EmptyScreen from './EmptyScreen';
import SecondPage from './SecondPage';
import ThirdPage from './ThirdPage';
import FourthPage from './FourthPage';
import FifthPage from './FifthPage';
import SixthPage from './SixthPage';
import TopNav from './components/TopNav';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [gameData, setGameData] = useState({
    highestNoteFromPage2: null,
    lowestNoteFromPage3: null,
    lowestNoteFromPage5: null,
    lowestNoteFromPage6: null
  });

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <EmptyScreen onNavigate={setCurrentPage} />;
      case 'second':
        return <SecondPage onNavigate={setCurrentPage} onDataUpdate={setGameData} />;
      case 'third':
        return <ThirdPage onNavigate={setCurrentPage} onDataUpdate={setGameData} />;
      case 'fourth':
        return <FourthPage onNavigate={setCurrentPage} gameData={gameData} />;
      case 'fifth':
        return <FifthPage onNavigate={setCurrentPage} onDataUpdate={setGameData} />;
      case 'sixth':
        return <SixthPage onNavigate={setCurrentPage} onDataUpdate={setGameData} />;
      default:
        return <EmptyScreen onNavigate={setCurrentPage} />;
    }
  };


  return (
    <div className="App">
      {/* Animated Glass Background */}
      <div className="glass-background">
        <div className="glass-circle glass-circle-1"></div>
        <div className="glass-circle glass-circle-2"></div>
        <div className="glass-circle glass-circle-3"></div>
      </div>
      
      {renderCurrentPage()}
      
      {/* Top Navigation */}
      <TopNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;
