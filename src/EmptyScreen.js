import React, { useState, useRef } from 'react';
import PlayControls from './components/PlayControls';
import FloatingNotes from './components/FloatingNotes';
import NotesHit from './components/NotesHit';
import TargetDisplay from './components/TargetDisplay';
import MicrophoneButton from './components/MicrophoneButton';
import AudioVisualizer from './components/AudioVisualizer';
import { useHowler } from './hooks/useHowler';
import audioFile from './assets/audio/scale-up.mp3';
import './App.css';

const EmptyScreen = ({ onNavigate }) => {
  const [notesHit, setNotesHit] = useState([]);
  const [showTarget, setShowTarget] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);
  const [showMicButton, setShowMicButton] = useState(false);
  const [targetText, setTargetText] = useState("Hit 4 notes in 3 secs");
  const [showStrikeThrough, setShowStrikeThrough] = useState(false);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [shouldShowFloatingNotes, setShouldShowFloatingNotes] = useState(false);
  const [currentNoteCount, setCurrentNoteCount] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);

  // Audio source - scale-up.mp3 from assets/audio directory
  const audioSrc = audioFile;

  // Lyrics data for the audio - using lyrics
  const lyrics = "Yaaaaaaaaaaaaaaaaaaaaa";
  const lyricsData = [
    {
      id: 'line1',
      timestamp: 0.0,
      text: lyrics,
      duration: 3.0
    }
  ];

  // Use Howler audio hook
  const {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    formatTime,
    isLoading,
    error
  } = useHowler(audioSrc, {
    volume: 0.7,
    onEnd: () => {
      console.log('Audio playback ended');
    }
  });

  const handlePlay = () => {
    try {
      play();
      // State will sync automatically via useEffect
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handlePause = () => {
    pause();
    // State will sync automatically via useEffect
  };

  // Handle note disappearance
  const handleNoteDisappear = (noteName) => {
    setNotesHit(prev => [...prev, noteName]);
  };

  // Handle all notes completion
  const handleAllNotesComplete = (isComplete) => {
    if (isComplete && notesHit.length > 0) {
      setShowTarget(true);
      setShouldExit(false);
      setVoiceDetected(false);
      setCurrentNoteCount(null);
      // Start exit animation after 3 seconds, then hide after animation completes
      setTimeout(() => {
        setShouldExit(true);

        // Hide components after exit animation completes (0.6s)
        setTimeout(() => {
          setShowTarget(false);
          setShouldExit(false);

          // Show microphone prompt after components are hidden
          setTimeout(() => {
            setShowMicButton(true);
          }, 400);
        }, 600);
      }, 4000); // Show target for 4 seconds before exit
    }
  };

  // Clear disappeared notes when audio starts playing
  React.useEffect(() => {
    if (isPlaying) {
      // Audio just started playing, clear previous notes and hide target
      setNotesHit([]);
      setShowTarget(false);
      setShouldExit(false);
      setShowMicButton(false);
      setVoiceDetected(false); // Reset voice state
    }
  }, [isPlaying]);

  // Handle microphone tap
  const handleMicTap = (action) => {
    if (action === 'deactivate') {
      // Reset all states when mic is deactivated
      setNotesHit([]);
      setShowTarget(false);
      setShouldExit(false);
      setShowMicButton(false);
      setVoiceDetected(false);
      setCurrentNoteCount(null);
      setShouldShowFloatingNotes(false);
    }
  };

  // Link audio playing to floating notes trigger
  React.useEffect(() => {
    if (isPlaying) {
      setShouldShowFloatingNotes(true);
    } else {
      setShouldShowFloatingNotes(false);
    }
  }, [isPlaying]);

  // Link voice detection to floating notes trigger  
  React.useEffect(() => {
    if (voiceDetected) {
      setShouldShowFloatingNotes(true);
    } else {
      setShouldShowFloatingNotes(false);
    }
  }, [voiceDetected]);

  // Handle voice detection
  const handleVoiceDetected = (noteCount) => {
    setAttemptCount(attemptCount + 1);
    console.log(`Voice detected! Generating ${noteCount} notes`);

    // Clear any existing notes
    setNotesHit([]);
    setShowTarget(false);
    setShowStrikeThrough(false);

    // Set the exact number of notes to generate
    setCurrentNoteCount(noteCount);
    setVoiceDetected(true);

    // Reset voice detection after brief trigger
    setTimeout(() => {
      setVoiceDetected(false);
      // currentNoteCount will be reset in handleAllNotesComplete
    }, 100);
  };

  return (
    <div className="empty-screen">
      <div className="empty-screen-content">
        <h1 className="empty-title">Hit some musical notes</h1>
        <PlayControls
          onPlay={handlePlay}
          onPause={handlePause}
          isPlaying={isPlaying}
          lyrics={lyrics}
          lyricsData={lyricsData}
          currentTime={currentTime}
        />

        {/* Hit Notes Display */}
        <NotesHit notesHit={notesHit} shouldExit={shouldExit} />
      </div>

      {/* Floating Notes Animation */}
      <FloatingNotes
        showFloatingNotes={shouldShowFloatingNotes}
        noteCount={currentNoteCount}
        onNoteDisappear={handleNoteDisappear}
        onAllNotesComplete={handleAllNotesComplete}
      />

      {/* Glass Overlay Popup for Target Display */}
      {showTarget && (
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
          opacity: shouldExit ? 0 : 1,
          transform: shouldExit ? 'scale(0.95)' : 'scale(1)',
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
              {targetText || `Hit ${4} notes in ${3} secs`}
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
                    // Retry logic - reset everything
                    setNotesHit([]);
                    setShowTarget(false);
                    setShowStrikeThrough(false);
                    setShouldExit(false);
                    setShowMicButton(true);
                    setAttemptCount(0);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
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
                  Retry
                </button>
                
                <button
                  onClick={() => {
                    // Navigate to next page - you'll need to pass this up to App.js
                    // For now, just log
                    console.log('Navigate to next page');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
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
        onTap={handleMicTap}
        onVoiceDetected={()=>handleVoiceDetected(Math.min(5 + attemptCount, 10))}
      />

      {/* Audio Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} />
    </div>
  );
};

export default EmptyScreen;