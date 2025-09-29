import React from 'react';

const TopNav = ({ currentPage, onNavigate }) => {
  const pageOrder = ['home', 'second', 'third', 'fourth', 'fifth', 'sixth'];
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

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      zIndex: 1000,
      fontFamily: 'Figtree, sans-serif'
    }}>
      {/* Page Number */}
      <div style={{
        fontSize: '0.5rem',
        fontWeight: '500',
        color: 'var(--content-primary)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}>
        {currentIndex + 1}/{pageOrder.length}
      </div>

      {/* Navigation Arrows */}
      <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
        {/* Previous Arrow */}
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: canGoPrevious ? 'rgba(255, 255, 255, 0.9)' : 'rgba(245, 245, 245, 0.9)',
            color: canGoPrevious ? 'var(--content-primary)' : '#CCCCCC',
            cursor: canGoPrevious ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            fontFamily: 'Figtree, sans-serif',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: canGoNext ? 'rgba(255, 255, 255, 0.9)' : 'rgba(245, 245, 245, 0.9)',
            color: canGoNext ? 'var(--content-primary)' : '#CCCCCC',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            fontFamily: 'Figtree, sans-serif',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopNav;
