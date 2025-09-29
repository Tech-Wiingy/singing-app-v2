import React from 'react';
import { useLyricsHighlighter } from '../hooks/useLyricsHighlighter';

/**
 * Lyrics Display Component
 * Displays and highlights lyrics based on current playback time
 */
const LyricsDisplay = ({ 
  lyricsData = [], 
  currentTime = 0,
  isPlaying = false,
  audioRef = null,
  options = {},
  style = {},
  className = ''
}) => {
  // Use lyrics highlighter hook
  const {
    activeChunkIndex,
    activeChunk,
    visibleChunks,
    progress,
    setTime,
    startSync,
    stopSync,
    jumpToChunk
  } = useLyricsHighlighter(lyricsData, {
    highlightOffset: 0,
    autoAdvance: true,
    ...options
  });

  // Sync with audio playback
  React.useEffect(() => {
    if (isPlaying && audioRef?.current) {
      startSync(() => audioRef.current.currentTime);
    } else {
      stopSync();
    }

    return () => stopSync();
  }, [isPlaying, audioRef, startSync, stopSync]);

  // Manual time update when not playing
  React.useEffect(() => {
    if (!isPlaying) {
      setTime(currentTime);
    }
  }, [currentTime, isPlaying, setTime]);

  // Handle chunk click
  const handleChunkClick = (chunk, index) => {
    if (audioRef?.current) {
      audioRef.current.currentTime = chunk.timestamp;
      jumpToChunk(index);
    }
  };

  const containerStyle = {
    fontFamily: 'Figtree, sans-serif',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '1rem',
    backgroundColor: 'var(--surface-primary)',
    borderRadius: '0.5rem',
    border: '1px solid var(--content-disabled)',
    ...style
  };

  const chunkStyle = (chunk) => ({
    padding: '0.5rem 0.75rem',
    margin: '0.25rem 0',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: chunk.isActive ? '1.1rem' : '1rem',
    fontWeight: chunk.isActive ? '600' : '400',
    color: chunk.isActive 
      ? 'var(--brand-primary)' 
      : chunk.isPrevious 
        ? 'var(--content-secondary)' 
        : 'var(--content-primary)',
    backgroundColor: chunk.isHighlighted 
      ? 'rgba(38, 85, 163, 0.1)' 
      : 'transparent',
    opacity: chunk.isUpcoming ? 0.6 : 1,
    transform: chunk.isActive ? 'scale(1.02)' : 'scale(1)'
  });

  const progressStyle = {
    width: '100%',
    height: '4px',
    backgroundColor: 'var(--content-disabled)',
    borderRadius: '2px',
    marginBottom: '1rem',
    overflow: 'hidden'
  };

  const progressBarStyle = {
    width: `${progress}%`,
    height: '100%',
    backgroundColor: 'var(--brand-primary)',
    transition: 'width 0.3s ease'
  };

  if (lyricsData.length === 0) {
    return (
      <div style={containerStyle} className={className}>
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--content-secondary)',
          fontStyle: 'italic' 
        }}>
          No lyrics available
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      {/* Progress bar */}
      <div style={progressStyle}>
        <div style={progressBarStyle} />
      </div>

      {/* Current active chunk display */}
      {activeChunk && (
        <div style={{
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: 'rgba(38, 85, 163, 0.05)',
          borderRadius: '0.5rem',
          border: '2px solid var(--brand-primary)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--brand-primary)'
          }}>
            {activeChunk.text}
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'var(--content-secondary)',
            marginTop: '0.25rem'
          }}>
            {Math.floor(activeChunk.timestamp / 60)}:{(activeChunk.timestamp % 60).toFixed(1).padStart(4, '0')}
          </div>
        </div>
      )}

      {/* All visible chunks */}
      <div>
        {visibleChunks.map((chunk) => (
          <div
            key={chunk.id || chunk.index}
            style={chunkStyle(chunk)}
            onClick={() => handleChunkClick(chunk, chunk.index)}
            onMouseEnter={(e) => {
              if (!chunk.isActive) {
                e.target.style.backgroundColor = 'rgba(38, 85, 163, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!chunk.isActive && !chunk.isHighlighted) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ marginRight: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>
              {Math.floor(chunk.timestamp / 60)}:{(chunk.timestamp % 60).toFixed(0).padStart(2, '0')}
            </span>
            {chunk.text}
          </div>
        ))}
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          backgroundColor: 'var(--surface-secondary)',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          color: 'var(--content-secondary)'
        }}>
          <div>Active: {activeChunkIndex} | Progress: {progress.toFixed(1)}%</div>
          <div>Visible chunks: {visibleChunks.length}</div>
        </div>
      )}
    </div>
  );
};

export default LyricsDisplay;








