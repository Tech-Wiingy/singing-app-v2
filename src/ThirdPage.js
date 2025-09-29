import React, { useState } from 'react';
import PlayControls from './components/PlayControls';
import NotesHit from './components/NotesHit';
import MicrophoneButton from './components/MicrophoneButton';
import AudioVisualizer from './components/AudioVisualizer';
import { useHowler } from './hooks/useHowler';
import audioFile from './assets/audio/scale-up.mp3';
import './App.css';

const ThirdPage = ({ onNavigate, onDataUpdate }) => {
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
    console.log('Page 3: Play button clicked');
    try {
      console.log('Page 3: Attempting to play audio');
      await play();
      console.log('Page 3: Audio play successful');
    } catch (error) {
      console.error('Page 3: Error playing audio:', error);
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
                lowestNoteFromPage3: newLowest.note
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
  
  // Function to get Y coordinate along the area contour (top-left to bottom-right)
  const getContourY = (x) => {
    // Follow the contour from top-left to bottom-right (descending)
    if (x <= 100) return 40; // Start at top (B4 level)
    if (x <= 150) return 40 + ((x - 100) / 50) * 60; // Descend to 100 (G#4 level)
    if (x <= 250) return 100; // Flat at G#4 level
    if (x <= 300) return 100 + ((x - 250) / 50) * 60; // Descend to 160 (F4 level)
    if (x <= 400) return 160; // Flat at F4 level
    if (x <= 450) return 160 + ((x - 400) / 50) * 60; // Descend to 220 (D4 level)
    if (x <= 550) return 220; // Flat at D4 level
    if (x <= 600) return 220 + ((x - 550) / 50) * 60; // Descend to 280 (C4 level)
    return 280; // End at bottom (C4 level)
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

  // Function to get Y coordinate for user's path (similar but different descending path)
  const getUserContourY = (x) => {
    // Similar descending path but with different steps and timing
    if (x <= 80) return 60; // Start slightly lower than audio path (A#4 level)
    if (x <= 180) return 60 + ((x - 80) / 100) * 50; // Gradual descend to 110 (G4 level)
    if (x <= 320) return 110; // Longer flat section at G4 level
    if (x <= 420) return 110 + ((x - 320) / 100) * 70; // Steeper descend to 180 (E4 level)
    if (x <= 520) return 180; // Flat at E4 level
    if (x <= 620) return 180 + ((x - 520) / 100) * 80; // Final descend to 260 (D4 level)
    return 260; // End at D4 level (not as low as audio path)
  };

  return (
    <div className="empty-screen">
      <div className="empty-screen-content">
        <h1 className="empty-title">Let's go Lower</h1>
        
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
              Try and hit B2, C3 & E3 in sequence
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
                Try and hit B2, C3 & E3 in sequence
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
                      // Play Next logic - close overlay and continue
                      setShouldExitSecondOverlay(true);
                      // Clean up after exit animation
                      setTimeout(() => {
                        setShowSecondOverlay(false);
                        setShouldExitSecondOverlay(false);
                        setShowStrikeThrough(false);
                        // Navigate to fourth page (piano results)
                        if (onNavigate) {
                          onNavigate('fourth');
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
            console.log('Mic tapped on Page 3');
            setMicActivated(true);
            // Keep mic button visible for voice input
          }}
          onVoiceDetected={() => {
            console.log('Voice detected on Page 3 - starting user path');
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

export default ThirdPage;
