import React, { useState, useEffect } from 'react';
import './App.css';

const FourthPage = ({ onNavigate, gameData }) => {
  const [currentOctave, setCurrentOctave] = useState(4);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('');
  const [nextOctave, setNextOctave] = useState(4);

  // Get vocal range from previous pages
  const highestNote = gameData?.highestNoteFromPage2 || 'C4';
  const lowestNote = gameData?.lowestNoteFromPage3 || 'A3';

  const handleOctaveChange = (direction) => {
    if (isAnimating) return;
    
    const newOctave = direction === 'up' ? currentOctave + 1 : currentOctave - 1;
    if (newOctave < 1 || newOctave > 8) return;
    
    setNextOctave(newOctave);
    setAnimationDirection(direction);
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentOctave(newOctave);
      setIsAnimating(false);
      setAnimationDirection('');
    }, 300);
  };

  // Add keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        // Left arrow: keyboard moves right, octave decreases
        handleOctaveChange('down');
      } else if (event.key === 'ArrowRight') {
        // Right arrow: keyboard moves left, octave increases
        handleOctaveChange('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating]);

  // Function to determine if a note should be highlighted
  const isNoteHighlighted = (note) => {
    return note === 'A4' || note === 'C3';
  };

  // Function to get highlighted notes visibility
  const getHighlightedNotesVisibility = () => {
    const targetNotes = ['A4', 'C3'];
    const octaveNotes = notes.map(note => `${note}${currentOctave}`);
    
    return {
      hasNotesOnLeft: targetNotes.some(note => {
        const noteOctave = parseInt(note.slice(-1));
        return noteOctave < currentOctave;
      }),
      hasNotesOnRight: targetNotes.some(note => {
        const noteOctave = parseInt(note.slice(-1));
        return noteOctave > currentOctave;
      })
    };
  };

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const renderPianoKeys = (octave) => {
    return notes.map((note, index) => {
      const isBlackKey = note.includes('#');
      const fullNote = `${note}${octave}`;
      const keyNumber = ((octave - 1) * 12) + (index + 1);
      const highlighted = isNoteHighlighted(fullNote);

      return (
        <div
          key={fullNote}
          style={{
            flex: isBlackKey ? '0 0 auto' : '1 1 0%',
            width: isBlackKey ? '24px' : 'auto',
            borderRadius: '0.5rem',
            border: '1px solid #DDDDDD',
            borderBottom: '3px solid #DDDDDD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isBlackKey ? 
              (highlighted ? '#000000' : '#222222') :
              (highlighted ? '#3D8A27' : 'white'),
            marginTop: '0px',
            height: isBlackKey ? '26px' : '36px',
            cursor: 'pointer',
            transition: 'all 0.1s ease',
            fontFamily: 'Figtree, sans-serif',
            position: 'relative'
          }}
        >
          {/* Note label */}
          <span style={{
            fontSize: isBlackKey ? '8px' : '0.75rem',
            fontWeight: isBlackKey ? 'normal' : '600',
            color: isBlackKey ? 'white' : (highlighted ? 'white' : '#6A6A6A'),
            lineHeight: 'normal',
            position: 'relative',
            zIndex: 1
          }}>
            {fullNote}
          </span>
          
          {/* Number label in bottom right corner - only for white keys */}
          {!isBlackKey && (
            <span style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              fontSize: '6px',
              fontWeight: 'normal',
              color: highlighted ? '#E8F5E8' : '#999999',
              lineHeight: '6px',
              zIndex: 2
            }}>
              {keyNumber}
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="empty-screen">
      <div className="empty-screen-content">
        <h1 className="empty-title">Your vocal range</h1>
        
        {/* Centered Content Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)', // Full height minus space for title
          gap: '2rem',
          padding: '1rem'
        }}>
          {/* Vocal Range Display */}
          <div style={{
            backgroundColor: 'var(--surface-secondary)',
            padding: '1.5rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: '0 3px 12px rgba(0,0,0,0.09)'
          }}>
            <div style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--content-secondary)' }}>Lowest</div>
                <div style={{ fontSize: '1rem', color: 'var(--content-primary)', fontWeight: '500' }}>C3</div>
              </div>
              <div style={{ color: 'var(--content-secondary)' }}>to</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--content-secondary)' }}>Highest</div>
                <div style={{ fontSize: '1rem', color: 'var(--content-primary)', fontWeight: '500' }}>A4</div>
              </div>
            </div>
          </div>

          {/* Piano Keyboard */}
          <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '1rem',
              width: '100%'
            }}>
              <button
                onClick={() => handleOctaveChange('down')}
                disabled={currentOctave <= 1 || isAnimating}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  border: `1px solid ${getHighlightedNotesVisibility().hasNotesOnLeft ? '#3D8A27' : '#DDDDDD'}`,
                  backgroundColor: (currentOctave <= 1 || isAnimating) ? '#F5F5F5' : 
                    getHighlightedNotesVisibility().hasNotesOnLeft ? '#E8F5E8' : 'white',
                  color: (currentOctave <= 1 || isAnimating) ? '#CCCCCC' : 
                    getHighlightedNotesVisibility().hasNotesOnLeft ? '#3D8A27' : '#6A6A6A',
                  cursor: (currentOctave <= 1 || isAnimating) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Figtree, sans-serif'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              
              <div style={{
                display: 'flex',
                gap: '1px',
                flex: '1 1 0%',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '1px',
                  width: '100%',
                  transform: isAnimating ? 
                    (animationDirection === 'up' ? 'translateX(-100%)' : 'translateX(100%)') : 
                    'translateX(0)',
                  transition: 'transform 0.3s ease'
                }}>
                  {renderPianoKeys(currentOctave)}
                </div>
                
                {isAnimating && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: animationDirection === 'up' ? '100%' : '-100%',
                    display: 'flex',
                    gap: '1px',
                    width: '100%',
                    transform: isAnimating ? 'translateX(0)' : 
                      (animationDirection === 'up' ? 'translateX(100%)' : 'translateX(-100%)'),
                    transition: 'transform 0.3s ease'
                  }}>
                    {renderPianoKeys(nextOctave)}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleOctaveChange('up')}
                disabled={currentOctave >= 8 || isAnimating}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  border: `1px solid ${getHighlightedNotesVisibility().hasNotesOnRight ? '#3D8A27' : '#DDDDDD'}`,
                  backgroundColor: (currentOctave >= 8 || isAnimating) ? '#F5F5F5' : 
                    getHighlightedNotesVisibility().hasNotesOnRight ? '#E8F5E8' : 'white',
                  color: (currentOctave >= 8 || isAnimating) ? '#CCCCCC' : 
                    getHighlightedNotesVisibility().hasNotesOnRight ? '#3D8A27' : '#6A6A6A',
                  cursor: (currentOctave >= 8 || isAnimating) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Figtree, sans-serif'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Vocal Range Information */}
        <div style={{
          marginTop: '2rem',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '1rem',
            color: 'var(--content-primary)',
            fontWeight: '500',
            fontFamily: 'Figtree, sans-serif'
          }}>
            You sing as low as Billie Eilish
          </div>
          <div style={{
            fontSize: '1rem',
            color: 'var(--content-primary)',
            fontWeight: '500',
            fontFamily: 'Figtree, sans-serif'
          }}>
            You sing as high as Ed Sheeran
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourthPage;