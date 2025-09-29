import React, { useState } from 'react';
import PlayControls from './components/PlayControls';
import NotesHit from './components/NotesHit';
import MicrophoneButton from './components/MicrophoneButton';
import AudioVisualizer from './components/AudioVisualizer';
import { useHowler } from './hooks/useHowler';
import audioFile from './assets/audio/scale-up.mp3';
import './App.css';

const FifthPage = ({ onNavigate, onDataUpdate }) => {
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
  
  // Audio source - same as page 1
  const audioSrc = audioFile;

  // Lyrics data for the audio
  const lyrics = "Yaaaaaaaaaaaaaaaaaaaaa";
  const lyricsData = [
    {
      id: 'line1',
      timestamp: 0.0,
      text: lyrics,
      duration: 3.0
    }
  ];

  // Use Howler audio hook with unique instance
  const {
    isPlaying,
    currentTime,
    play,
    pause,
    stop,
    volume,
    setVolume
  } = useHowler(audioSrc, {
    volume: 0.8,
    loop: false,
    preload: true,
    html5: true // Force HTML5 mode to avoid conflicts
  });

  const handlePlay = async () => {
    console.log('Page 5: Play button clicked');
    try {
      console.log('Page 5: Attempting to play audio');
      await play();
      console.log('Page 5: Audio play successful');
    } catch (error) {
      console.error('Page 5: Error playing audio:', error);
    }
  };

  const handlePause = () => {
    pause();
  };

  // Start circle animation when audio plays
  React.useEffect(() => {
    if (isPlaying) {
      setShowCircle(true);
      setCirclePosition(0);
      setTracePath('');
      setHighlightedNotes(new Set());
      
      // Animate circle from bottom-left to top-right over audio duration
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
          
          // Update lowest note (since path is descending, track the final/lowest note)
          setLowestNote(prev => {
            const newLowest = !prev ? { note: currentNote, index: currentNoteIndex } : 
              (currentNoteIndex > prev.index ? { note: currentNote, index: currentNoteIndex } : prev);
            
            // Send lowest note data to App (for descending page, the "highest index" is actually the lowest note)
            if (onDataUpdate) {
              onDataUpdate(prevData => ({
                ...prevData,
                lowestNoteFromPage5: newLowest.note
              }));
            }
            
            return newLowest;
          });
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateCircle);
        } else {
          // Animation completed - show highest note display for longer duration
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
            }, 2000); // Display for 2 seconds (even faster)
          }, 200); // Smaller delay after animation completes
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

  // Function to get Y coordinate along the area contour (wave pattern)
  const getContourY = (x) => {
    // Define different pattern configurations
    const patterns = [
      // Pattern 0: Original pattern
      { lowLevel: 220, highLevel: 100, segments: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650] },
      // Pattern 1: Higher range
      { lowLevel: 180, highLevel: 60, segments: [60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660] },
      // Pattern 2: Lower range
      { lowLevel: 260, highLevel: 140, segments: [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520] },
      // Pattern 3: Quick changes
      { lowLevel: 200, highLevel: 80, segments: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390] },
      // Pattern 4: Longer holds
      { lowLevel: 240, highLevel: 120, segments: [80, 160, 240, 320, 400, 480, 560, 640] },
      // Pattern 5: Mixed levels
      { lowLevel: 210, highLevel: 90, segments: [45, 90, 135, 180, 225, 270, 315, 360, 405, 450, 495, 540] },
      // Pattern 6: Wide range
      { lowLevel: 250, highLevel: 50, segments: [70, 140, 210, 280, 350, 420, 490, 560, 630] },
      // Pattern 7: Narrow range
      { lowLevel: 190, highLevel: 130, segments: [35, 70, 105, 140, 175, 210, 245, 280, 315, 350, 385, 420] },
      // Pattern 8: Irregular timing
      { lowLevel: 230, highLevel: 110, segments: [25, 75, 100, 175, 225, 275, 325, 400, 475, 525, 575, 625] },
      // Pattern 9: Gradual changes
      { lowLevel: 200, highLevel: 80, segments: [100, 200, 300, 400, 500, 600] }
    ];
    
    const pattern = patterns[currentPattern];
    const { lowLevel, highLevel, segments } = pattern;
    
    // Start at bottom
    if (x <= segments[0]) return 280;
    
    // Generate wave pattern based on segments
    for (let i = 0; i < segments.length - 1; i++) {
      const startX = segments[i];
      const endX = segments[i + 1];
      
      if (x <= endX) {
        const progress = (x - startX) / (endX - startX);
        
        // Determine if this segment is rising, falling, or flat
        const segmentType = i % 4; // 0: rise to low, 1: rise to high, 2: stay high, 3: fall to low
        
        switch (segmentType) {
          case 0: // Rise to low level
            return 280 - (progress * (280 - lowLevel));
          case 1: // Rise to high level  
            return lowLevel - (progress * (lowLevel - highLevel));
          case 2: // Stay at high level
            return highLevel;
          case 3: // Fall to low level
            return highLevel + (progress * (lowLevel - highLevel));
          default:
            return lowLevel;
        }
      }
    }
    
    return lowLevel; // End at low level
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

  // Function to get Y coordinate for user's path (similar wave pattern but different)
  const getUserContourY = (x) => {
    // Create a wave pattern similar to audio but with different timing and levels
    const userLowLevel = 200; // E4 level (slightly higher than audio low)
    const userHighLevel = 120; // G4 level (slightly lower than audio high)
    
    if (x <= 60) return 260; // Start at bottom (D4 level, slightly higher than audio)
    if (x <= 120) return 260 - ((x - 60) / 60) * 60; // Rise to first low level (E4)
    if (x <= 180) return userLowLevel - ((x - 120) / 60) * 80; // Rise to first high (G4)
    if (x <= 220) return userHighLevel; // Stay at high level (shorter than audio)
    if (x <= 280) return userHighLevel + ((x - 220) / 60) * 80; // Fall to low level (E4)
    if (x <= 340) return userLowLevel; // Stay at low level (longer than audio)
    if (x <= 400) return userLowLevel - ((x - 340) / 60) * 80; // Rise to high level (G4)
    if (x <= 440) return userHighLevel; // Stay at high level
    if (x <= 500) return userHighLevel + ((x - 440) / 60) * 80; // Fall to low level (E4)
    if (x <= 560) return userLowLevel; // Stay at low level
    if (x <= 620) return userLowLevel - ((x - 560) / 60) * 80; // Rise to high level (G4)
    if (x <= 660) return userHighLevel; // Stay at high level
    if (x <= 700) return userHighLevel + ((x - 660) / 40) * 80; // Final fall to low level
    return userLowLevel; // End at low level (E4)
  };

  return (
    <div className="empty-screen">
      <div className="empty-screen-content">
        <h1 className="empty-title">Let's practice some melodies</h1>
        
        {/* Play Controls */}
        <PlayControls
          isPlaying={isPlaying}
          lyrics={lyrics}
          lyricsData={lyricsData}
          currentTime={currentTime}
          onPlay={handlePlay}
          onPause={handlePause}
        />

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
            <svg 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
              }}
              viewBox="0 0 800 300"
              preserveAspectRatio="none"
            >
              
              {/* Trace line left behind by the circle */}
              {tracePath && (
                <path
                  d={tracePath}
                  fill="none"
                  stroke={micActivated ? "#DDF8E5" : "#3D8A27"}
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
            
            {['B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4'].map((note, index) => {
              const isNoteHighlighted = highlightedNotes.has(note);
              
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
                      ${isNoteHighlighted ? '#3D8A27' : '#DDDDDD'} 0px,
                      ${isNoteHighlighted ? '#3D8A27' : '#DDDDDD'} 6px,
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
                    {renderMiniPianoKey(note, isNoteHighlighted)}
                  </div>
                </div>
              );
            })}
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
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
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
              Match the melody to create same pattern
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
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
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
                Match the melody to create same pattern
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
                      // New Pattern logic - generate new pattern and restart
                      generateNewPattern(); // Generate new random pattern
                      setShowUserCircle(false);
                      setUserTracePath('');
                      setUserCirclePosition(0);
                      setMicActivated(false);
                      setShowSecondOverlay(false);
                      setShouldExitSecondOverlay(false);
                      setShowStrikeThrough(false);
                      setShowCircle(false);
                      setTracePath('');
                      setHighlightedNotes(new Set());
                      setHighestNote(null);
                      setShowHighestNote(false);
                      setShouldExitDisplay(false);
                      setShowGlassOverlay(false);
                      setShouldExitOverlay(false);
                      setShowMicButton(false);
                      // Restart the audio to show new pattern
                      if (isPlaying) {
                        pause();
                      }
                      setTimeout(() => {
                        handlePlay();
                      }, 100);
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
                    New Pattern
                  </button>
                  
                  <button
                    onClick={() => {
                      // Play Next logic - close overlay and continue to sixth page
                      setShouldExitSecondOverlay(true);
                      // Clean up after exit animation
                      setTimeout(() => {
                        setShowSecondOverlay(false);
                        setShouldExitSecondOverlay(false);
                        setShowStrikeThrough(false);
                        // Navigate to sixth page
                        if (onNavigate) {
                          onNavigate('sixth');
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
                    Play Next
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
            console.log('Mic tapped on Page 5');
            setMicActivated(true);
            // Keep mic button visible for voice input
          }}
          onVoiceDetected={() => {
            console.log('Voice detected on Page 5 - starting user path');
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

export default FifthPage;
