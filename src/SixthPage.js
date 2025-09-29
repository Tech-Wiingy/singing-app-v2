import React, { useState } from 'react';
import NotesHit from './components/NotesHit';
import MicrophoneButton from './components/MicrophoneButton';
import AudioVisualizer from './components/AudioVisualizer';
import './App.css';

const SixthPage = ({ onNavigate, onDataUpdate }) => {
  const [circlePosition, setCirclePosition] = useState(0); // 0 to 1 (left to right)
  const [showCircle, setShowCircle] = useState(false);
  const [tracePath, setTracePath] = useState('');
  const [highlightedNotes, setHighlightedNotes] = useState(new Set());
  const [highestNote, setHighestNote] = useState(null);
  const [lowestNote, setLowestNote] = useState(null);
  const [showHighestNote, setShowHighestNote] = useState(false);
  const [shouldExitDisplay, setShouldExitDisplay] = useState(false);
  const [showGlassOverlay, setShowGlassOverlay] = useState(false);
  const [shouldExitOverlay, setShouldExitOverlay] = useState(false);
  const [showMicButton, setShowMicButton] = useState(false);
  const [micActivated, setMicActivated] = useState(false);
  const [userTracePath, setUserTracePath] = useState('');
  const [userCirclePosition, setUserCirclePosition] = useState(0);
  const [showUserCircle, setShowUserCircle] = useState(false);
  const [showSecondOverlay, setShowSecondOverlay] = useState(false);
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [shouldExitSecondOverlay, setShouldExitSecondOverlay] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(0); // Track current pattern
  const [usedPatterns, setUsedPatterns] = useState(new Set([0])); // Track used patterns
  const [isPlaying, setIsPlaying] = useState(false); // Track animation state without audio
  const [selectedNote, setSelectedNote] = useState(null); // Track the note selected after spin
  const [points, setPoints] = useState(0); // Points for highlighted notes

  const handlePlay = async () => {
    console.log('Page 6: Spin wheel clicked - starting animation without audio');
    setIsPlaying(true);
    setSelectedNote(null); // Clear previous selection
    
    // Select a random note after wheel stops spinning
    setTimeout(() => {
      setIsPlaying(false); // Stop wheel spinning first
      setTimeout(() => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octaves = [3, 4, 5]; // Common vocal range octaves
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        const randomOctave = octaves[Math.floor(Math.random() * octaves.length)];
        const fullNote = `${randomNote}${randomOctave}`;
        setSelectedNote(fullNote);
      }, 100); // Small delay after wheel stops
    }, 2000); // Wheel spins for 2 seconds
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  // Start circle animation when spin wheel is clicked (no audio)
  React.useEffect(() => {
    if (isPlaying) {
      setShowCircle(true);
      setCirclePosition(0);
      setTracePath('');
      setHighlightedNotes(new Set());
      
      // Animate circle from left to right over duration (no audio, just visual)
      const animationDuration = 3000; // 3 seconds to reach right side
      const startTime = Date.now();
      
      const animateCircle = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1); // Go to right side (1)
        
        setCirclePosition(progress);
        
        // Build trace path as circle moves
        const x = progress * 700; // 0 to 700 (full width)
        const y = getContourY(x);
        
        setTracePath(prev => {
          if (prev === '') {
            return `M${x},${y}`;
          }
          return `${prev} L${x},${y}`;
        });
        
        // Check which note level the circle is at and highlight it
        const currentNoteIndex = getCurrentNoteIndex(y);
        if (currentNoteIndex !== -1) {
          const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
          const currentNote = notes[currentNoteIndex];
          setHighlightedNotes(prev => new Set([...prev, currentNote]));
          
          // Update highest note (higher index = higher note)
          setHighestNote(prev => {
            if (!prev) return { note: currentNote, index: currentNoteIndex };
            return currentNoteIndex > prev.index ? { note: currentNote, index: currentNoteIndex } : prev;
          });
          
          // Update lowest note
          setLowestNote(prev => {
            const newLowest = !prev ? { note: currentNote, index: currentNoteIndex } : 
              (currentNoteIndex > prev.index ? { note: currentNote, index: currentNoteIndex } : prev);
            
            // Send lowest note data to App
            if (onDataUpdate) {
              onDataUpdate(prevData => ({
                ...prevData,
                lowestNoteFromPage6: newLowest.note
              }));
            }
            
            return newLowest;
          });
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateCircle);
        } else {
          // Animation completed - show highest note display
          setTimeout(() => {
            setShowHighestNote(true);
            
            // Hide after 2 seconds and show glass overlay
            setTimeout(() => {
              setShouldExitDisplay(true);
              // Clean up after exit animation and show glass overlay
              setTimeout(() => {
                setShowHighestNote(false);
                setShouldExitDisplay(false);
                setShowGlassOverlay(true);
                
                // Hide glass overlay after 4 seconds and show mic
                setTimeout(() => {
                  console.log('Hiding glass overlay, showing mic button');
                  setShouldExitOverlay(true);
                  // Clean up after overlay exit animation
                  setTimeout(() => {
                    setShowGlassOverlay(false);
                    setShouldExitOverlay(false);
                    setShowMicButton(true);
                  }, 600); // Time for overlay exit animation
                }, 4000); // Glass overlay visible for 4 seconds
              }, 1000); // Time for exit animation
            }, 2000); // Display for 2 seconds
          }, 200); // Smaller delay after animation completes
          
          // Stop the spinning wheel animation
          setIsPlaying(false);
        }
      };
      
      requestAnimationFrame(animateCircle);
    } else {
      setShowCircle(false);
      setHighlightedNotes(new Set());
      setHighestNote(null);
      setShowHighestNote(false);
      setShouldExitDisplay(false);
      setShowGlassOverlay(false);
      setShouldExitOverlay(false);
      setShowMicButton(false);
      setMicActivated(false);
      setUserTracePath('');
      setUserCirclePosition(0);
      setShowUserCircle(false);
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

  // Function to get Y coordinate along the area contour (smooth converging wave pattern)
  const getContourY = (x) => {
    // Define different smooth pattern configurations with converging ranges
    const patterns = [
      // Pattern 0: Smooth sine wave convergence
      { centerY: 180, initialRange: 120, finalRange: 20, frequency: 3.5, phase: 0 },
      // Pattern 1: Fast oscillation convergence
      { centerY: 160, initialRange: 100, finalRange: 15, frequency: 5.0, phase: 0.5 },
      // Pattern 2: Slow wave convergence
      { centerY: 140, initialRange: 90, finalRange: 25, frequency: 2.5, phase: 0 },
      // Pattern 3: Mid-frequency convergence
      { centerY: 220, initialRange: 110, finalRange: 18, frequency: 4.0, phase: 0.25 },
      // Pattern 4: High frequency tight convergence
      { centerY: 170, initialRange: 130, finalRange: 12, frequency: 6.0, phase: 0 },
      // Pattern 5: Very slow convergence
      { centerY: 190, initialRange: 80, finalRange: 30, frequency: 1.8, phase: 0.75 },
      // Pattern 6: Medium wave with phase shift
      { centerY: 150, initialRange: 105, finalRange: 22, frequency: 3.8, phase: 0.3 },
      // Pattern 7: Low center smooth wave
      { centerY: 200, initialRange: 95, finalRange: 28, frequency: 3.2, phase: 0.6 },
      // Pattern 8: Rapid convergence
      { centerY: 175, initialRange: 115, finalRange: 8, frequency: 4.5, phase: 0.1 },
      // Pattern 9: Gentle convergence
      { centerY: 185, initialRange: 85, finalRange: 35, frequency: 2.8, phase: 0.4 }
    ];
    
    const pattern = patterns[currentPattern];
    const { centerY, initialRange, finalRange, frequency, phase } = pattern;
    
    // Calculate progress across the full width (0 to 1)
    const progress = x / 700;
    
    // Calculate the current amplitude based on progress (converging)
    const currentAmplitude = initialRange - (progress * (initialRange - finalRange));
    
    // Generate smooth sine wave with converging amplitude
    const waveInput = (progress * frequency * Math.PI * 2) + (phase * Math.PI * 2);
    const sineValue = Math.sin(waveInput);
    
    // Apply converging amplitude to the sine wave
    const offset = sineValue * (currentAmplitude / 2);
    
    // Add some subtle randomness for more organic feel
    const organicVariation = Math.sin(progress * 17.3) * (currentAmplitude * 0.05);
    
    return centerY + offset + organicVariation;
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

  // Helper function to render mini piano key
  const renderMiniPianoKey = (note, isHighlighted) => {
    const isBlackKey = note.includes('#');
    // Calculate sequential key number for the note
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    const noteWithoutOctave = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    const keyNumber = ((octave - 1) * 12) + noteMap[noteWithoutOctave] + 1;
    
    return (
      <div style={{
        width: isBlackKey ? '16px' : '20px',
        height: isBlackKey ? '18px' : '24px',
        borderRadius: '0.25rem',
        border: '1px solid #DDDDDD',
        borderBottom: '2px solid #DDDDDD',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isBlackKey ? 
          (isHighlighted ? '#000000' : '#222222') :
          (isHighlighted ? '#3D8A27' : 'white'),
        fontFamily: 'Figtree, sans-serif',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        {/* Main note label */}
        <span style={{
          fontSize: isBlackKey ? '5px' : '8px',
          fontWeight: isBlackKey ? 'normal' : '600',
          color: isBlackKey ? 'white' : (isHighlighted ? 'white' : '#6A6A6A'),
          lineHeight: '1',
          position: 'relative',
          zIndex: 1
        }}>
          {note}
        </span>
        
        {/* Number label in bottom right corner - only for white keys */}
        {!isBlackKey && (
          <span style={{
            position: 'absolute',
            bottom: '1px',
            right: '1px',
            fontSize: '4px',
            fontWeight: 'normal',
            color: isHighlighted ? '#E8F5E8' : '#999999',
            lineHeight: '4px',
            zIndex: 2
          }}>
            {keyNumber}
          </span>
        )}
      </div>
    );
  };

  // Function to get Y coordinate for user's path (smooth converging pattern but different from audio)
  const getUserContourY = (x) => {
    // User's smooth converging pattern - different parameters than audio
    const userCenterY = 200; // Different center point than audio
    const userInitialRange = 100; // Start with different range than audio
    const userFinalRange = 25; // End with different range than audio
    const userFrequency = 3.0; // Different frequency than audio patterns
    const userPhase = 0.7; // Different phase shift
    
    // Calculate progress across the full width (0 to 1)
    const progress = x / 700;
    
    // Calculate the current amplitude based on progress (converging)
    const currentAmplitude = userInitialRange - (progress * (userInitialRange - userFinalRange));
    
    // Generate smooth cosine wave (different from sine) with converging amplitude
    const waveInput = (progress * userFrequency * Math.PI * 2) + (userPhase * Math.PI * 2);
    const cosineValue = Math.cos(waveInput); // Using cosine for different wave shape
    
    // Apply converging amplitude to the cosine wave
    const offset = cosineValue * (currentAmplitude / 2);
    
    // Add different organic variation for user path
    const organicVariation = Math.cos(progress * 12.7) * (currentAmplitude * 0.08);
    
    // Add subtle secondary harmonic for more complex wave shape
    const harmonicWave = Math.sin(progress * userFrequency * 4 * Math.PI) * (currentAmplitude * 0.1);
    
    return userCenterY + offset + organicVariation + harmonicWave;
  };

  return (
    <div className="empty-screen">
      <div className="empty-screen-content">
        <h1 className="empty-title">Sustain notes</h1>
        
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
                  fill="url(#coinGradientPage6)" 
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
                  <linearGradient id="coinGradientPage6" x1="0%" y1="0%" x2="100%" y2="100%">
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
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          {/* Spin Wheel */}
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
          {/* Fixed Triangle Pointer */}
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          }}>
            <svg width="6" height="8" viewBox="0 0 6 8">
              <polygon 
                points="0,0 6,0 3,7" 
                fill="#1976D2"
              />
            </svg>
          </div>
          
          <div
            onClick={undefined}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              position: 'relative',
              cursor: 'default',
              opacity: 1,
              transition: 'all 0.2s ease',
              display: 'inline-block'
            }}
          >
            {/* Spinning wheel layer */}
            <div style={{
              width: '80px',
              height: '80px',
              position: 'absolute',
              top: 0,
              left: 0,
              animation: isPlaying ? 'wheelSpin 2s linear infinite' : 'none'
            }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                {/* Background circle with conditional opacity */}
                <circle 
                  cx="40" 
                  cy="40" 
                  r="38" 
                  fill="#E3F2FD" 
                  stroke="#90CAF9" 
                  strokeWidth="2"
                  opacity={selectedNote ? 0.3 : 1}
                  transition="opacity 0.3s ease"
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
                    <g key={note} opacity={selectedNote ? 0.3 : 1} style={{ transition: 'opacity 0.3s ease' }}>
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
            
            {/* Fixed center circle layer */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32">
                {/* Bigger center circle */}
                <circle 
                  cx="16" 
                  cy="16" 
                  r="15" 
                  fill="#42A5F5" 
                  stroke="#1976D2" 
                  strokeWidth="2"
                />
                
                {/* Center content - play icon or selected note */}
                {!selectedNote ? (
                  /* Play icon when no note is selected */
                  <polygon 
                    points="11,10 11,22 23,16" 
                    fill="white"
                  />
                ) : (
                  /* Selected note text */
                  <text
                    x="16"
                    y="20"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="white"
                    fontFamily="Figtree, sans-serif"
                  >
                    {selectedNote}
                  </text>
                )}
              </svg>
            </div>
          </div>
          </div>
          
          {/* Note Hit Display - always shown */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--surface-secondary)',
            padding: '0.4rem 1rem',
            borderRadius: '1rem',
            boxShadow: '0 3px 12px rgba(0,0,0,0.09)',
            opacity: 1,
            transform: 'translateX(0)',
            transition: 'all 0.5s ease'
          }}>
            {/* Musical note icon */}
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#3D8A27',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              ♪
            </div>
            
            {/* Content - either Generate Note button or selected note with reset */}
            {!selectedNote ? (
              /* Generate Note button */
              <button
                onClick={handlePlay}
                disabled={isPlaying}
                style={{
                  height: '34px',
                  padding: '0 1rem',
                  backgroundColor: 'transparent',
                  color: 'var(--content-primary)',
                  // border: '2px solid var(--content-primary)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontFamily: 'Figtree, sans-serif',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isPlaying ? 0.6 : 1
                }}
              >
                Generate Note
              </button>
            ) : (
              /* Selected note with reset icon */
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.25rem'
                }}>
                  <div style={{
                    fontSize: '1.25rem',
                    color: 'var(--content-primary)',
                    fontWeight: '600'
                  }}>
                    {selectedNote}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--content-secondary)',
                    fontWeight: '400'
                  }}>
                    Sustain the note
                  </div>
                </div>
                
                {/* Reset icon */}
                <button
                  onClick={() => {
                    setSelectedNote(null);
                    handlePlay();
                  }}
                  disabled={isPlaying}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--content-disabled)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isPlaying ? 0.6 : 1
                  }}
                  title="Generate new note"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </button>
              </div>
            )}
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
          marginTop: '2.5rem',
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
            {/* Circle animation and trace line */}
            {/* Background SVG layer - Range envelope behind dashed lines */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
              }}
              viewBox="0 0 800 300"
              preserveAspectRatio="none"
            >
              {/* Range envelope visualization */}
              {(() => {
                // Get current pattern for range visualization
                const patterns = [
                  { centerY: 180, initialRange: 120, finalRange: 20 },
                  { centerY: 160, initialRange: 100, finalRange: 15 },
                  { centerY: 140, initialRange: 90, finalRange: 25 },
                  { centerY: 220, initialRange: 110, finalRange: 18 },
                  { centerY: 170, initialRange: 130, finalRange: 12 },
                  { centerY: 190, initialRange: 80, finalRange: 30 },
                  { centerY: 150, initialRange: 105, finalRange: 22 },
                  { centerY: 200, initialRange: 95, finalRange: 28 },
                  { centerY: 175, initialRange: 115, finalRange: 8 },
                  { centerY: 185, initialRange: 85, finalRange: 35 }
                ];
                
                const pattern = patterns[currentPattern];
                const { centerY, initialRange, finalRange } = pattern;
                
                // Generate path for upper and lower bounds
                const points = [];
                const upperPoints = [];
                const lowerPoints = [];
                
                for (let x = 0; x <= 700; x += 10) {
                  const progress = x / 700;
                  const currentAmplitude = initialRange - (progress * (initialRange - finalRange));
                  
                  const upperY = centerY - (currentAmplitude / 2);
                  const lowerY = centerY + (currentAmplitude / 2);
                  
                  upperPoints.push(`${x},${upperY}`);
                  lowerPoints.push(`${x},${lowerY}`);
                }
                
                // Create path that goes along upper bound, then back along lower bound
                const upperPath = upperPoints.join(' L');
                const lowerPath = lowerPoints.reverse().join(' L');
                const fullPath = `M${upperPath} L${lowerPath} Z`;
                
                return (
                  <path
                    d={fullPath}
                    fill="#DDF8E5"
                    stroke="none"
                  />
                );
              })()}
            </svg>
            
            {/* Foreground SVG layer - Trace lines and circles on top of dashed lines */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2
              }}
              viewBox="0 0 800 300"
              preserveAspectRatio="none"
            >
              {/* Trace line left behind by the circle */}
              {tracePath && (
                <path
                  d={tracePath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              
              {/* User's trace line */}
              {userTracePath && (
                <path
                  d={userTracePath}
                  fill="none"
                  stroke="#3D8A27"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              
              {/* Moving circle with note value */}
              {showCircle && (() => {
                const x = circlePosition * 700; // 0 to 700 (full width)
                const y = getContourY(x);
                const currentNoteIndex = getCurrentNoteIndex(y);
                const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
                const currentNote = currentNoteIndex !== -1 ? notes[currentNoteIndex] : 'C4';
                const isHighlighted = currentNoteIndex !== -1;
                
                return (
                  <g>
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={isHighlighted ? "#3D8A27" : "#FFFFFF"}
                      stroke="#3D8A27"
                      strokeWidth="2"
                      filter="drop-shadow(0 2px 8px rgba(0,0,0,0.2))"
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill={isHighlighted ? "#FFFFFF" : "#3D8A27"}
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="Figtree, sans-serif"
                    >
                      {currentNote}
                    </text>
                  </g>
                );
              })()}
              
              {/* User's moving circle */}
              {showUserCircle && (() => {
                const x = userCirclePosition * 700; // 0 to 700 (full width)
                const y = getUserContourY(x);
                const currentNoteIndex = getCurrentNoteIndex(y);
                const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
                const currentNote = currentNoteIndex !== -1 ? notes[currentNoteIndex] : 'B2';
                const isHighlighted = currentNoteIndex !== -1;
                
                return (
                  <g>
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={isHighlighted ? "#3D8A27" : "#FFFFFF"}
                      stroke="#3D8A27"
                      strokeWidth="2"
                      filter="drop-shadow(0 2px 8px rgba(0,0,0,0.2))"
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill={isHighlighted ? "#FFFFFF" : "#3D8A27"}
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="Figtree, sans-serif"
                    >
                      {currentNote}
                    </text>
                  </g>
                );
              })()}
            </svg>
            
            {/* Dashed lines layer - positioned between background and foreground SVGs */}
            <div style={{
              position: 'relative',
              zIndex: 1
            }}>
            {['B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4'].map((note, index) => {
              return (
                <div 
                  key={note}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  {/* Horizontal Long Dashed Line */}
                  <div style={{
                    flex: 1,
                    height: '1px',
                    border: 'none',
                    background: `repeating-linear-gradient(
                      to right,
                      #DDDDDD 0px,
                      #DDDDDD 6px,
                      transparent 6px,
                      transparent 10px
                    )`,
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s ease'
                  }} />
                  
                  {/* Mini Piano Key instead of text label */}
                  <div style={{
                    width: '2.5rem',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {renderMiniPianoKey(note, false)}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
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
              Sustain {selectedNote}. Stay within the range
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
                      setShowUserCircle(false);
                      setUserTracePath('');
                      setUserCirclePosition(0);
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
            console.log('Mic tapped on Page 6');
            setMicActivated(true);
            // Keep mic button visible for voice input
          }}
          onVoiceDetected={() => {
            console.log('Voice detected on Page 6 - starting user path');
            if (micActivated) {
              // Start user's interactive path
              setShowUserCircle(true);
              setUserCirclePosition(0);
              setUserTracePath('');
              
              // Animate user's circle
              const animationDuration = 5000; // 5 seconds for user control
              const startTime = Date.now();
              
              const animateUserCircle = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                setUserCirclePosition(progress);
                
                // Build user trace path
                const x = progress * 700;
                const y = getUserContourY(x);
                
                setUserTracePath(prev => {
                  if (prev === '') {
                    return `M${x},${y}`;
                  }
                  return `${prev} L${x},${y}`;
                });
                
                // Check which note level the user circle is at and highlight it
                const currentNoteIndex = getCurrentNoteIndex(y);
                if (currentNoteIndex !== -1) {
                  const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
                  const currentNote = notes[currentNoteIndex];
                  setHighlightedNotes(prev => {
                    const newHighlightedNotes = new Set([...prev, currentNote]);
                    // Award point for each new note highlighted
                    if (!prev.has(currentNote)) {
                      setPoints(prevPoints => prevPoints + 1);
                    }
                    return newHighlightedNotes;
                  });
                }
                
                if (progress < 1) {
                  requestAnimationFrame(animateUserCircle);
                } else {
                  // User path completed - show glass overlay with strikethrough
                  setTimeout(() => {
                    setShowSecondOverlay(true);
                    
                      // Start strikethrough animation after overlay appears
                      setTimeout(() => {
                        setShowStrikeThrough(true);
                        // Overlay stays open until user clicks a button
                      }, 500); // Delay before strikethrough starts
                  }, 300); // Small delay after path completes
                }
              };
              
              requestAnimationFrame(animateUserCircle);
            }
          }}
        />
        
        {/* Debug info */}
        <div style={{ position: 'fixed', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px', fontSize: '12px', zIndex: 9999 }}>
          showMicButton: {showMicButton.toString()}<br/>
          micActivated: {micActivated.toString()}<br/>
          showUserCircle: {showUserCircle.toString()}<br/>
          showGlassOverlay: {showGlassOverlay.toString()}<br/>
          isPlaying: {isPlaying.toString()}
        </div>

        {/* Audio Visualizer */}
        <AudioVisualizer isPlaying={isPlaying} />
      </div>
    </div>
  );
};

export default SixthPage;
