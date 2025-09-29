import React, { useState } from 'react';
import { useAudio } from '../hooks/useAudio';
import { playAudio, stopAudio } from '../utils/audioPlayer';

/**
 * Example Audio Player Component
 * Demonstrates various ways to use the audio functionality
 */
const AudioPlayer = ({ audioSrc, title = "Audio Player" }) => {
  const {
    isPlaying,
    isPaused,
    duration,
    currentTime,
    volume,
    isLoading,
    error,
    isMuted,
    play,
    pause,
    stop,
    toggle,
    setVolume,
    seekToPercentage,
    toggleMute,
    progress,
    formatTime
  } = useAudio(audioSrc);

  const [showControls, setShowControls] = useState(true);

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleSeek = (e) => {
    const percentage = parseFloat(e.target.value);
    seekToPercentage(percentage);
  };

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3>Audio Error</h3>
        <p>Failed to load audio: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <button 
          onClick={() => setShowControls(!showControls)}
          style={styles.toggleButton}
        >
          {showControls ? 'Hide' : 'Show'} Controls
        </button>
      </div>

      {isLoading && (
        <div style={styles.loading}>Loading audio...</div>
      )}

      {showControls && (
        <div style={styles.controls}>
          {/* Main playback controls */}
          <div style={styles.playbackControls}>
            <button 
              onClick={toggle}
              disabled={isLoading}
              style={{...styles.button, ...styles.playButton}}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button 
              onClick={stop}
              disabled={isLoading}
              style={styles.button}
            >
              ⏹️
            </button>
            <button 
              onClick={toggleMute}
              style={styles.button}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Progress bar */}
          <div style={styles.progressContainer}>
            <span style={styles.timeDisplay}>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              style={styles.progressBar}
              disabled={isLoading || duration === 0}
            />
            <span style={styles.timeDisplay}>{formatTime(duration)}</span>
          </div>

          {/* Volume control */}
          <div style={styles.volumeContainer}>
            <label style={styles.label}>Volume:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={styles.volumeSlider}
            />
            <span style={styles.volumeDisplay}>{Math.round(volume * 100)}%</span>
          </div>

          {/* Status display */}
          <div style={styles.status}>
            Status: {
              isLoading ? 'Loading...' :
              isPlaying ? 'Playing' :
              isPaused ? 'Paused' :
              'Stopped'
            }
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple Audio Button Component
 * Just a button that plays audio when clicked
 */
export const AudioButton = ({ audioSrc, children, style = {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async () => {
    if (!isPlaying) {
      try {
        setIsPlaying(true);
        await playAudio(audioSrc, {
          onEnd: () => setIsPlaying(false),
          onError: () => setIsPlaying(false)
        });
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    } else {
      stopAudio();
      setIsPlaying(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      style={{...styles.simpleButton, ...style}}
      disabled={!audioSrc}
    >
      {children || (isPlaying ? '🔊 Playing...' : '🔊 Play Audio')}
    </button>
  );
};

/**
 * Audio List Component
 * Displays a list of audio files with play buttons
 */
export const AudioList = ({ audioFiles = [] }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const handlePlay = async (audioSrc, index) => {
    // Stop any currently playing audio
    if (currentlyPlaying !== null) {
      stopAudio(`audio-${currentlyPlaying}`);
    }

    try {
      setCurrentlyPlaying(index);
      await playAudio(audioSrc, {
        id: `audio-${index}`,
        onEnd: () => setCurrentlyPlaying(null),
        onError: () => setCurrentlyPlaying(null)
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentlyPlaying(null);
    }
  };

  const handleStop = (index) => {
    stopAudio(`audio-${index}`);
    setCurrentlyPlaying(null);
  };

  return (
    <div style={styles.audioList}>
      <h3>Audio Files</h3>
      {audioFiles.length === 0 ? (
        <p>No audio files available</p>
      ) : (
        audioFiles.map((audio, index) => (
          <div key={index} style={styles.audioItem}>
            <span style={styles.audioName}>
              {audio.name || `Audio ${index + 1}`}
            </span>
            <div style={styles.audioControls}>
              {currentlyPlaying === index ? (
                <button 
                  onClick={() => handleStop(index)}
                  style={{...styles.button, ...styles.stopButton}}
                >
                  ⏹️ Stop
                </button>
              ) : (
                <button 
                  onClick={() => handlePlay(audio.src, index)}
                  style={{...styles.button, ...styles.playButton}}
                >
                  ▶️ Play
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px 0',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Figtree, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  title: {
    margin: 0,
    color: '#333'
  },
  toggleButton: {
    padding: '5px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    fontStyle: 'italic',
    color: '#666'
  },
  errorContainer: {
    border: '1px solid #ff6b6b',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px 0',
    backgroundColor: '#ffebee',
    color: '#c62828'
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  playbackControls: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  button: {
    padding: '10px 15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s'
  },
  playButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: '1px solid #4CAF50'
  },
  stopButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: '1px solid #f44336'
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  progressBar: {
    flex: 1,
    height: '5px'
  },
  timeDisplay: {
    fontSize: '12px',
    color: '#666',
    minWidth: '40px'
  },
  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontSize: '14px',
    color: '#333'
  },
  volumeSlider: {
    width: '100px'
  },
  volumeDisplay: {
    fontSize: '12px',
    color: '#666',
    minWidth: '35px'
  },
  status: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic'
  },
  simpleButton: {
    padding: '10px 20px',
    border: '1px solid #2655A3',
    borderRadius: '4px',
    backgroundColor: '#2655A3',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  audioList: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#fff'
  },
  audioItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  audioName: {
    flex: 1,
    fontSize: '14px',
    color: '#333'
  },
  audioControls: {
    display: 'flex',
    gap: '5px'
  }
};

export default AudioPlayer;
