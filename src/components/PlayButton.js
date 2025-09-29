import React, { useState, useEffect } from 'react';

/**
 * Play Button Component with Play and Pause States
 * Uses surface/inverted background with content/inverted text
 */
const PlayButton = ({ 
  onPlay, 
  onPause, 
  isPlaying = false, 
  size = 48, 
  disabled = false,
  className = '',
  style = {}
}) => {
  const [isPlayingState, setIsPlayingState] = useState(isPlaying);

  // Sync internal state with prop changes
  React.useEffect(() => {
    setIsPlayingState(isPlaying);
  }, [isPlaying]);

  const handleClick = () => {
    if (disabled) return;

    if (isPlayingState) {
      onPause && onPause();
    } else {
      onPlay && onPlay();
    }
    // Don't manually toggle state - let it sync from props
    // setIsPlayingState(!isPlayingState);
  };

  // Convert size to rem (assuming 16px base)
  const sizeRem = size / 16;

  const buttonStyle = {
    width: `${sizeRem}rem`,
    height: `${sizeRem}rem`,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: disabled ? 'var(--content-disabled)' : 'var(--surface-inverted)',
    color: 'var(--content-inverted)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${sizeRem * 0.4}rem`, // Icon size relative to button size
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'Figtree, sans-serif',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const hoverStyle = !disabled ? {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(34, 34, 34, 0.3)'
  } : {};

  return (
    <button
      className={className}
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }
      }}
      aria-label={isPlayingState ? 'Pause' : 'Play'}
    >
      {isPlayingState ? (
        // Pause Icon (two vertical bars)
        <svg 
          width="40%" 
          height="40%" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        // Play Icon (triangle)
        <svg 
          width="40%" 
          height="40%" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{ marginLeft: '0.125rem' }} // Slight offset for visual centering
        >
          <polygon points="5,3 19,12 5,21" />
        </svg>
      )}
    </button>
  );
};

/**
 * Example usage component to demonstrate the PlayButton
 */
export const PlayButtonExample = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    console.log('Play button clicked');
    setIsPlaying(true);
  };

  const handlePause = () => {
    console.log('Pause button clicked');
    setIsPlaying(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      flexWrap: 'wrap'
    }}>
      {/* Different sizes */}
      <PlayButton 
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={isPlaying}
        size={32}
      />
      <PlayButton 
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={isPlaying}
        size={48}
      />
      <PlayButton 
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={isPlaying}
        size={64}
      />
      
      {/* Disabled state */}
      <PlayButton 
        onPlay={handlePlay}
        onPause={handlePause}
        isPlaying={false}
        size={48}
        disabled={true}
      />
    </div>
  );
};

export default PlayButton;


