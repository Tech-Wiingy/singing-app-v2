import React, { useState, useEffect } from 'react';

/**
 * Disappeared Notes Display Component
 * Shows count and names of notes that have disappeared
 */
const NotesHit = ({ notesHit = [], className = '', style = {}, shouldExit = false }) => {
  // const noteCount = notesHit.length;
  
  
  console.log('NotesHit render:', { noteCount, isAnimating, isExiting, notesHit });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(true);
  const [noteCount, setNoteCount] = useState(0);

  // Trigger animation when notes appear
  useEffect(() => {

    if (notesHit.length > 0) {
      setNoteCount(notesHit.length);  
      console.log("noteCount--------------------------------: ", noteCount,isExiting);
      setIsNotesVisible(true);
      // Small delay to ensure initial position is rendered before animation
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50); // 50ms delay
      
      return () => clearTimeout(timer);
    } else {
      setIsNotesVisible(false);
      setIsExiting(false);
      setIsAnimating(false);
    }
  }, [notesHit.length]);

  // Handle exit animation
  useEffect(() => {
    if (shouldExit && isAnimating) {
      setIsExiting(true);
    }
  }, [shouldExit, isAnimating]);

  if (noteCount === 0) {
    return null; // Don't render if no notes have disappeared
  }

  // Group notes by their name and count occurrences
  const noteGroups = notesHit.reduce((acc, note) => {
    acc[note] = (acc[note] || 0) + 1;
    return acc;
  }, {});

  // Sort notes alphabetically for consistent display
  const sortedNotes = Object.entries(noteGroups).sort(([a], [b]) => {
    // Sort by note name, then by octave
    const noteA = a.replace(/\d+/, '');
    const noteB = b.replace(/\d+/, '');
    const octaveA = parseInt(a.replace(/[^0-9]/g, ''));
    const octaveB = parseInt(b.replace(/[^0-9]/g, ''));
    
    if (noteA === noteB) {
      return octaveA - octaveB;
    }
    return noteA.localeCompare(noteB);
  });

  const containerStyle = {
    marginTop: '1.5rem',
    padding: '1rem',
    textAlign: 'center',
    fontFamily: 'Figtree, sans-serif',
    transform: `translateY(${isExiting ? '-50px' : (isNotesVisible ? '0px' : '50px')})`,
    opacity: isNotesVisible ? 1 : 0,
    transition: isExiting ? 'all 0.6s ease-out' : 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ...style
  };

  const titleStyle = {
    fontSize: '0.875rem', // 14px
    fontWeight: '600',
    color: 'var(--content-primary)',
    marginBottom: '0.5rem'
  };

  const notesListStyle = {
    fontSize: '0.75rem', // 12px
    color: 'var(--content-secondary)',
    lineHeight: '1.4',
    maxHeight: '4rem',
    overflowY: 'auto',
    wordWrap: 'break-word'
  };

  const noteItemStyle = {
    display: 'inline-block',
    margin: '0.125rem',
    padding: '0.125rem 0.25rem',
    backgroundColor: 'var(--surface-secondary)',
    borderRadius: '0.25rem',
    fontSize: '0.6875rem', // 11px
    fontWeight: '500'
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={titleStyle}>
        {noteCount} note{noteCount !== 1 ? 's' : ''} hit by the playback
      </div>
      
      <div style={notesListStyle}>
        {sortedNotes.map(([note, count]) => (
          <span key={note} style={noteItemStyle}>
            {note}{count > 1 ? ` (${count})` : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NotesHit;
