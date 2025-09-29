import React, { useState, useEffect } from 'react';

/**
 * Floating Notes Component
 * Generates random musical notes that float upwards when audio is playing
 */
const FloatingNotes = ({ showFloatingNotes = false, noteCount = null, containerHeight = '100vh', onNoteDisappear = null, onAllNotesComplete = null }) => {
  const [notes, setNotes] = useState([]);
  const [generatedNotes, setGeneratedNotes] = useState([]);

  // Musical notes array - C1 to B8 (96 notes total)
  const generateMusicalNotes = () => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notes = [];
    
    // Generate notes from octave 1 to 8
    for (let octave = 1; octave <= 8; octave++) {
      for (let note of noteNames) {
        notes.push(`${note}${octave}`);
      }
    }
    
    return notes;
  };
  
  const musicalNotes = generateMusicalNotes();

  // Colorful Diwali bubble colors
  const bubbleColors = [
    { bg: '#FF6B6B', text: '#FFFFFF' }, // Bright Coral
    { bg: '#FFD93D', text: '#333333' }, // Golden Yellow
    { bg: '#6BCF7F', text: '#FFFFFF' }, // Emerald Green
    { bg: '#4ECDC4', text: '#FFFFFF' }, // Turquoise
    { bg: '#45B7D1', text: '#FFFFFF' }, // Sky Blue
    { bg: '#96CEB4', text: '#333333' }, // Mint Green
    { bg: '#FFEAA7', text: '#333333' }, // Light Gold
    { bg: '#FF7675', text: '#FFFFFF' }, // Rose Pink
    { bg: '#A29BFE', text: '#FFFFFF' }, // Lavender
    { bg: '#FD79A8', text: '#FFFFFF' }, // Pink
    { bg: '#FDCB6E', text: '#333333' }, // Orange
    { bg: '#00B894', text: '#FFFFFF' }  // Teal
  ];

  // Generate random note
  const generateNote = () => {
    const note = musicalNotes[Math.floor(Math.random() * musicalNotes.length)];
    const id = Date.now() + Math.random();
    const leftPosition = Math.random() * 90; // 0-90% to keep notes on screen
    const animationDuration = 3 + Math.random() * 2; // 3-5 seconds
    const size = 40 + Math.random() * 20; // 40-60px diameter
    const colorScheme = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
    
    return {
      id,
      note,
      leftPosition,
      animationDuration,
      size,
      colorScheme
    };
  };

  // Add new notes when playing
  useEffect(() => {
    if (!showFloatingNotes) {
      return;
    }

    // Two modes: exact count (voice) or continuous (audio)
    if (noteCount !== null) {
      // Voice mode: Generate exact number of notes
      let generatedCount = 0;
      
      const generateExactNotes = () => {
        if (generatedCount >= noteCount) {
          return; // Stop after reaching exact count
        }
        
        const newNote = generateNote();
        setNotes(prevNotes => [...prevNotes, newNote]);
        setGeneratedNotes(prevNotes => [...prevNotes, newNote]);
        generatedCount++;

        // Remove note after animation completes
        setTimeout(() => {
          if (onNoteDisappear) {
            onNoteDisappear(newNote.note);
          }
          setNotes(prevNotes => prevNotes.filter(n => n.id !== newNote.id));
        }, newNote.animationDuration * 1000);
        
        // Generate next note if we haven't reached the limit
        if (generatedCount < noteCount) {
          setTimeout(generateExactNotes, 200); // 200ms between notes
        }
      };
      
      // Start generating exact notes
      generateExactNotes();
      
    } else {
      // Audio mode: Generate notes continuously
      const interval = setInterval(() => {
        const newNote = generateNote();
        setNotes(prevNotes => [...prevNotes, newNote]);
        setGeneratedNotes(prevNotes => [...prevNotes, newNote]);

        // Remove note after animation completes
        setTimeout(() => {
          if (onNoteDisappear) {
            onNoteDisappear(newNote.note);
          }
          setNotes(prevNotes => prevNotes.filter(n => n.id !== newNote.id));
        }, newNote.animationDuration * 1000);
      }, 500 + Math.random() * 1000); // Generate note every 0.5-1.5 seconds

      return () => clearInterval(interval);
    }
  }, [showFloatingNotes, noteCount]);

  // Handle batch removal when audio stops - wait for last note to complete
  useEffect(() => {
    if (!showFloatingNotes && generatedNotes.length > 0) {
      // Find the note with longest remaining time
      const maxDuration = Math.max(...generatedNotes.map(note => note.animationDuration));
      
      // Clear all after the longest animation and notify completion
      setTimeout(() => {
        setNotes([]);
        setGeneratedNotes([]);
        
        // Emit boolean callback when all notes are complete
        if (onAllNotesComplete) {
          onAllNotesComplete(true);
        }
      }, maxDuration * 1000);
    }
  }, [showFloatingNotes, generatedNotes, onAllNotesComplete]);

  const noteStyle = (note) => ({
    position: 'absolute',
    bottom: '-60px', // Start below screen
    left: `${note.leftPosition}%`,
    width: `${note.size}px`,
    height: `${note.size}px`,
    borderRadius: '50%',
    backgroundColor: note.colorScheme.bg,
    border: `3px solid ${note.colorScheme.bg}`,
    boxShadow: `0 6px 20px ${note.colorScheme.bg}40, inset 0 3px 8px rgba(255, 255, 255, 0.3)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem', // 12px
    fontWeight: '700', // Extra bold for contrast
    color: note.colorScheme.text,
    fontFamily: 'Figtree, sans-serif',
    animation: `floatUp ${note.animationDuration}s ease-out forwards`,
    backdropFilter: 'blur(5px)',
    zIndex: 1,
    pointerEvents: 'none',
    textShadow: note.colorScheme.text === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(255,255,255,0.5)'
  });

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 1
  };

  return (
    <div style={containerStyle}>
      {notes.map(note => (
        <div
          key={note.id}
          style={noteStyle(note)}
        >
          {note.note}
        </div>
      ))}
    </div>
  );
};

export default FloatingNotes;
