import React, { useState, useEffect } from 'react';

const AudioVisualizer = ({ isPlaying }) => {
  // Calculate number of rectangles based on screen width (approximately 1 rectangle per 8px)
  const numRectangles = Math.floor(window.innerWidth / 8);
  const [heights, setHeights] = useState(Array(numRectangles).fill(8));
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    let animationId;
    let startTime = Date.now();
    
    if (isPlaying) {
      const animate = () => {
        const currentTime = Date.now();
        const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
        setAnimationTime(elapsed);
        
        setHeights(prevHeights => 
          prevHeights.map((_, index) => {
            // Create wave effect using multiple sine waves
            const position = index / numRectangles; // 0 to 1 across screen width
            
            // Primary wave moving from left to right
            const primaryWave = Math.sin((position * Math.PI * 4) - (elapsed * 3));
            
            // Secondary wave moving from right to left (opposite direction)
            const secondaryWave = Math.sin((position * Math.PI * 6) + (elapsed * 2)) * 0.5;
            
            // Tertiary wave for more complexity
            const tertiaryWave = Math.sin((position * Math.PI * 8) - (elapsed * 4)) * 0.3;
            
            // Combine waves and normalize
            const combinedWave = (primaryWave + secondaryWave + tertiaryWave) / 1.8;
            
            // Convert to height (8px to 24px range)
            const baseHeight = 8;
            const maxHeight = 24;
            const waveHeight = ((combinedWave + 1) / 2) * (maxHeight - baseHeight) + baseHeight;
            
            return Math.max(baseHeight, Math.min(maxHeight, waveHeight));
          })
        );
        
        // Continue animation only if still playing
        if (isPlaying) {
          animationId = requestAnimationFrame(animate);
        }
      };
      
      animate();
    } else {
      // Reset to minimum height when not playing
      setHeights(Array(numRectangles).fill(8));
      setAnimationTime(0);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying, numRectangles]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'space-between',
      height: '24px',
      zIndex: 10,
      paddingLeft: '0.5rem',
      paddingRight: '0.5rem'
    }}>
      {heights.map((height, index) => (
        <div
          key={index}
          style={{
            width: '4px',
            height: `${height}px`,
            backgroundColor: 'var(--content-primary)',
            borderRadius: '2px',
            transition: 'height 0.15s ease',
            opacity: 0.7
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
