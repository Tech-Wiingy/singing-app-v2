import React from 'react';

const BottomNav = ({ currentPage, onNavigate }) => {
  const pageOrder = ['home', 'second', 'third', 'fourth', 'fifth'];
  const currentIndex = pageOrder.indexOf(currentPage);
  
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < pageOrder.length - 1;
  
  const handlePrevious = () => {
    if (canGoPrevious) {
      onNavigate(pageOrder[currentIndex - 1]);
    }
  };
  
  const handleNext = () => {
    if (canGoNext) {
      onNavigate(pageOrder[currentIndex + 1]);
    }
  };

  const getPageTitle = (page) => {
    switch (page) {
      case 'home':
        return 'Home';
      case 'second':
        return 'Go Higher';
      case 'third':
        return 'Go Lower';
      case 'fourth':
        return 'Your Range';
      case 'fifth':
        return 'Even Lower';
      default:
        return 'Home';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'white',
      borderTop: '1px solid #DDDDDD',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      fontFamily: 'Figtree, sans-serif'
    }}>
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          color: canGoPrevious ? 'var(--content-primary)' : '#CCCCCC',
          border: `1px solid ${canGoPrevious ? 'var(--content-primary)' : '#DDDDDD'}`,
          borderRadius: '0.5rem',
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.75rem',
          fontWeight: '500',
          cursor: canGoPrevious ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          minWidth: '100px'
        }}
      >
        <span style={{ fontSize: '1rem' }}>←</span>
        Previous
      </button>

      {/* Current Page Indicator */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: '500',
          color: 'var(--content-primary)'
        }}>
          {getPageTitle(currentPage)}
        </div>
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          {pageOrder.map((page, index) => (
            <div
              key={page}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? 'var(--content-primary)' : '#DDDDDD',
                transition: 'background-color 0.2s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: canGoNext ? 'var(--surface-inverted)' : '#F5F5F5',
          color: canGoNext ? 'var(--content-inverted)' : '#CCCCCC',
          border: 'none',
          borderRadius: '0.5rem',
          fontFamily: 'Figtree, sans-serif',
          fontSize: '0.75rem',
          fontWeight: '500',
          cursor: canGoNext ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          minWidth: '100px'
        }}
      >
        Next
        <span style={{ fontSize: '1rem' }}>→</span>
      </button>
    </div>
  );
};

export default BottomNav;
