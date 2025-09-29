import React from 'react';
import PlayButton from './PlayButton';
import { useLyricsHighlighter } from '../hooks/useLyricsHighlighter';

/**
 * Play Controls Component
 * Contains play button with text and vinyl record with text
 */
const PlayControls = ({ 
  onPlay, 
  onPause, 
  isPlaying = false,
  playButtonSize = 32,
  vinylSize = 24,
  gap = '1rem',
  marginTop = '1.5rem', // 24px ÷ 16px = 1.5rem
  lyrics = 'Play',
  lyricsData = [],
  currentTime = 0,
  audioRef = null,
  vinylText = 'Vinyl Record',
  className = '',
  style = {}
}) => {
  // Use lyrics highlighter hook
  const {
    activeChunk,
    visibleChunks,
    setTime
  } = useLyricsHighlighter(lyricsData, {
    highlightOffset: 0,
    onChunkHighlight: (chunk) => {
      console.log('Highlighting lyrics:', chunk.text);
    }
  });

  // Update time for lyrics highlighting
  React.useEffect(() => {
    setTime(currentTime);
  }, [currentTime, setTime]);

  // Determine if lyrics should be highlighted
  const isLyricsHighlighted = activeChunk && activeChunk.text === lyrics && isPlaying;
  
  // Debug logging
  React.useEffect(() => {
    console.log('Debug - currentTime:', currentTime, 'isPlaying:', isPlaying, 'activeChunk:', activeChunk, 'isHighlighted:', isLyricsHighlighted);
  }, [currentTime, isPlaying, activeChunk, isLyricsHighlighted]);

  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap,
        marginTop,
        width: '100%',
        padding: '0.75rem', // 12px ÷ 16px = 0.75rem
        borderRadius: '1rem', // 8px border radius for modern look
        backgroundColor: 'var(--surface-secondary)',
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.09)', // Elevation shadow
        ...style
      }}
    >
      {/* Play Button with Text */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        flex: '1',
        minWidth: 0
      }}>
        <PlayButton 
          onPlay={onPlay}
          onPause={onPause}
          isPlaying={isPlaying}
          size={playButtonSize}
        />
        <span style={{
          fontFamily: 'Figtree, sans-serif',
          fontSize: '1rem', // 16px
          fontWeight: '500', // medium
          color: isLyricsHighlighted ? 'var(--brand-primary)' : 'var(--content-primary)',
          textAlign: 'center',
          flex: '1',
          backgroundColor: isLyricsHighlighted ? 'rgba(38, 85, 163, 0.1)' : 'transparent',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          transition: 'all 0.3s ease'
        }}>
          {lyrics}
        </span>
      </div>

      {/* Vinyl Record with Text */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '0.5rem' 
      }}>
        {/* Vinyl Record SVG */}
        <svg 
          width={vinylSize} 
          height={vinylSize} 
          viewBox="0 0 48 48" 
          fill="none"
          style={{
            animation: isPlaying ? 'vinylRotate 2s linear infinite' : 'none',
            transformOrigin: 'center center'
          }}
        >
          {/* Outer circle */}
          <circle 
            cx="24" 
            cy="24" 
            r="22" 
            fill="#444444" 
            stroke="var(--content-secondary)" 
            strokeWidth="2"
          />
          {/* Inner grooves */}
          <circle 
            cx="24" 
            cy="24" 
            r="18" 
            fill="none" 
            stroke="var(--content-secondary)" 
            strokeWidth="0.5" 
            opacity="0.6"
          />
          <circle 
            cx="24" 
            cy="24" 
            r="14" 
            fill="none" 
            stroke="var(--content-secondary)" 
            strokeWidth="0.5" 
            opacity="0.6"
          />
          <circle 
            cx="24" 
            cy="24" 
            r="10" 
            fill="none" 
            stroke="var(--content-secondary)" 
            strokeWidth="0.5" 
            opacity="0.6"
          />
          {/* 45-degree rotation indicator line */}
          <line 
            x1="24" 
            y1="10" 
            x2="24" 
            y2="20" 
            stroke="var(--content-inverted)" 
            strokeWidth="2"
            transform="rotate(45 24 24)"
          />
          {/* Center hole */}
          <circle 
            cx="24" 
            cy="24" 
            r="4" 
            fill="var(--surface-primary)"
          />
        </svg>
      </div>
    </div>
  );
};

export default PlayControls;
