/**
 * Lyrics Highlighting Utility
 * Handles highlighting of lyrics chunks based on timestamps
 */

export class LyricsHighlighter {
  constructor(lyricsData = [], options = {}) {
    this.lyricsData = lyricsData; // Array of lyrics chunks with timestamps
    this.currentTime = 0;
    this.activeChunkIndex = -1;
    this.previousChunkIndex = -1;
    
    // Options
    this.options = {
      // Highlight timing offset (in seconds)
      highlightOffset: 0,
      // Whether to auto-advance to next chunk
      autoAdvance: true,
      // Callback functions
      onChunkChange: null,
      onChunkHighlight: null,
      onChunkComplete: null,
      ...options
    };

    // Validate and sort lyrics data
    this.validateAndSortLyrics();
  }

  /**
   * Validate and sort lyrics data by timestamp
   */
  validateAndSortLyrics() {
    if (!Array.isArray(this.lyricsData)) {
      throw new Error('Lyrics data must be an array');
    }

    // Validate each chunk
    this.lyricsData.forEach((chunk, index) => {
      if (chunk.timestamp === undefined || chunk.timestamp === null || typeof chunk.timestamp !== 'number') {
        console.error(`Chunk at index ${index}:`, chunk);
        throw new Error(`Invalid timestamp for chunk at index ${index}. Expected number, got: ${typeof chunk.timestamp}`);
      }
      if (!chunk.text || typeof chunk.text !== 'string') {
        console.error(`Chunk at index ${index}:`, chunk);
        throw new Error(`Invalid text for chunk at index ${index}. Expected string, got: ${typeof chunk.text}`);
      }
    });

    // Sort by timestamp
    this.lyricsData.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Update current time and check for active chunks
   * @param {number} currentTime - Current playback time in seconds
   * @returns {Object} - Information about current state
   */
  updateTime(currentTime) {
    this.currentTime = currentTime + this.options.highlightOffset;
    
    const result = {
      currentTime: this.currentTime,
      activeChunkIndex: this.activeChunkIndex,
      activeChunk: null,
      hasChanged: false,
      isComplete: false
    };

    // Find the active chunk
    const newActiveIndex = this.findActiveChunkIndex(this.currentTime);
    
    if (newActiveIndex !== this.activeChunkIndex) {
      this.previousChunkIndex = this.activeChunkIndex;
      this.activeChunkIndex = newActiveIndex;
      result.hasChanged = true;

      // Trigger callbacks
      if (this.options.onChunkChange) {
        this.options.onChunkChange({
          previousIndex: this.previousChunkIndex,
          currentIndex: this.activeChunkIndex,
          previousChunk: this.getChunk(this.previousChunkIndex),
          currentChunk: this.getChunk(this.activeChunkIndex)
        });
      }
    }

    // Set active chunk info
    if (this.activeChunkIndex >= 0) {
      result.activeChunk = this.getChunk(this.activeChunkIndex);
      result.activeChunkIndex = this.activeChunkIndex;

      // Check if chunk should be highlighted
      if (this.shouldHighlightChunk(this.activeChunkIndex, this.currentTime)) {
        if (this.options.onChunkHighlight) {
          this.options.onChunkHighlight(result.activeChunk, this.activeChunkIndex);
        }
      }

      // Check if chunk is complete
      if (this.isChunkComplete(this.activeChunkIndex, this.currentTime)) {
        result.isComplete = true;
        if (this.options.onChunkComplete) {
          this.options.onChunkComplete(result.activeChunk, this.activeChunkIndex);
        }
      }
    }

    return result;
  }

  /**
   * Find the active chunk index for given time
   * @param {number} time - Current time in seconds
   * @returns {number} - Index of active chunk, -1 if none
   */
  findActiveChunkIndex(time) {
    for (let i = this.lyricsData.length - 1; i >= 0; i--) {
      if (time >= this.lyricsData[i].timestamp) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if chunk should be highlighted at current time
   * @param {number} chunkIndex - Index of chunk to check
   * @param {number} time - Current time
   * @returns {boolean}
   */
  shouldHighlightChunk(chunkIndex, time) {
    const chunk = this.getChunk(chunkIndex);
    if (!chunk) return false;

    const nextChunk = this.getChunk(chunkIndex + 1);
    const endTime = nextChunk ? nextChunk.timestamp : chunk.timestamp + (chunk.duration || 3);

    return time >= chunk.timestamp && time < endTime;
  }

  /**
   * Check if chunk is complete
   * @param {number} chunkIndex - Index of chunk to check
   * @param {number} time - Current time
   * @returns {boolean}
   */
  isChunkComplete(chunkIndex, time) {
    const chunk = this.getChunk(chunkIndex);
    if (!chunk) return false;

    const nextChunk = this.getChunk(chunkIndex + 1);
    const endTime = nextChunk ? nextChunk.timestamp : chunk.timestamp + (chunk.duration || 3);

    return time >= endTime;
  }

  /**
   * Get chunk by index
   * @param {number} index - Chunk index
   * @returns {Object|null} - Chunk object or null
   */
  getChunk(index) {
    if (index < 0 || index >= this.lyricsData.length) {
      return null;
    }
    return this.lyricsData[index];
  }

  /**
   * Get all chunks that should be visible at current time
   * @param {number} time - Current time
   * @param {number} contextLines - Number of lines before/after to show
   * @returns {Array} - Array of visible chunks with highlight info
   */
  getVisibleChunks(time = this.currentTime, contextLines = 2) {
    const activeIndex = this.findActiveChunkIndex(time);
    const visibleChunks = [];

    const startIndex = Math.max(0, activeIndex - contextLines);
    const endIndex = Math.min(this.lyricsData.length - 1, activeIndex + contextLines);

    for (let i = startIndex; i <= endIndex; i++) {
      const chunk = this.getChunk(i);
      if (chunk) {
        visibleChunks.push({
          ...chunk,
          index: i,
          isActive: i === activeIndex,
          isHighlighted: this.shouldHighlightChunk(i, time),
          isComplete: this.isChunkComplete(i, time),
          isPrevious: i < activeIndex,
          isUpcoming: i > activeIndex
        });
      }
    }

    return visibleChunks;
  }

  /**
   * Reset highlighter state
   */
  reset() {
    this.currentTime = 0;
    this.activeChunkIndex = -1;
    this.previousChunkIndex = -1;
  }

  /**
   * Update lyrics data
   * @param {Array} newLyricsData - New lyrics data
   */
  updateLyrics(newLyricsData) {
    this.lyricsData = newLyricsData;
    this.validateAndSortLyrics();
    this.reset();
  }

  /**
   * Get current progress through all lyrics
   * @returns {number} - Progress percentage (0-100)
   */
  getProgress() {
    if (this.lyricsData.length === 0) return 0;
    
    const lastChunk = this.lyricsData[this.lyricsData.length - 1];
    const totalDuration = lastChunk.timestamp + (lastChunk.duration || 3);
    
    return Math.min(100, (this.currentTime / totalDuration) * 100);
  }

  /**
   * Jump to specific chunk
   * @param {number} chunkIndex - Index of chunk to jump to
   * @returns {Object} - Chunk information
   */
  jumpToChunk(chunkIndex) {
    const chunk = this.getChunk(chunkIndex);
    if (chunk) {
      this.updateTime(chunk.timestamp);
      return chunk;
    }
    return null;
  }
}

/**
 * Simple function to create lyrics highlighter
 * @param {Array} lyricsData - Array of lyrics chunks
 * @param {Object} options - Configuration options
 * @returns {LyricsHighlighter} - Highlighter instance
 */
export const createLyricsHighlighter = (lyricsData, options = {}) => {
  return new LyricsHighlighter(lyricsData, options);
};

/**
 * Helper function to format lyrics data
 * @param {Array} rawLyrics - Raw lyrics with timestamps
 * @returns {Array} - Formatted lyrics data
 */
export const formatLyricsData = (rawLyrics) => {
  return rawLyrics.map((item, index) => ({
    id: item.id || `chunk-${index}`,
    timestamp: item.timestamp || item.time || 0,
    text: item.text || item.lyrics || '',
    duration: item.duration || null,
    metadata: item.metadata || {}
  }));
};


