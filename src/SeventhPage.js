import React, { useState, useEffect } from 'react';
import NotesHit from './components/NotesHit';
import MicrophoneButton from './components/MicrophoneButton';
import AudioVisualizer from './components/AudioVisualizer';
import './App.css';

// Floating Note Component
const FloatingNote = ({ note, onPointsUpdate }) => {
  const [position, setPosition] = useState(-150); // Start from behind the entire spinning wheel
  const [opacity, setOpacity] = useState(1);
  const [noteState, setNoteState] = useState(note.state || 'default');
  const [hasChangedState, setHasChangedState] = useState(note.hasChangedState || false);

  useEffect(() => {
    const startTime = note.startTime;
    const currentTime = Date.now();
    
    const startAnimation = () => {
      const animateSlide = () => {
        const elapsed = Date.now() - startTime;
        const duration = 4000; // 4 seconds to slide across (longer to account for starting from behind wheel)
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress <= 1) {
          // Move from behind entire spinning wheel (-150px) to beyond container width
          const containerWidth = 700; // Increased to ensure notes reach the full right side
          const newPosition = -150 + (progress * (containerWidth + 150));
          setPosition(newPosition);
          
          // Check if note has crossed the first rectangle (at 544px from left)
          const firstRectanglePosition = 544; // 700 - 156 = 544px from left
          if (!hasChangedState && newPosition >= firstRectanglePosition) {
            // Randomly decide the state: caught or missed
            const randomState = Math.random() < 0.5 ? 'caught' : 'missed';
            setNoteState(randomState);
            setHasChangedState(true);
            console.log(`Note ${note.noteName} crossed first rectangle - state: ${randomState}`);
            
            // Update points if note was caught
            if (randomState === 'caught' && onPointsUpdate) {
              onPointsUpdate(prevPoints => prevPoints + 1);
            }
          }
          
          // Fade out in the last 20% of animation
          if (progress > 0.8) {
            const fadeProgress = (progress - 0.8) / 0.2;
            setOpacity(1 - fadeProgress);
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateSlide);
          }
        }
      };
      
      requestAnimationFrame(animateSlide);
    };

    if (currentTime >= startTime) {
      startAnimation();
    } else {
      const timeout = setTimeout(startAnimation, startTime - currentTime);
      return () => clearTimeout(timeout);
    }
  }, [note]);

  if (!note.containerRelative) {
    return null; // Don't render non-container notes
  }

  // Get styling based on note state
  const getStateStyles = () => {
    switch (noteState) {
      case 'caught':
        return {
          background: '#DDF8E5', // Light green fill
          border: '1px solid #3D8A27' // Green stroke
        };
      case 'missed':
        return {
          background: '#FFF8F6', // Light red fill
          border: '1px solid #A3120A' // Red stroke
        };
      default:
        return {
          background: '#F7F7F7', // Default light gray fill
          border: '1px solid #EBEBEB' // Default light gray stroke
        };
    }
  };

  const stateStyles = getStateStyles();

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position}px`,
        top: `${note.yPosition}%`, // Use the stored Y position
        fontSize: '12px',
        fontWeight: '600',
        color: '#222222',
        opacity: opacity,
        zIndex: 5, // Lower z-index so notes appear behind spinning wheel initially
        pointerEvents: 'none',
        fontFamily: 'Figtree, sans-serif',
        ...stateStyles, // Apply state-specific styling
        padding: '2px 6px',
        borderRadius: '4px'
      }}
    >
      {note.noteName}
    </div>
  );
};

const SeventhPage = ({ onNavigate, onDataUpdate }) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const renderPianoKeys = (octave) => {
    return notes.map((note, index) => {
      const isBlackKey = note.includes('#');
      const fullNote = `${note}${octave}`;
      const highlighted = highlightedNotes.has(fullNote);

      return (
        <div
          key={fullNote}
          style={{
            flex: isBlackKey ? '0 0 auto' : '1 1 0%',
            width: isBlackKey ? '26px' : 'auto',
            borderRadius: '0.375rem',
            border: '1px solid #DDDDDD',
            borderBottom: '2px solid #DDDDDD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isBlackKey ? 
              (highlighted ? '#000000' : '#222222') :
              (highlighted ? '#3D8A27' : 'white'),
            marginTop: '0px',
            height: isBlackKey ? '20px' : '28px',
            cursor: 'pointer',
            transition: 'all 0.1s ease',
            fontFamily: 'Figtree, sans-serif',
            position: 'relative'
          }}
        >
          {/* Note label */}
          <span style={{
            fontSize: isBlackKey ? '6px' : '0.625rem',
            fontWeight: isBlackKey ? 'normal' : '600',
            color: isBlackKey ? 'white' : (highlighted ? 'white' : '#6A6A6A'),
            lineHeight: 'normal',
            position: 'relative',
            zIndex: 1
          }}>
            {fullNote}
          </span>
        </div>
      );
    });
  };

  const [highlightedNotes, setHighlightedNotes] = useState(new Set());
  const [highestNote, setHighestNote] = useState(null);
  const [lowestNote, setLowestNote] = useState(null);
  const [showHighestNote, setShowHighestNote] = useState(false);
  const [shouldExitDisplay, setShouldExitDisplay] = useState(false);
  const [showGlassOverlay, setShowGlassOverlay] = useState(false);
  const [shouldExitOverlay, setShouldExitOverlay] = useState(false);
  const [showMicButton, setShowMicButton] = useState(false);
  const [micActivated, setMicActivated] = useState(false);
  const [showSecondOverlay, setShowSecondOverlay] = useState(false);
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [shouldExitSecondOverlay, setShouldExitSecondOverlay] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(0); // Track current pattern
  const [usedPatterns, setUsedPatterns] = useState(new Set([0])); // Track used patterns
  const [isPlaying, setIsPlaying] = useState(false); // Track animation state without audio
  const [selectedNote, setSelectedNote] = useState(null); // Track the note selected after spin
  const [floatingNotes, setFloatingNotes] = useState([]); // Track floating notes animation
  const [isNotesPlaying, setIsNotesPlaying] = useState(false); // Track if notes should keep appearing
  const [noteInterval, setNoteInterval] = useState(null); // Store interval reference
  const [points, setPoints] = useState(0); // Points for caught notes
  const [rangeHitEnabled, setRangeHitEnabled] = useState(false); // Toggle for range hit counting
  const [currentOctave, setCurrentOctave] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState('');
  const [nextOctave, setNextOctave] = useState(1);

  const handlePlay = async () => {
    if (isNotesPlaying) {
      // Stop the notes animation and wheel spinning
      console.log('Page 7: Stop button clicked - stopping wheel and floating notes');
      setIsPlaying(false);
      stopFloatingNotes();
    } else {
      // Start the notes animation and wheel spinning
      console.log('Page 7: Play button clicked - starting wheel spin and floating notes');
      setIsPlaying(true);
      setSelectedNote(null); // Clear previous selection
      
      // Start floating notes animation immediately
      startFloatingNotes();
      
      // Wheel keeps spinning until stop button is clicked - no auto-stop
    }
  };

  const generateRandomNote = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // C0 to B8
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    const randomOctave = octaves[Math.floor(Math.random() * octaves.length)];
    return `${randomNote}${randomOctave}`;
  };

  const addSingleNote = () => {
    const newNote = {
      id: Date.now(),
      noteName: generateRandomNote(),
      startTime: Date.now(),
      containerRelative: true,
      yPosition: 45, // Position between 1st and 3rd lines
      state: 'default', // Initial state: 'default', 'caught', 'missed'
      hasChangedState: false // Track if state has been changed after crossing first rectangle
    };
    
    setFloatingNotes(prev => [...prev, newNote]);
    
    // Remove the note after 3 seconds (enough time for sliding animation)
    setTimeout(() => {
      setFloatingNotes(prev => prev.filter(note => note.id !== newNote.id));
    }, 3000);
  };

  const startFloatingNotes = () => {
    setIsNotesPlaying(true);
    
    // Add first note immediately
    addSingleNote();
    
    // Set up interval to add a new note every 2 seconds
    const interval = setInterval(() => {
      addSingleNote();
    }, 2000);
    
    setNoteInterval(interval);
  };

  const stopFloatingNotes = () => {
    setIsNotesPlaying(false);
    
    // Clear the interval
    if (noteInterval) {
      clearInterval(noteInterval);
      setNoteInterval(null);
    }
    
    // Clear all existing notes
    setTimeout(() => {
      setFloatingNotes([]);
    }, 3000); // Allow current notes to finish their animation
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  // Start circle animation when spin wheel is clicked (no audio)
  React.useEffect(() => {
    if (isPlaying) {
      // For 7th page, we don't need the circle animation or path tracing
      // Just keep the spinning wheel and floating notes
      console.log('Page 7: Play started - no path tracing on this page');
      
      // No circle animation needed, just show glass overlay after a delay
      setTimeout(() => {
        setShowGlassOverlay(true);
        
        // Hide glass overlay after 4 seconds and show mic
        setTimeout(() => {
          console.log('Hiding glass overlay, showing mic button');
          setShouldExitOverlay(true);
          setTimeout(() => {
            setShowGlassOverlay(false);
            setShouldExitOverlay(false);
            setShowMicButton(true);
          }, 600);
        }, 4000);
      }, 3000); // Show overlay after 3 seconds
    } else {
      setHighlightedNotes(new Set());
      setHighestNote(null);
      setShowHighestNote(false);
      setShouldExitDisplay(false);
      setShowGlassOverlay(false);
      setShouldExitOverlay(false);
      setShowMicButton(false);
      setMicActivated(false);
      setShowSecondOverlay(false);
      setShowStrikeThrough(false);
      setShouldExitSecondOverlay(false);
      setSelectedNote(null);
    }
  }, [isPlaying]);
  
  // Generate a new random pattern that hasn't been used
  const generateNewPattern = () => {
    const maxPatterns = 10; // Maximum number of different patterns
    let newPattern;
    
    // Find a pattern that hasn't been used yet
    do {
      newPattern = Math.floor(Math.random() * maxPatterns);
    } while (usedPatterns.has(newPattern) && usedPatterns.size < maxPatterns);
    
    // If all patterns are used, reset and start over
    if (usedPatterns.size >= maxPatterns) {
      setUsedPatterns(new Set([newPattern]));
    } else {
      setUsedPatterns(prev => new Set([...prev, newPattern]));
    }
    
    setCurrentPattern(newPattern);
    return newPattern;
  };

  
  // Function to get current note index based on Y position
  const getCurrentNoteIndex = (y) => {
    const notePositions = [280, 255, 230, 205, 180, 155, 130, 105, 80, 55, 30, 5]; // C4 to B4
    const tolerance = 15; // Tolerance for note detection
    
    for (let i = 0; i < notePositions.length; i++) {
      if (Math.abs(y - notePositions[i]) <= tolerance) {
        return i;
      }
    }
    return -1;
  };

  // Octave navigation functions - jump between C1-C4 and C5-C8
  const handleOctaveChange = (direction) => {
    if (isAnimating) return;
    
    let newOctave;
    if (direction === 'up') {
      // Jump from C1-C4 to C5-C8
      newOctave = 5;
    } else {
      // Jump from C5-C8 to C1-C4
      newOctave = 1;
    }
    
    setNextOctave(newOctave);
    setAnimationDirection(direction);
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentOctave(newOctave);
      setIsAnimating(false);
    }, 300);
  };

  const getHighlightedNotesVisibility = () => {
    // Use highlightedNotes Set to determine if there are notes to show on left/right
    const allHighlightedNotes = Array.from(highlightedNotes);
    
    return {
      hasNotesOnLeft: allHighlightedNotes.some(note => {
        const noteOctave = parseInt(note.slice(-1));
        return noteOctave < currentOctave;
      }),
      hasNotesOnRight: allHighlightedNotes.some(note => {
        const noteOctave = parseInt(note.slice(-1));
        return noteOctave > currentOctave;
      })
    };
  };


  // Keyboard navigation effect
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

  return (
    <div className="empty-screen">
      <div className="empty-screen-content">
        <h1 className="empty-title">Catch the note if you can</h1>
        
        {/* Points Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          marginBottom: '0.5rem',
          padding: '0 1rem'
        }}>
          {/* Left side: Icon and points value */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {/* Outer coin circle with gradient */}
                <circle 
                  cx="12" 
                  cy="12" 
                  r="11" 
                  fill="url(#coinGradient)" 
                  stroke="#B8860B" 
                  strokeWidth="1"
                />
                {/* Inner circle detail */}
                <circle 
                  cx="12" 
                  cy="12" 
                  r="8" 
                  fill="none" 
                  stroke="#B8860B" 
                  strokeWidth="0.5"
                  opacity="0.6"
                />
                {/* Dollar sign or coin symbol */}
                <text 
                  x="12" 
                  y="16" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fontWeight="bold" 
                  fill="#B8860B"
                >
                  $
                </text>
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#DAA520" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--content-primary)'
            }}>{points}</span>
          </div>
          
          {/* Right side: Point explanation */}
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--content-secondary)',
            fontStyle: 'italic'
          }}>
            1 Note Hit = 1 point
          </div>
        </div>
        
        {/* Spin Wheel and Note Display Container */}
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0rem',
          flexWrap: 'wrap',
          position: 'relative'
        }}>
          {/* Spin Wheel */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            zIndex: 20 // High z-index to appear above sliding notes
          }}>
            {/* Spinning wheel container */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              position: 'relative',
              zIndex: 20
            }}>
              {/* Spinning wheel layer */}
              <div style={{
                width: '80px',
                height: '80px',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 20,
                animation: isPlaying ? 'wheelSpin 3s linear infinite' : 'none'
              }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  {/* Background circle */}
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="38" 
                    fill="#E3F2FD" 
                    stroke="#90CAF9" 
                    strokeWidth="2"
                  />
                  
                  {/* 12 segments with note values */}
                  {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note, index) => {
                    const angle = (index * 30) - 90; // 360/12 = 30 degrees per segment, start from top
                    const nextAngle = ((index + 1) * 30) - 90;
                    const isLight = index % 2 === 0;
                    
                    // Convert angles to radians
                    const startRad = (angle * Math.PI) / 180;
                    const endRad = (nextAngle * Math.PI) / 180;
                    
                    // Calculate path coordinates
                    const startX = 40 + 35 * Math.cos(startRad);
                    const startY = 40 + 35 * Math.sin(startRad);
                    const endX = 40 + 35 * Math.cos(endRad);
                    const endY = 40 + 35 * Math.sin(endRad);
                    
                    // Calculate text position (midpoint of segment)
                    const textAngle = (angle + 15) * Math.PI / 180; // Middle of segment
                    const textRadius = 25; // Distance from center for text
                    const textX = 40 + textRadius * Math.cos(textAngle);
                    const textY = 40 + textRadius * Math.sin(textAngle);
                    
                    const pathData = [
                      `M 40 40`,
                      `L ${startX} ${startY}`,
                      `A 35 35 0 0 1 ${endX} ${endY}`,
                      `Z`
                    ].join(' ');
                    
                    return (
                      <g key={note}>
                        {/* Segment path */}
                        <path
                          d={pathData}
                          fill={isLight ? '#BBDEFB' : '#90CAF9'}
                          stroke="#64B5F6"
                          strokeWidth="0.5"
                        />
                        {/* Note text */}
                        <text
                          x={textX}
                          y={textY + 2} // Small offset for better centering
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="7"
                          fontWeight="600"
                          fill="#1976D2"
                          fontFamily="Figtree, sans-serif"
                        >
                          {note}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* Clickable center play/stop button */}
              <div 
                onClick={handlePlay}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 25, // Highest z-index for center button
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32">
                  {/* Center circle */}
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="15" 
                    fill="#42A5F5" 
                    stroke="#1976D2" 
                    strokeWidth="2"
                  />
                  
                  {/* Play/Stop icon based on state */}
                  {isNotesPlaying ? (
                    /* Stop icon when notes are playing */
                    <rect 
                      x="12" 
                      y="12" 
                      width="8" 
                      height="8" 
                      fill="white"
                    />
                  ) : (
                    /* Play icon when notes are not playing */
                    <polygon 
                      points="11,10 11,22 23,16" 
                      fill="white"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
            
          {/* Container with 3 lines */}
          <div style={{
            display: 'inline-block',
            marginLeft: '-1rem',
            width: '100%',
            flex: 1,
            border: '2px solid #EBEBEB',
            borderRadius: '8px',
            padding: '10px 8px',
            position: 'relative',
            zIndex: 1
          }}>
              {/* Floating Notes Animation */}
              {floatingNotes.map((note) => (
                <FloatingNote key={note.id} note={note} onPointsUpdate={setPoints} />
              ))}
              
              {/* Three horizontal lines with equal spacing */}
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#EBEBEB',
                    borderRadius: '1px',
                    marginBottom: index < 2 ? '10px' : '0' // 10px gap between lines, no margin after last line
                  }}
                />
              ))}
            </div>
            
            {/* Rectangle 156px to the left from the right edge of container */}
            <div style={{
              position: 'absolute',
              right: '156px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '80px',
              backgroundColor: '#DDDDDD',
              borderRadius: '2px'
            }}>
            </div>
            
            {/* Second rectangle 88px to the right of the first rectangle */}
            <div style={{
              position: 'absolute',
              right: '68px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '80px',
              backgroundColor: '#DDDDDD',
              borderRadius: '2px'
            }}>
            </div>
            
          </div>
        
        {/* CSS for spinning animations */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes wheelSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Musical Notes Graph */}
        <div style={{
          marginTop: '5rem',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative'
          }}>
            
            {/* 4-Octave Piano Keyboard */}
            <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                paddingTop: '1rem',
                width: '100%'
              }}>
                <button
                  onClick={() => handleOctaveChange('down')}
                  disabled={currentOctave === 1 || isAnimating}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    border: `1px solid ${getHighlightedNotesVisibility().hasNotesOnLeft ? '#3D8A27' : '#DDDDDD'}`,
                    backgroundColor: (currentOctave === 1 || isAnimating) ? '#F5F5F5' : 
                      getHighlightedNotesVisibility().hasNotesOnLeft ? '#E8F5E8' : 'white',
                    color: (currentOctave === 1 || isAnimating) ? '#CCCCCC' : 
                      getHighlightedNotesVisibility().hasNotesOnLeft ? '#3D8A27' : '#6A6A6A',
                    cursor: (currentOctave === 1 || isAnimating) ? 'not-allowed' : 'pointer',
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
                  flexDirection: 'column',
                  gap: '2rem',
                  flex: '1 1 0%',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    width: '100%',
                    transform: isAnimating ? 
                      (animationDirection === 'up' ? 'translateX(-100%)' : 'translateX(100%)') : 
                      'translateX(0)',
                    transition: 'transform 0.3s ease'
                  }}>
                    {[currentOctave, currentOctave + 1, currentOctave + 2, currentOctave + 3].map(octave => (
                      octave <= 8 && (
                        <div key={octave} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {/* Octave label */}
                          <div style={{
                            width: '40px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'var(--content-secondary)',
                            textAlign: 'center'
                          }}>
                            C{octave}
                          </div>
                          
                          {/* Piano keys for this octave */}
                          <div style={{
                            display: 'flex',
                            gap: '1px',
                            flex: 1
                          }}>
                            {renderPianoKeys(octave)}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                  
                  {isAnimating && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: animationDirection === 'up' ? '100%' : '-100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2rem',
                      width: '100%',
                      transform: isAnimating ? 'translateX(0)' : 
                        (animationDirection === 'up' ? 'translateX(100%)' : 'translateX(-100%)'),
                      transition: 'transform 0.3s ease'
                    }}>
                      {[nextOctave, nextOctave + 1, nextOctave + 2, nextOctave + 3].map(octave => (
                        octave <= 8 && (
                          <div key={octave} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {/* Octave label */}
                            <div style={{
                              width: '40px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: 'var(--content-secondary)',
                              textAlign: 'center'
                            }}>
                              C{octave}
                            </div>
                            
                            {/* Piano keys for this octave */}
                            <div style={{
                              display: 'flex',
                              gap: '1px',
                              flex: 1
                            }}>
                              {renderPianoKeys(octave)}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleOctaveChange('up')}
                  disabled={currentOctave === 5 || isAnimating}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.5rem',
                    border: `1px solid ${getHighlightedNotesVisibility().hasNotesOnRight ? '#3D8A27' : '#DDDDDD'}`,
                    backgroundColor: (currentOctave === 5 || isAnimating) ? '#F5F5F5' : 
                      getHighlightedNotesVisibility().hasNotesOnRight ? '#E8F5E8' : 'white',
                    color: (currentOctave === 5 || isAnimating) ? '#CCCCCC' : 
                      getHighlightedNotesVisibility().hasNotesOnRight ? '#3D8A27' : '#6A6A6A',
                    cursor: (currentOctave === 5 || isAnimating) ? 'not-allowed' : 'pointer',
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
        </div>

        {/* Range Hit Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1.5rem',
          justifyContent: 'center'
        }}>
          {/* Left Text */}
          <span style={{
            fontSize: '0.875rem',
            color: rangeHitEnabled ? 'var(--content-secondary)' : 'var(--content-primary)',
            fontWeight: rangeHitEnabled ? '400' : '600'
          }}>
            Hit exact note
          </span>
          
          {/* Toggle Switch */}
          <div 
            onClick={() => setRangeHitEnabled(!rangeHitEnabled)}
            style={{
              width: '48px',
              height: '24px',
              backgroundColor: rangeHitEnabled ? '#3D8A27' : '#DDDDDD',
              borderRadius: '12px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: rangeHitEnabled ? '26px' : '2px',
              transition: 'left 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
            </div>
          </div>
          
          {/* Right Text */}
          <span style={{
            fontSize: '0.875rem',
            color: rangeHitEnabled ? 'var(--content-primary)' : 'var(--content-secondary)',
            fontWeight: rangeHitEnabled ? '600' : '400'
          }}>
            Hit note range
          </span>
        </div>

        {/* Hit Notes Display - show highest note hit */}
        {showHighestNote && highestNote && (
          <NotesHit 
            notesHit={[{ note: highestNote.note, id: `highest-${highestNote.note}` }]}
            shouldExit={shouldExitDisplay}
            style={{
              marginTop: '2rem',
              textAlign: 'center'
            }}
          />
        )}

        {/* Glass Overlay with sequence challenge */}
        {showGlassOverlay && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55))',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            opacity: shouldExitOverlay ? 0 : 1,
            transform: shouldExitOverlay ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.6s ease-out'
          }}>
            <div style={{
              fontSize: '2rem', // 32px
              fontWeight: '400', // regular
              lineHeight: '2.25rem', // 36px
              color: 'var(--content-primary)',
              margin: 0,
              whiteSpace: 'pre-line',
              textAlign: 'center'
            }}>
              Collect 20 points.
            </div>
          </div>
        )}

        {/* Second Glass Overlay with strikethrough after user path */}
        {showSecondOverlay && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55))',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            opacity: shouldExitSecondOverlay ? 0 : 1,
            transform: shouldExitSecondOverlay ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.6s ease-out'
          }}>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem', // 32px
                fontWeight: '400', // regular
                lineHeight: '2.25rem', // 36px
                color: 'var(--content-primary)',
                margin: 0,
                whiteSpace: 'pre-line',
                textAlign: 'center',
                textDecoration: showStrikeThrough ? 'line-through' : 'none',
                transition: 'text-decoration 0.5s ease',
                marginBottom: showStrikeThrough ? '2rem' : 0
              }}>
                Sustain {selectedNote}. Stay within the range
              </div>
              
              {/* Buttons appear after strikethrough */}
              {showStrikeThrough && (
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  marginTop: '1rem',
                  opacity: showStrikeThrough ? 1 : 0,
                  transform: showStrikeThrough ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'all 0.5s ease 0.5s' // Delay after strikethrough
                }}>
                  <button
                    onClick={() => {
                      // Retry logic - reset user interaction
                      setMicActivated(false);
                      setShowSecondOverlay(false);
                      setShouldExitSecondOverlay(false);
                      setShowStrikeThrough(false);
                      // Reset to mic button state
                      setShowMicButton(true);
                    }}
                    style={{
                      padding: '0.5rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: 'var(--content-primary)',
                      border: '2px solid var(--content-primary)',
                      borderRadius: '0.5rem',
                      fontFamily: 'Figtree, sans-serif',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Retry
                  </button>
                  
                  <button
                    onClick={() => {
                    // Next Page logic - navigate to next page to continue the flow
                    setShouldExitSecondOverlay(true);
                    // Clean up after exit animation
                    setTimeout(() => {
                      setShowSecondOverlay(false);
                      setShouldExitSecondOverlay(false);
                      setShowStrikeThrough(false);
                      // Navigate to next page to continue the flow
                      if (onNavigate) {
                        onNavigate('home');
                      }
                    }, 600); // Time for exit animation
                    }}
                    style={{
                      padding: '0.5rem 1.5rem',
                      backgroundColor: 'var(--surface-inverted)',
                      color: 'var(--content-inverted)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontFamily: 'Figtree, sans-serif',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Next Page
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Microphone Button */}
        <MicrophoneButton 
          isVisible={showMicButton}
          onTap={() => {
            console.log('Mic tapped on Page 7');
            setMicActivated(true);
            // Keep mic button visible for voice input
          }}
          onVoiceDetected={() => {
            console.log('Voice detected on Page 7 - no path drawing');
            // Voice detection still works but no visual paths are drawn
          }}
        />
        
        {/* Debug info */}
        <div style={{ position: 'fixed', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px', fontSize: '12px', zIndex: 9999 }}>
          showMicButton: {showMicButton.toString()}<br/>
          micActivated: {micActivated.toString()}<br/>
          showGlassOverlay: {showGlassOverlay.toString()}<br/>
          isPlaying: {isPlaying.toString()}
        </div>

        {/* Audio Visualizer */}
        <AudioVisualizer isPlaying={isPlaying} />
      </div>
    </div>
  );
};

export default SeventhPage;
