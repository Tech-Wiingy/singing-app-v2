import { useState, useEffect, useRef, useCallback } from 'react';
import { LyricsHighlighter } from '../utils/lyricsHighlighter';

/**
 * React Hook for Lyrics Highlighting
 * @param {Array} lyricsData - Array of lyrics chunks with timestamps
 * @param {Object} options - Configuration options
 * @returns {Object} - Lyrics highlighter state and controls
 */
export const useLyricsHighlighter = (lyricsData = [], options = {}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);
  const [activeChunk, setActiveChunk] = useState(null);
  const [visibleChunks, setVisibleChunks] = useState([]);
  const [progress, setProgress] = useState(0);

  const highlighterRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize highlighter
  useEffect(() => {
    if (lyricsData.length > 0) {
      highlighterRef.current = new LyricsHighlighter(lyricsData, {
        ...options,
        onChunkChange: (changeInfo) => {
          setActiveChunkIndex(changeInfo.currentIndex);
          setActiveChunk(changeInfo.currentChunk);
          // Call user's callback if provided
          if (options.onChunkChange) {
            options.onChunkChange(changeInfo);
          }
        },
        onChunkHighlight: (chunk, index) => {
          // Call user's callback if provided
          if (options.onChunkHighlight) {
            options.onChunkHighlight(chunk, index);
          }
        },
        onChunkComplete: (chunk, index) => {
          // Call user's callback if provided
          if (options.onChunkComplete) {
            options.onChunkComplete(chunk, index);
          }
        }
      });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [lyricsData, options]);

  // Update time and get current state
  const updateTime = useCallback((time) => {
    if (highlighterRef.current) {
      const result = highlighterRef.current.updateTime(time);
      setCurrentTime(result.currentTime);
      
      // Update visible chunks
      const visible = highlighterRef.current.getVisibleChunks(result.currentTime);
      setVisibleChunks(visible);
      
      // Update progress
      const currentProgress = highlighterRef.current.getProgress();
      setProgress(currentProgress);
      
      return result;
    }
    return null;
  }, []);

  // Start auto-updating with audio time
  const startSync = useCallback((getCurrentTime, interval = 100) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const time = getCurrentTime();
      updateTime(time);
    }, interval);
  }, [updateTime]);

  // Stop auto-updating
  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual time update
  const setTime = useCallback((time) => {
    updateTime(time);
  }, [updateTime]);

  // Jump to specific chunk
  const jumpToChunk = useCallback((chunkIndex) => {
    if (highlighterRef.current) {
      const chunk = highlighterRef.current.jumpToChunk(chunkIndex);
      if (chunk) {
        updateTime(chunk.timestamp);
        return chunk;
      }
    }
    return null;
  }, [updateTime]);

  // Reset highlighter
  const reset = useCallback(() => {
    if (highlighterRef.current) {
      highlighterRef.current.reset();
      setCurrentTime(0);
      setActiveChunkIndex(-1);
      setActiveChunk(null);
      setVisibleChunks([]);
      setProgress(0);
    }
  }, []);

  // Get chunk by index
  const getChunk = useCallback((index) => {
    if (highlighterRef.current) {
      return highlighterRef.current.getChunk(index);
    }
    return null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSync();
    };
  }, [stopSync]);

  return {
    // State
    currentTime,
    activeChunkIndex,
    activeChunk,
    visibleChunks,
    progress,
    
    // Controls
    updateTime,
    setTime,
    startSync,
    stopSync,
    jumpToChunk,
    reset,
    getChunk,
    
    // Highlighter instance (for advanced usage)
    highlighter: highlighterRef.current
  };
};

export default useLyricsHighlighter;








