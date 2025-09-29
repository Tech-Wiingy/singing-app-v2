# Audio Files Directory

This directory is for storing audio files that will be used in your React application.

## Supported Formats
- **MP3** (.mp3) - Most widely supported
- **WAV** (.wav) - High quality, larger file size
- **OGG** (.ogg) - Good compression, open format
- **M4A** (.m4a) - Good quality and compression
- **AAC** (.aac) - Good compression

## Usage Examples

### Basic Usage
```javascript
import audioFile from './audio/my-sound.mp3';
import { playAudio } from '../utils/audioPlayer';

// Simple play
await playAudio(audioFile);
```

### With Options
```javascript
await playAudio(audioFile, {
  volume: 0.7,
  loop: true,
  fadeIn: true,
  onEnd: () => console.log('Audio finished')
});
```

## File Organization
Consider organizing your audio files by category:
```
audio/
├── music/
│   ├── background-music.mp3
│   └── theme-song.wav
├── sfx/
│   ├── click.mp3
│   ├── notification.wav
│   └── success.mp3
└── voice/
    ├── welcome.mp3
    └── instructions.wav
```

## Performance Tips
1. **Optimize file sizes** - Use appropriate compression for your use case
2. **Preload important audio** - Load critical sounds early in your app
3. **Use MP3 for compatibility** - Best browser support across all platforms
4. **Consider lazy loading** - Only load audio when needed for better performance

## Browser Compatibility
- **MP3**: Supported by all modern browsers
- **WAV**: Widely supported, larger files
- **OGG**: Good support, not supported by Safari
- **M4A/AAC**: Good support on most browsers

## Legal Considerations
- Ensure you have the rights to use all audio files
- Consider licensing requirements for commercial use
- Provide proper attribution if required







