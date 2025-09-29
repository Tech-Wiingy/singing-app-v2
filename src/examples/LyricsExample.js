import React, { useState, useRef } from 'react';
import LyricsDisplay from '../components/LyricsDisplay';
import { useAudio } from '../hooks/useAudio';

/**
 * Example component demonstrating lyrics highlighting
 */
const LyricsExample = () => {
  // Sample lyrics data
  const sampleLyrics = [
    { id: 'line1', timestamp: 0, text: "Yaaaaaaaaaaaaaaaaaaaaa", duration: 3 },
    { id: 'line2', timestamp: 3.5, text: "This is the first line of our song", duration: 4 },
    { id: 'line3', timestamp: 8, text: "Hit some notes and feel the beat", duration: 3.5 },
    { id: 'line4', timestamp: 12, text: "Music flows through the air", duration: 4 },
    { id: 'line5', timestamp: 16.5, text: "Dancing to the rhythm we create", duration: 3.5 },
    { id: 'line6', timestamp: 20.5, text: "Every moment is a melody", duration: 4 },
    { id: 'line7', timestamp: 25, text: "Singing together in harmony", duration: 3.5 },
    { id: 'line8', timestamp: 29, text: "This is how our story goes", duration: 4 },
    { id: 'line9', timestamp: 33.5, text: "Yaaaaaaaaaaaaaaaaaaaaa", duration: 5 }
  ];

  const [currentLyrics, setCurrentLyrics] = useState(sampleLyrics);
  const [audioSrc, setAudioSrc] = useState('');
  const audioRef = useRef(null);

  // Audio hook for controlling playback
  const {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
    formatTime
  } = useAudio(audioSrc);

  // Set audio ref
  React.useEffect(() => {
    // This would be set when you have an actual audio element
    // For demo purposes, we'll simulate audio playback
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      setAudioSrc(audioUrl);
    }
  };

  const simulatePlayback = () => {
    // For demonstration without actual audio file
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const addLyricLine = () => {
    const newLine = {
      id: `line${currentLyrics.length + 1}`,
      timestamp: currentLyrics.length > 0 ? currentLyrics[currentLyrics.length - 1].timestamp + 5 : 0,
      text: `New lyric line ${currentLyrics.length + 1}`,
      duration: 3
    };
    setCurrentLyrics([...currentLyrics, newLine]);
  };

  const clearLyrics = () => {
    setCurrentLyrics([]);
  };

  const resetLyrics = () => {
    setCurrentLyrics(sampleLyrics);
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Figtree, sans-serif' 
    }}>
      <h1 style={{ 
        color: 'var(--brand-primary)', 
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        Lyrics Highlighting Demo
      </h1>

      {/* Audio Upload Section */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: 'var(--surface-primary)',
        borderRadius: '0.5rem',
        border: '1px solid var(--content-disabled)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--content-primary)' }}>
          Audio File
        </h3>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            width: '100%',
            border: '1px solid var(--content-disabled)',
            borderRadius: '0.25rem'
          }}
        />
        
        {/* Playback Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={simulatePlayback}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <span style={{ color: 'var(--content-secondary)' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress Bar */}
        {duration > 0 && (
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        )}
      </div>

      {/* Lyrics Controls */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: 'var(--surface-primary)',
        borderRadius: '0.5rem',
        border: '1px solid var(--content-disabled)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--content-primary)' }}>
          Lyrics Controls
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={addLyricLine}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--surface-inverted)',
              color: 'var(--content-inverted)',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Add Line
          </button>
          <button
            onClick={clearLyrics}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--content-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
          <button
            onClick={resetLyrics}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Reset Sample
          </button>
        </div>
      </div>

      {/* Lyrics Display */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--content-primary)' }}>
          Lyrics Display
        </h3>
        <LyricsDisplay
          lyricsData={currentLyrics}
          currentTime={currentTime}
          isPlaying={isPlaying}
          audioRef={audioRef}
          options={{
            highlightOffset: 0,
            onChunkChange: (info) => {
              console.log('Chunk changed:', info);
            },
            onChunkHighlight: (chunk) => {
              console.log('Highlighting:', chunk.text);
            }
          }}
        />
      </div>

      {/* Usage Instructions */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--surface-secondary)',
        borderRadius: '0.5rem'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--content-primary)' }}>
          How to Use
        </h3>
        <ul style={{ color: 'var(--content-secondary)', lineHeight: '1.6' }}>
          <li>Upload an audio file or use the demo controls</li>
          <li>Click play to start highlighting lyrics in sync</li>
          <li>Click on any lyric line to jump to that timestamp</li>
          <li>The active line is highlighted in blue</li>
          <li>Previous lines appear dimmed</li>
          <li>Upcoming lines are slightly transparent</li>
        </ul>
      </div>

      {/* Code Example */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'var(--surface-primary)',
        borderRadius: '0.5rem',
        border: '1px solid var(--content-disabled)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--content-primary)' }}>
          Code Example
        </h3>
        <pre style={{
          backgroundColor: '#2d2d2d',
          color: '#f8f8f2',
          padding: '1rem',
          borderRadius: '0.25rem',
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`// Lyrics data format
const lyricsData = [
  { 
    id: 'line1', 
    timestamp: 0, 
    text: "First line of lyrics", 
    duration: 3 
  },
  { 
    id: 'line2', 
    timestamp: 3.5, 
    text: "Second line of lyrics", 
    duration: 4 
  }
];

// Usage in component
<LyricsDisplay
  lyricsData={lyricsData}
  currentTime={audioCurrentTime}
  isPlaying={isAudioPlaying}
  audioRef={audioElementRef}
  options={{
    highlightOffset: 0,
    onChunkChange: (info) => console.log('Chunk changed:', info)
  }}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default LyricsExample;








