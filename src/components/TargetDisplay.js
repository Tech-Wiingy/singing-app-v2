import React, { useState, useEffect } from 'react';

/**
 * Target Display Component
 * Shows target message with fade-in animation after notes are hit
 */
const TargetDisplay = ({ 
  notesHit = [], 
  isVisible = false, 
  targetCount = 4, 
  targetTime = 3,
  onComplete = null,
  shouldExit = false,
  targetText = null,
  showStrikeThrough = false,
  className = '', 
  style = {} 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Trigger animation when component becomes visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure initial position is rendered before animation
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50); // 50ms delay
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  // Handle exit animation
  useEffect(() => {
    if (shouldExit && isAnimating) {
      setIsExiting(true);
    }
  }, [shouldExit, isAnimating]);

  if (!isVisible) {
    return null;
  }

  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) translateY(${isExiting ? '-50px' : (isAnimating ? '0' : '50px')})`,
    zIndex: 10,
    textAlign: 'center',
    fontFamily: 'Figtree, sans-serif',
    pointerEvents: 'none',
    opacity: isExiting ? 0 : (isAnimating ? 1 : 0),
    transition: isExiting ? 'all 0.6s ease-out' : 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    ...style
  };

  const textStyle = {
    fontSize: '2rem', // 32px
    fontWeight: '400', // regular
    lineHeight: '2.25rem', // 36px
    color: 'var(--content-primary)',
    margin: 0,
    whiteSpace: 'pre-line', // Allow line breaks
    textDecoration: showStrikeThrough ? 'line-through' : 'none',
    transition: 'text-decoration 0.5s ease'
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={textStyle}>
        {targetText || `Hit ${targetCount} notes in ${targetTime} secs`}
      </div>
    </div>
  );
};

export default TargetDisplay;
