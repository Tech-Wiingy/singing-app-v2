import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

/**
 * React Hook for Audio Playback using Howler.js
 * More reliable and feature-rich than native HTML5 audio
 */
export const useHowler = (audioSrc, options = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(options.volume || 0.7);

  const howlRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize Howl instance once
  useEffect(() => {
    if (!howlRef.current && audioSrc) {
      setIsLoading(true);
      setError(null);

      howlRef.current = new Howl({
        src: [audioSrc],
        volume: volume,
        loop: options.loop || false,
        autoplay: false,
        preload: true,
        
        // Event handlers
        onload: () => {
          setIsLoading(false);
          setDuration(howlRef.current.duration());
          console.log('Audio loaded successfully');
        },
        
        onloaderror: (id, error) => {
          setError(error);
          setIsLoading(false);
          console.error('Audio load error:', error);
          if (options.onError) options.onError(error);
        },
        
        onplay: () => {
          setIsPlaying(true);
          setIsPaused(false);
          setError(null);
          console.log('Audio started playing');
        },
        
        onpause: () => {
          setIsPlaying(false);
          setIsPaused(true);
          console.log('Audio paused');
        },
        
        onstop: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentTime(0);
          console.log('Audio stopped');
        },
        
        onend: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentTime(0);
          console.log('Audio finished playing');
          if (options.onEnd) options.onEnd();
        },
        
        onplayerror: (id, error) => {
          setError(error);
          setIsPlaying(false);
          console.error('Audio play error:', error);
          if (options.onError) options.onError(error);
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audioSrc, volume, options.loop]);

  // Update current time during playback
  useEffect(() => {
    if (isPlaying && howlRef.current) {
      intervalRef.current = setInterval(() => {
        const time = howlRef.current.seek();
        setCurrentTime(typeof time === 'number' ? time : 0);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  // Update volume when it changes
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
  }, [volume]);

  // Play function
  const play = useCallback(async () => {
    if (howlRef.current) {
      try {
        const id = howlRef.current.play();
        return id;
      } catch (error) {
        setError(error);
        console.error('Error playing audio:', error);
        throw error;
      }
    }
  }, []);

  // Pause function
  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
    }
  }, []);

  // Stop function
  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
    }
  }, []);

  // Seek to specific time
  const seekTo = useCallback((time) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setCurrentTime(time);
    }
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Format time helper
  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get audio state
  const getState = useCallback(() => {
    if (!howlRef.current) return 'unloaded';
    if (isLoading) return 'loading';
    if (isPlaying) return 'playing';
    if (isPaused) return 'paused';
    return 'loaded';
  }, [isLoading, isPlaying, isPaused]);

  return {
    // State
    isPlaying,
    isPaused,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    
    // Controls
    play,
    pause,
    stop,
    toggle,
    seekTo,
    setVolume,
    
    // Utilities
    formatTime,
    getState,
    
    // Howl instance (for advanced usage)
    howl: howlRef.current
  };
};

export default useHowler;






